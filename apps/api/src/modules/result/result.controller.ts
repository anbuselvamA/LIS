import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('results')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post()
  @Roles(Role.ADMIN, Role.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Enter a new result for a sample' })
  @ApiResponse({ status: 201, description: 'Result entered successfully.' })
  @ApiResponse({ status: 400, description: 'Sample not received.' })
  @ApiResponse({ status: 404, description: 'Sample not found.' })
  create(@Body() createResultDto: CreateResultDto, @Request() req) {
    return this.resultService.create(createResultDto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all results' })
  @ApiResponse({ status: 200, description: 'List of all results.' })
  findAll() {
    return this.resultService.findAll();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Retrieve all unverified results' })
  @ApiResponse({ status: 200, description: 'List of pending results.' })
  findPending() {
    return this.resultService.findPending();
  }

  @Get('verified')
  @ApiOperation({ summary: 'Retrieve all verified results' })
  @ApiResponse({ status: 200, description: 'List of verified results.' })
  findVerified() {
    return this.resultService.findVerified();
  }

  @Get('ready')
  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  @ApiOperation({ summary: 'Retrieve all ready to print results (Reception)' })
  @ApiResponse({ status: 200, description: 'List of ready results.' })
  findReady(@Request() req) {
    return this.resultService.findReady(req.user?.id);
  }

  @Post('ready/:id/view')
  @Roles(Role.RECEPTIONIST, Role.ADMIN)
  @ApiOperation({ summary: 'Mark a ready report as viewed' })
  @ApiResponse({ status: 200, description: 'Report marked as viewed.' })
  markReportViewed(@Param('id') id: string, @Request() req) {
    return this.resultService.markReportAsViewed(id, req.user?.id);
  }

  @Get('referral')
  @Roles(Role.REFERRAL_DOCTOR)
  @ApiOperation({ summary: 'Retrieve verified results for the logged-in referral doctor' })
  @ApiResponse({ status: 200, description: 'List of referral results.' })
  findReferral(@Request() req) {
    return this.resultService.findReferral(req.user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a result by ID' })
  @ApiResponse({ status: 200, description: 'Result found.' })
  @ApiResponse({ status: 404, description: 'Result not found.' })
  findOne(@Param('id') id: string) {
    return this.resultService.findOne(id);
  }

  @Put(':id/verify')
  @Roles(Role.DOCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Verify a result (Doctor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Result verified successfully.' })
  @ApiResponse({ status: 400, description: 'Result already verified or not in ENTERED state.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Doctor or Admin role.' })
  verify(@Param('id') id: string, @Request() req) {
    return this.resultService.verify(id, req.user?.id);
  }

  @Put(':id/reject')
  @Roles(Role.DOCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Reject a result (Doctor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Result rejected successfully.' })
  @ApiResponse({ status: 400, description: 'Result not in ENTERED state.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Doctor or Admin role.' })
  reject(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
    return this.resultService.reject(id, reason, req.user?.id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Update a result' })
  @ApiResponse({ status: 200, description: 'Result updated successfully.' })
  @ApiResponse({ status: 404, description: 'Result not found.' })
  update(@Param('id') id: string, @Body() updateResultDto: UpdateResultDto) {
    return this.resultService.update(id, updateResultDto);
  }
}
