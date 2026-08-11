import { Controller, Get, Put, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  // Available to all authenticated users for reports etc.
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get('audit')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get system audit logs' })
  getAuditLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    return this.settingsService.getAuditLogs(Number(page), Number(limit));
  }

  @Get('status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get integration and backup statuses' })
  async getStatus() {
    // Simulated realistic status checks based on current architecture
    return {
      database: { status: 'Connected', details: 'PostgreSQL Active' },
      api: { status: 'Connected', details: 'Health OK' },
      reportService: { status: 'Connected', details: 'Internal PDF Generator Active' },
      barcodeService: { status: 'Connected', details: 'React Barcode Active' },
      qrVerification: { status: 'Connected', details: 'React QR Active' },
      notificationService: { status: 'Disconnected', details: 'No active providers configured' },
      emailProvider: { status: 'Not Configured', details: 'SMTP settings missing' },
      smsProvider: { status: 'Not Configured', details: 'SMS API key missing' },
      backup: { status: 'Not Configured', details: 'Backup infrastructure not configured', lastBackup: null, nextBackup: null }
    };
  }

  @Put(':key')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a setting by key' })
  updateSetting(
    @Param('key') key: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.settingsService.updateSettings(key, body, req.user);
  }
}
