import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { BaseDashboardDto } from './dto/base-dashboard.dto';

@ApiTags('Dashboards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get Admin Dashboard metrics' })
  @ApiResponse({ type: BaseDashboardDto })
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('reception')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get Reception Dashboard metrics' })
  @ApiResponse({ type: BaseDashboardDto })
  getReceptionDashboard() {
    return this.dashboardService.getReceptionDashboard();
  }

  @Get('lab')
  @Roles(Role.ADMIN, Role.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Get Lab Technician Dashboard metrics' })
  @ApiResponse({ type: BaseDashboardDto })
  getLabDashboard() {
    return this.dashboardService.getLabDashboard();
  }

  @Get('doctor')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get Internal Doctor Dashboard metrics' })
  @ApiResponse({ type: BaseDashboardDto })
  getDoctorDashboard() {
    return this.dashboardService.getDoctorDashboard();
  }

  @Get('referral')
  @Roles(Role.REFERRAL_DOCTOR)
  @ApiOperation({ summary: 'Get Referral Doctor Dashboard metrics' })
  @ApiResponse({ type: BaseDashboardDto })
  getReferralDashboard(@Req() req: any) {
    return this.dashboardService.getReferralDashboard(req.user.id);
  }
}
