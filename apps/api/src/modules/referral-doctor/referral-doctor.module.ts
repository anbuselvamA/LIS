import { Module } from '@nestjs/common';
import { ReferralDoctorService } from './referral-doctor.service';
import { ReferralDoctorController } from './referral-doctor.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReferralDoctorController],
  providers: [ReferralDoctorService],
  exports: [ReferralDoctorService],
})
export class ReferralDoctorModule {}
