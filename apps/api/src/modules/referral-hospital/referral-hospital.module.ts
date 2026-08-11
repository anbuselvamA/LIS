import { Module } from '@nestjs/common';
import { ReferralHospitalService } from './referral-hospital.service';
import { ReferralHospitalController } from './referral-hospital.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReferralHospitalController],
  providers: [ReferralHospitalService],
  exports: [ReferralHospitalService],
})
export class ReferralHospitalModule {}
