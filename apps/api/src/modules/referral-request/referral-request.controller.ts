import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ReferralRequestService } from './referral-request.service';
import { CreateReferralRequestDto, UpdateReferralRequestStatusDto } from './dto/create-referral-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Referral Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('referrals')
export class ReferralRequestController {
  constructor(private readonly referralRequestService: ReferralRequestService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.REFERRAL_DOCTOR)
  @ApiOperation({ summary: 'Create a new Referral Request' })
  async create(@Body() createReferralRequestDto: CreateReferralRequestDto, @Req() req: any) {
    createReferralRequestDto.createdBy = req.user.id;
    return this.referralRequestService.create(createReferralRequestDto, req.user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.LAB_TECHNICIAN, Role.REFERRAL_DOCTOR)
  @ApiOperation({ summary: 'Get all Referral Requests' })
  findAll(@Req() req: any) {
    return this.referralRequestService.findAll(req.user);
  }

  @Get(':idOrNumber')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.LAB_TECHNICIAN, Role.REFERRAL_DOCTOR)
  @ApiOperation({ summary: 'Get a Referral Request by ID or Referral Number' })
  findOne(@Param('idOrNumber') idOrNumber: string, @Req() req: any) {
    return this.referralRequestService.findOne(idOrNumber, req.user);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Update Referral Request Status' })
  updateStatus(
    @Param('id') id: string, 
    @Body() updateDto: UpdateReferralRequestStatusDto,
    @Req() req: any
  ) {
    if (updateDto.status === 'REPORT_SHARED') {
      updateDto.sharedBy = req.user.userId;
    }
    return this.referralRequestService.updateStatus(id, updateDto);
  }
}
