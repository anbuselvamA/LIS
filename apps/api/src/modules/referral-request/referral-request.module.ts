import { Module } from '@nestjs/common';
import { ReferralRequestService } from './referral-request.service';
import { ReferralRequestController } from './referral-request.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReferralRequestController],
  providers: [ReferralRequestService],
  exports: [ReferralRequestService],
})
export class ReferralRequestModule {}
