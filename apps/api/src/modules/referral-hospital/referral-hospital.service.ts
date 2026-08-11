import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReferralHospitalDto } from './dto/create-referral-hospital.dto';
import { UpdateReferralHospitalDto } from './dto/update-referral-hospital.dto';

@Injectable()
export class ReferralHospitalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReferralHospitalDto: CreateReferralHospitalDto) {
    return this.prisma.referralHospital.create({
      data: createReferralHospitalDto,
    });
  }

  async findAll() {
    return this.prisma.referralHospital.findMany({
      include: {
        doctors: true,
      },
    });
  }

  async findOne(id: string) {
    const hospital = await this.prisma.referralHospital.findUnique({
      where: { id },
      include: {
        doctors: true,
      },
    });
    if (!hospital) {
      throw new NotFoundException(`ReferralHospital with ID ${id} not found`);
    }
    return hospital;
  }

  async update(id: string, updateReferralHospitalDto: UpdateReferralHospitalDto) {
    await this.findOne(id); // Check existence
    return this.prisma.referralHospital.update({
      where: { id },
      data: updateReferralHospitalDto,
    });
  }
}
