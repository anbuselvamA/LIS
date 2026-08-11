import { Controller, Get, Post, Body, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ReferralDoctorService } from './referral-doctor.service';
import { CreateReferralDoctorDto } from './dto/create-referral-doctor.dto';
import { UpdateReferralDoctorDto } from './dto/update-referral-doctor.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Referral Doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('referral-doctors')
export class ReferralDoctorController {
  constructor(private readonly referralDoctorService: ReferralDoctorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Referral Doctor' })
  create(@Body() createReferralDoctorDto: CreateReferralDoctorDto) {
    return this.referralDoctorService.create(createReferralDoctorDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get all Referral Doctors (Pagination prepared)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.referralDoctorService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Get a specific Referral Doctor by ID' })
  findOne(@Param('id') id: string) {
    return this.referralDoctorService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Referral Doctor' })
  update(@Param('id') id: string, @Body() updateReferralDoctorDto: UpdateReferralDoctorDto) {
    return this.referralDoctorService.update(id, updateReferralDoctorDto);
  }
}
