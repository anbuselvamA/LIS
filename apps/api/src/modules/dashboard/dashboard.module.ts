import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../database/prisma.module';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [PrismaModule, HealthModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
