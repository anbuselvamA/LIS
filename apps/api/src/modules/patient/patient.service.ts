import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getNextSequenceValue } from '../../utils/sequence.util';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    if (createPatientDto.phone && !createPatientDto.forceCreate) {
      // Normalize phone by removing spaces, dashes, and +91 prefix
      const normPhone = createPatientDto.phone.replace(/[\s-]/g, '').replace(/^\+91/, '');
      
      const existingPatients = await this.prisma.patient.findMany({
        where: { phone: { not: null } }
      });
      
      const existingPatient = existingPatients.find(p => {
        if (!p.phone) return false;
        const pNormPhone = p.phone.replace(/[\s-]/g, '').replace(/^\+91/, '');
        return pNormPhone === normPhone;
      });

      if (existingPatient) {
        throw new ConflictException({
          message: 'Patient with this phone number already exists',
          existingPatient: {
            id: existingPatient.id,
            mrn: existingPatient.mrn,
            firstName: existingPatient.firstName,
            lastName: existingPatient.lastName,
            phone: existingPatient.phone,
            dateOfBirth: existingPatient.dateOfBirth,
            gender: existingPatient.gender
          }
        });
      }
    }

    const MRN_START = 1001;
    const MRN_PREFIX = 'MRN-';

    const nextSequence = await getNextSequenceValue(this.prisma, 'MRN', MRN_START);
    const mrn = `${MRN_PREFIX}${nextSequence}`;
    
    // Remove forceCreate before saving to Prisma since it is not in the schema
    const { forceCreate, ...patientData } = createPatientDto;
    const dataToSave = { ...patientData, mrn };
    if (dataToSave.dateOfBirth) {
      dataToSave.dateOfBirth = new Date(dataToSave.dateOfBirth) as any;
    }

    return this.prisma.patient.create({
      data: dataToSave,
    });
  }

  async findAll() {
    // Select only fields needed by the patient list page
    return this.prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        mrn: true,
        firstName: true,
        lastName: true,
        gender: true,
        phone: true,
        dateOfBirth: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string, user?: any) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { items: true } } }
        }
      }
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Data Isolation for Referral Doctors
    if (user?.role === 'REFERRAL_DOCTOR') {
      if (patient.registeredByUserId !== user.id) {
        // Enforce ownership: Return generic not found or forbidden
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    // Verify patient exists first
    await this.findOne(id);

    // MRN is immutable — never allow it to be updated.
    // Only demographic fields (firstName, lastName, dateOfBirth, gender, phone, email) are updatable.
    const dataToUpdate = { ...updatePatientDto };
    if (dataToUpdate.dateOfBirth) {
       dataToUpdate.dateOfBirth = new Date(dataToUpdate.dateOfBirth) as any;
    }

    return this.prisma.patient.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async searchPatients(query: string, user?: any) {
    if (!query) return [];
    const normalizedQuery = query.toLowerCase().replace(/[\s-]/g, '').replace(/^\+91/, '');

    const dbWhere: any = {
      OR: [
        { mrn: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
      ]
    };

    if (user?.role === 'REFERRAL_DOCTOR') {
      dbWhere.registeredByUserId = user.id;
    }

    // For database query, we fetch records that might match name or MRN
    const dbPatients = await this.prisma.patient.findMany({
      where: dbWhere,
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { items: true } } }
        }
      }
    });

    // We also fetch all patients and filter by phone in memory due to the normalization logic required 
    // (since Prisma doesn't natively support regex replaces in Postgres without raw SQL).
    const phoneWhere: any = { phone: { not: null } };
    if (user?.role === 'REFERRAL_DOCTOR') {
      phoneWhere.registeredByUserId = user.id;
    }

    const allPatientsForPhone = await this.prisma.patient.findMany({
      where: phoneWhere,
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { items: true } } }
        }
      }
    });

    const phoneMatches = allPatientsForPhone.filter(p => {
      if (!p.phone) return false;
      const pNormPhone = p.phone.replace(/[\s-]/g, '').replace(/^\+91/, '');
      return pNormPhone.includes(normalizedQuery);
    });

    // Merge and deduplicate
    const combined = [...dbPatients, ...phoneMatches];
    const uniquePatients = Array.from(new Map(combined.map(item => [item.id, item])).values());

    return uniquePatients.slice(0, 10); // Return top 10 results
  }
}
