import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { BarcodeService } from '../barcode/barcode.service';

@Injectable()
export class SampleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly barcodeService: BarcodeService
  ) {}

  async create(createSampleDto: CreateSampleDto) {
    // Verify OrderItem exists
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: createSampleDto.orderItemId }
    });

    if (!orderItem) {
      throw new NotFoundException('OrderItem not found');
    }

    if (orderItem.testOrderId !== createSampleDto.testOrderId) {
      throw new BadRequestException('OrderItem does not belong to the specified TestOrder');
    }

    // Check if a sample already exists for this order item
    const existingSample = await this.prisma.sample.findUnique({
      where: { orderItemId: createSampleDto.orderItemId }
    });

    if (existingSample) {
      throw new BadRequestException('A sample already exists for this OrderItem');
    }

    // Generate Barcode and SampleNumber
    const uniqueSuffix = `${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const barcode = `BAR-${uniqueSuffix}`;
    const sampleNumber = `SMP-${uniqueSuffix}`;

    // Create Sample in Database
    const sample = await this.prisma.sample.create({
      data: {
        barcode,
        sampleNumber,
        testOrderId: createSampleDto.testOrderId,
        orderItemId: createSampleDto.orderItemId,
        status: createSampleDto.status || 'COLLECTED'
      }
    });

    // Generate Barcode Image using BarcodeService
    await this.barcodeService.generateAndSaveBarcode(barcode);

    return {
      ...sample,
      barcodeImageUrl: `/barcodes/${sample.id}/image`
    };
  }

  async findAll() {
    const samples = await this.prisma.sample.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orderItem: {
          select: { testNameSnapshot: true }
        },
        testOrder: {
          include: { patient: true }
        }
      }
    });

    return samples.map(sample => ({
      ...sample,
      barcodeImageUrl: `/barcodes/${sample.id}/image`
    }));
  }

  async findOne(id: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      include: {
        orderItem: true,
        testOrder: {
          include: { patient: true }
        },
        _count: {
          select: { results: true }
        }
      }
    });
    
    if (!sample) {
      throw new NotFoundException(`Sample with ID ${id} not found`);
    }
    
    return {
      ...sample,
      barcodeImageUrl: `/barcodes/${sample.id}/image`
    };
  }

  async update(id: string, updateSampleDto: UpdateSampleDto) {
    // Lightweight existence check — avoids the full JOIN done by findOne()
    const exists = await this.prisma.sample.findUnique({
      where: { id },
      select: { id: true }
    });
    if (!exists) throw new NotFoundException(`Sample with ID ${id} not found`);
    if (updateSampleDto.status === 'COMPLETED') {
      throw new BadRequestException('Cannot manually complete a sample. Samples are automatically completed when results are entered.');
    }
    
    return this.prisma.sample.update({
      where: { id },
      data: updateSampleDto
    });
  }
}
