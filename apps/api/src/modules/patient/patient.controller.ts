import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpStatus, HttpCode, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient successfully created.' })
  @ApiResponse({ status: 409, description: 'Patient with MRN already exists.' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all patients (Pagination prepared)' })
  @ApiResponse({ status: 200, description: 'List of all patients.' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.patientService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for patients by phone, MRN, or name' })
  @ApiResponse({ status: 200, description: 'Search results.' })
  search(@Query('q') q: string, @Req() req: any) {
    return this.patientService.searchPatients(q, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a patient by ID' })
  @ApiResponse({ status: 200, description: 'The requested patient.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.patientService.findOne(id, req.user);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Update a patient by ID' })
  @ApiResponse({ status: 200, description: 'The updated patient.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiResponse({ status: 409, description: 'Patient with MRN already exists.' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }
}
