import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getNextSequenceValue } from '../../utils/sequence.util';
import { CreateReferralDoctorDto } from './dto/create-referral-doctor.dto';
import { UpdateReferralDoctorDto } from './dto/update-referral-doctor.dto';

@Injectable()
export class ReferralDoctorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReferralDoctorDto: CreateReferralDoctorDto) {
    // Ensure hospital exists
    const hospital = await this.prisma.referralHospital.findUnique({
      where: { id: createReferralDoctorDto.hospitalId },
    });
    if (!hospital) {
      throw new NotFoundException(`ReferralHospital with ID ${createReferralDoctorDto.hospitalId} not found`);
    }

    // Ensure User exists and is a REFERRAL_DOCTOR
    const user = await this.prisma.user.findUnique({
      where: { id: createReferralDoctorDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${createReferralDoctorDto.userId} not found`);
    }
    if (user.role !== 'REFERRAL_DOCTOR') {
      throw new BadRequestException('Linked user must have the REFERRAL_DOCTOR role');
    }

    // Ensure the User doesn't already have a profile
    const existingProfile = await this.prisma.referralDoctorProfile.findUnique({
      where: { userId: createReferralDoctorDto.userId },
    });
    if (existingProfile) {
      throw new ConflictException('This user is already registered as a Referral Doctor.');
    }

    const seq = await getNextSequenceValue(this.prisma, 'REFERRAL_DOCTOR');
    const doctorCode = `RD-${String(seq).padStart(4, '0')}`;

    return this.prisma.referralDoctorProfile.create({
      data: {
        ...createReferralDoctorDto,
        doctorCode, // Overwrite any provided code with absolute backend generation
      },
    });
  }

  async findAll() {
    return this.prisma.referralDoctorProfile.findMany({
      include: {
        hospital: true,
        user: true,
      },
    });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.referralDoctorProfile.findUnique({
      where: { id },
      include: {
        hospital: true,
        user: true,
      },
    });
    if (!doctor) {
      throw new NotFoundException(`ReferralDoctor with ID ${id} not found`);
    }
    return doctor;
  }

  async update(id: string, updateReferralDoctorDto: UpdateReferralDoctorDto) {
    await this.findOne(id); // Check existence
    
    if (updateReferralDoctorDto.hospitalId) {
      const hospital = await this.prisma.referralHospital.findUnique({
        where: { id: updateReferralDoctorDto.hospitalId },
      });
      if (!hospital) {
        throw new NotFoundException(`ReferralHospital with ID ${updateReferralDoctorDto.hospitalId} not found`);
      }
    }

    return this.prisma.referralDoctorProfile.update({
      where: { id },
      data: updateReferralDoctorDto,
    });
  }
}
