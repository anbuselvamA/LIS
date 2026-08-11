import { Controller, Get, Post, Body, Param, Put, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SampleService } from './sample.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Samples')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('samples')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.LAB_TECHNICIAN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new sample' })
  @ApiResponse({ status: 201, description: 'Sample successfully created with barcode.' })
  @ApiResponse({ status: 400, description: 'Sample already exists or invalid OrderItem.' })
  @ApiResponse({ status: 404, description: 'OrderItem not found.' })
  create(@Body() createSampleDto: CreateSampleDto) {
    return this.sampleService.create(createSampleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all samples' })
  @ApiResponse({ status: 200, description: 'List of all samples.' })
  findAll() {
    return this.sampleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a sample by ID' })
  @ApiResponse({ status: 200, description: 'The requested sample with details.' })
  @ApiResponse({ status: 404, description: 'Sample not found.' })
  findOne(@Param('id') id: string) {
    return this.sampleService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.LAB_TECHNICIAN)
  @ApiOperation({ summary: 'Update a sample status or details' })
  @ApiResponse({ status: 200, description: 'Sample successfully updated.' })
  @ApiResponse({ status: 404, description: 'Sample not found.' })
  update(@Param('id') id: string, @Body() updateSampleDto: UpdateSampleDto) {
    return this.sampleService.update(id, updateSampleDto);
  }
}
