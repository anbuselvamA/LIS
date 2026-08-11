import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Test Catalogue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new test in the catalogue (Admin only)' })
  @ApiResponse({ status: 201, description: 'Test successfully created.' })
  @ApiResponse({ status: 409, description: 'Test code already exists.' })
  create(@Body() createTestDto: CreateTestDto) {
    return this.testService.create(createTestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all tests in the catalogue (Pagination prepared)' })
  @ApiResponse({ status: 200, description: 'List of all tests.' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.testService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a test by ID' })
  @ApiResponse({ status: 200, description: 'The requested test.' })
  @ApiResponse({ status: 404, description: 'Test not found.' })
  findOne(@Param('id') id: string) {
    return this.testService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a test by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'The updated test.' })
  @ApiResponse({ status: 404, description: 'Test not found.' })
  update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    return this.testService.update(id, updateTestDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate a test by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Test deactivated successfully.' })
  @ApiResponse({ status: 404, description: 'Test not found.' })
  remove(@Param('id') id: string) {
    return this.testService.remove(id);
  }
}
