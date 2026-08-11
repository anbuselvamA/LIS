import { Controller, Get, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { ReferralHospitalService } from './referral-hospital.service';
import { CreateReferralHospitalDto } from './dto/create-referral-hospital.dto';
import { UpdateReferralHospitalDto } from './dto/update-referral-hospital.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Referral Hospitals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('referral-hospitals')
export class ReferralHospitalController {
  constructor(private readonly referralHospitalService: ReferralHospitalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Referral Hospital' })
  create(@Body() createReferralHospitalDto: CreateReferralHospitalDto) {
    return this.referralHospitalService.create(createReferralHospitalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Referral Hospitals' })
  findAll() {
    return this.referralHospitalService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific Referral Hospital by ID' })
  findOne(@Param('id') id: string) {
    return this.referralHospitalService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Referral Hospital' })
  update(@Param('id') id: string, @Body() updateReferralHospitalDto: UpdateReferralHospitalDto) {
    return this.referralHospitalService.update(id, updateReferralHospitalDto);
  }
}
