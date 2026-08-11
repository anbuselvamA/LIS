import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getNextSequenceValue } from '../../utils/sequence.util';
import { CreateTestOrderDto } from './dto/create-test-order.dto';
import { BarcodeService } from '../barcode/barcode.service';

@Injectable()
export class TestOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly barcodeService: BarcodeService
  ) {}

  async create(createTestOrderDto: CreateTestOrderDto) {
    let generatedBarcodes: string[] = [];

    try {
      const resultOrder = await this.prisma.$transaction(async (tx) => {
      // 1. Verify Patient exists
      const patient = await tx.patient.findUnique({ where: { id: createTestOrderDto.patientId } });
      if (!patient) throw new NotFoundException('Patient not found');

      // 2. Fetch all requested tests from Catalogue to get their snapshots (name, price)
      const testIds = createTestOrderDto.items.map(item => item.testId);
      const tests = await tx.test.findMany({
        where: { id: { in: testIds }, isActive: true }
      });

      if (tests.length !== testIds.length) {
        throw new BadRequestException('One or more tests are invalid or inactive');
      }

      // 3. Calculate total amount and prepare order items
      let totalAmount = 0;
      const orderItemsData = tests.map(test => {
        totalAmount += test.price;
        return {
          testId: test.id,
          testNameSnapshot: test.testName,
          unitPrice: test.price,
        };
      });

      // 3.5 Generate Backend Order Number if not provided
      let finalOrderNumber = createTestOrderDto.orderNumber;
      if (!finalOrderNumber) {
        const currentYear = new Date().getFullYear();
        const orderNextSeq = await getNextSequenceValue(tx as any, `ORD_${currentYear}`);
        finalOrderNumber = `ORD-${currentYear}-${String(orderNextSeq).padStart(5, '0')}`;
      }

      // 4. Create Order and Items in a transaction
      const order = await tx.testOrder.create({
        data: {
          orderNumber: finalOrderNumber,
          patientId: createTestOrderDto.patientId,
          referringDoctorId: createTestOrderDto.referringDoctorId,
          referralRequestId: createTestOrderDto.referralRequestId,
          totalAmount,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: true,
          patient: true
        }
      });

      // 5 & 6. Generate Sequential Sample and Barcode Numbers for each item
      const currentYear = new Date().getFullYear();
      
      const sampleRecords: any[] = [];
      for (const item of order.items) {
        const nextSeq = await getNextSequenceValue(tx as any, `SMP_${currentYear}`);
        const seqString = String(nextSeq).padStart(5, '0');
        
        const sampleNumber = `SMP-${currentYear}-${seqString}`;
        // Usually Barcode matches the sample number sequentially, so we can use the same sequence logic
        const barcodeSeq = await getNextSequenceValue(tx as any, `BC_${currentYear}`);
        const barcodeSeqString = String(barcodeSeq).padStart(5, '0');
        const barcode = `BC-${currentYear}-${barcodeSeqString}`;
        
        generatedBarcodes.push(barcode);
        
        sampleRecords.push({
          barcode,
          sampleNumber,
          testOrderId: order.id,
          orderItemId: item.id,
          status: 'PENDING' as any // Using Prisma enum equivalent if needed
        });
      }

      await tx.sample.createMany({
        data: sampleRecords
      });

      // 7. If this is a referral order, update the referral status
      if (createTestOrderDto.referralRequestId) {
        await tx.referralRequest.update({
          where: { id: createTestOrderDto.referralRequestId },
          data: { status: 'ORDER_CREATED' }
        });
      }

      return order;
    });

    // 8. Generate barcode images asynchronously outside the transaction
    Promise.all(generatedBarcodes.map(barcode => 
      this.barcodeService.generateAndSaveBarcode(barcode).catch(err => {
        console.error(`Failed to generate barcode image for ${barcode}:`, err);
      })
    ));

      return resultOrder;
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target?.includes('orderNumber')) {
          throw new BadRequestException('Order number collision detected. Please retry.');
        }
        if (target?.includes('sampleNumber') || target?.includes('barcode')) {
          throw new BadRequestException('Sample number or barcode collision detected. Please retry.');
        }
        throw new BadRequestException('Unique constraint failed. Please retry.');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.testOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
        _count: { select: { items: true } }
      }
    });
  }

  async findOne(id: string, user?: any) {
    const order = await this.prisma.testOrder.findUnique({
      where: { id },
      include: {
        patient: true,
        referringDoctor: { select: { id: true, email: true } },
        referralRequest: {
          include: {
            referralDoctor: true
          }
        },
        items: {
          include: {
            test: true,
            sample: {
              include: {
                results: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException(`Test Order with ID ${id} not found`);
    }

    if (user?.role === 'REFERRAL_DOCTOR') {
      const profile = await this.prisma.referralDoctorProfile.findUnique({ where: { userId: user.id } });
      if (!profile) {
        throw new ForbiddenException('Doctor profile not found');
      }
      if (order.referralRequest?.referralDoctorId !== profile.id) {
        throw new ForbiddenException('You are not authorized to view this test order');
      }
    }

    return order;
  }
}
