import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpStatus, HttpCode, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TestOrderService } from './test-order.service';
import { CreateTestOrderDto } from './dto/create-test-order.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Test Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class TestOrderController {
  constructor(private readonly testOrderService: TestOrderService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new test order' })
  @ApiResponse({ status: 201, description: 'Test order successfully created.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  @ApiResponse({ status: 400, description: 'Invalid tests.' })
  create(@Body() createTestOrderDto: CreateTestOrderDto) {
    return this.testOrderService.create(createTestOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all test orders (Pagination prepared)' })
  @ApiResponse({ status: 200, description: 'List of all test orders.' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.testOrderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a test order by ID' })
  @ApiResponse({ status: 200, description: 'The requested test order with its items.' })
  @ApiResponse({ status: 404, description: 'Test order not found.' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.testOrderService.findOne(id, req.user);
  }
}
