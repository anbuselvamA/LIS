import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getNextSequenceValue } from '../../utils/sequence.util';
import { CreateReferralRequestDto, UpdateReferralRequestStatusDto } from './dto/create-referral-request.dto';
import { ReferralStatus } from '@prisma/client';

@Injectable()
export class ReferralRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async getDoctorProfileId(userId: string) {
    const profile = await this.prisma.referralDoctorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new ForbiddenException('Referral doctor profile not found for this user');
    }
    return profile.id;
  }

  async create(createReferralRequestDto: CreateReferralRequestDto, user: any) {
    if (user.role !== 'REFERRAL_DOCTOR') {
      throw new ForbiddenException('Only Referral Doctors can create referral requests');
    }

    const profileId = await this.getDoctorProfileId(user.id);

    return this.prisma.$transaction(async (tx) => {
      // Validate Doctor
      const doctor = await tx.referralDoctorProfile.findUnique({
        where: { id: profileId },
      });
      if (!doctor) {
        throw new NotFoundException(`ReferralDoctor profile not found`);
      }

      // Patient Resolution (Existing vs New)
      let resolvedPatientId = createReferralRequestDto.patientId;

      if (!resolvedPatientId) {
        if (!createReferralRequestDto.patientDetails) {
          throw new BadRequestException('Either patientId or patientDetails must be provided');
        }

        const existingPatientByPhone = await tx.patient.findFirst({
          where: { phone: createReferralRequestDto.patientDetails.phone }
        });
        
        if (existingPatientByPhone) {
           resolvedPatientId = existingPatientByPhone.id;
        } else {
          // Generate new MRN atomically
          const mrnCount = await getNextSequenceValue(tx as any, 'MRN');
          const mrn = `MRN-${String(mrnCount).padStart(4, '0')}`;
          
          const newPatient = await tx.patient.create({
            data: {
              mrn,
              firstName: createReferralRequestDto.patientDetails.firstName,
              lastName: createReferralRequestDto.patientDetails.lastName,
              dateOfBirth: new Date(createReferralRequestDto.patientDetails.dateOfBirth),
              gender: createReferralRequestDto.patientDetails.gender as any,
              phone: createReferralRequestDto.patientDetails.phone,
              email: createReferralRequestDto.patientDetails.email || null,
              registeredByUserId: user.id, // Enforce data isolation architecture
            }
          });
          resolvedPatientId = newPatient.id;
        }
      }

      // Generate sequence number
      // Generate sequence number using PostgreSQL upsert increment
      const year = new Date().getFullYear();
      const count = await getNextSequenceValue(tx as any, `REF_${year}`);
      const nextNum = String(count).padStart(5, '0');
      const referralNumber = `REF-${year}-${nextNum}`;
      
      const testsToConnect = createReferralRequestDto.requestedTestIds?.map(id => ({ id })) || [];

      return tx.referralRequest.create({
        data: {
          referralNumber,
          referralDoctorId: profileId,
          patientId: resolvedPatientId,
          notes: createReferralRequestDto.notes,
          priority: createReferralRequestDto.priority,
          reason: createReferralRequestDto.reason,
          createdBy: createReferralRequestDto.createdBy,
          requestedTests: {
            connect: testsToConnect
          }
        },
        include: {
          referralDoctor: {
            include: {
              hospital: true
            }
          },
          patient: true,
          requestedTests: true
        }
      });
    });
  }

  async findAll(user: any) {
    const where: any = {};
    if (user.role === 'REFERRAL_DOCTOR') {
      where.referralDoctorId = await this.getDoctorProfileId(user.id);
    }

    return this.prisma.referralRequest.findMany({
      where,
      include: {
        referralDoctor: {
          include: {
            hospital: true
          }
        },
        patient: true,
        testOrder: true,
        requestedTests: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(idOrNumber: string, user: any) {
    const request = await this.prisma.referralRequest.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { referralNumber: idOrNumber }
        ]
      },
      include: {
        referralDoctor: {
          include: {
            hospital: true
          }
        },
        patient: true,
        testOrder: true,
        requestedTests: true
      },
    });
    if (!request) {
      throw new NotFoundException(`ReferralRequest with identifier ${idOrNumber} not found`);
    }

    if (user.role === 'REFERRAL_DOCTOR') {
      const profileId = await this.getDoctorProfileId(user.id);
      if (request.referralDoctorId !== profileId) {
        throw new ForbiddenException('You are not authorized to view this referral request');
      }
    }

    return request;
  }

  async updateStatus(id: string, updateDto: UpdateReferralRequestStatusDto) {
    // We pass undefined for user here because updateStatus is only called by ADMIN/RECEPTIONIST
    const request = await this.findOne(id, { role: 'ADMIN' });
    
    // Business Rule: Referral cannot be closed until Report has been shared.
    if (updateDto.status === ReferralStatus.CLOSED) {
      if (request.status !== ReferralStatus.REPORT_SHARED) {
        throw new BadRequestException('Referral cannot be closed until the report has been shared.');
      }
    }

    const updateData: any = { status: updateDto.status };

    if (updateDto.status === ReferralStatus.REPORT_SHARED) {
      updateData.sharedAt = new Date();
      updateData.sharedBy = updateDto.sharedBy;
    } else if (updateDto.status === ReferralStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    return this.prisma.referralRequest.update({
      where: { id },
      data: updateData,
    });
  }
}
