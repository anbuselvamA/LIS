import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { SampleStatus, ResultStatus, EntryMode } from '@prisma/client';

@Injectable()
export class ResultService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResultDto: CreateResultDto, userId?: string) {
    // 1. Verify Sample exists
    const sample = await this.prisma.sample.findUnique({
      where: { id: createResultDto.sampleId }
    });

    if (!sample) {
      throw new NotFoundException('Sample not found');
    }

    // 2. Sample Status must not be REJECTED before entering results
    if (sample.status === 'REJECTED' as SampleStatus) {
      throw new BadRequestException(`Cannot enter results. Sample status is REJECTED.`);
    }

    // 3. Set Defaults and Create
    const result = await this.prisma.result.create({
      data: {
        sampleId: createResultDto.sampleId,
        parameterCode: createResultDto.parameterCode,
        parameterName: createResultDto.parameterName,
        resultValue: createResultDto.resultValue,
        unit: createResultDto.unit || '',
        referenceRange: createResultDto.referenceRange || '',
        abnormalFlag: createResultDto.abnormalFlag || 'NORMAL',
        interpretation: createResultDto.interpretation,
        remarks: createResultDto.remarks,
        resultStatus: ResultStatus.ENTERED, // Always ENTERED, cannot be VERIFIED yet
        entryMode: createResultDto.entryMode || EntryMode.MANUAL, // Default MANUAL
        enteredBy: userId,
      }
    });

    // 4. Update Sample Status to COMPLETED
    await this.prisma.sample.update({
      where: { id: sample.id },
      data: { status: SampleStatus.COMPLETED }
    });
    
    // 5. Update OrderItem Status to RESULT_ENTERED
    await this.prisma.orderItem.update({
      where: { id: sample.orderItemId },
      data: { status: 'RESULT_ENTERED' }
    });

    return result;
  }

  findAll() {
    return this.prisma.result.findMany({
      orderBy: { createdAt: 'desc' },
      // Use select instead of full include to reduce payload
      include: {
        sample: {
          select: {
            id: true,
            barcode: true,
            sampleNumber: true,
            status: true,
            testOrderId: true,
            orderItemId: true,
          }
        }
      }
    });
  }

  findPending() {
    // Deep include needed: doctor queue displays patient name, barcode, test name, order number
    return this.prisma.result.findMany({
      where: { resultStatus: ResultStatus.ENTERED },
      orderBy: { createdAt: 'desc' },
      include: {
        sample: {
          include: {
            orderItem: { select: { testNameSnapshot: true } },
            testOrder: {
              include: {
                patient: {
                  select: { id: true, firstName: true, lastName: true, mrn: true }
                }
              }
            }
          }
        }
      }
    });
  }

  findVerified() {
    return this.prisma.result.findMany({
      where: { resultStatus: ResultStatus.VERIFIED },
      orderBy: { createdAt: 'desc' },
      include: { sample: true }
    });
  }

  async findReady(userId?: string) {
    const orders = await this.prisma.testOrder.findMany({
      where: {
        referralRequestId: null,
        items: {
          some: {}, // Must have at least one item
          every: {
            status: { in: ['APPROVED', 'REPORTED'] }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
        items: {
          include: {
            sample: {
              include: {
                results: true
              }
            }
          }
        },
        reportViews: userId ? {
          where: { userId }
        } : false
      }
    });

    return orders.map(order => ({
      ...order,
      isNew: order.reportViews ? order.reportViews.length === 0 : true,
      viewedAt: order.reportViews && order.reportViews.length > 0 ? order.reportViews[0].viewedAt : null,
      reportViews: undefined // hide from payload
    }));
  }

  async markReportAsViewed(orderId: string, userId: string) {
    return this.prisma.reportView.upsert({
      where: {
        userId_orderId: {
          userId,
          orderId
        }
      },
      update: {
        viewedAt: new Date()
      },
      create: {
        userId,
        orderId,
        viewedAt: new Date()
      }
    });
  }

  findReferral(userId: string) {
    return this.prisma.result.findMany({
      where: { 
        resultStatus: ResultStatus.VERIFIED,
        sample: {
          testOrder: {
            referralRequest: {
              referralDoctor: {
                userId: userId
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      include: { 
        sample: {
          include: {
            testOrder: {
              include: {
                patient: true
              }
            }
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.result.findUnique({
      where: { id },
      include: { sample: true }
    });

    if (!result) {
      throw new NotFoundException(`Result with ID ${id} not found`);
    }

    return result;
  }

  async update(id: string, updateResultDto: UpdateResultDto) {
    await this.findOne(id); // verify exists
    
    return this.prisma.result.update({
      where: { id },
      data: updateResultDto
    });
  }

  async verify(id: string, userId: string) {
    const result = await this.findOne(id);

    if (result.resultStatus !== ResultStatus.ENTERED) {
      throw new BadRequestException(`Result cannot be verified. Current status is ${result.resultStatus}. Expected: ENTERED`);
    }

    const updatedResult = await this.prisma.result.update({
      where: { id },
      data: {
        resultStatus: ResultStatus.VERIFIED,
        verifiedBy: userId,
        verifiedAt: new Date()
      }
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'VERIFY_RESULT',
        entity: 'Result',
        entityId: id,
        oldValue: { status: result.resultStatus },
        newValue: { status: ResultStatus.VERIFIED }
      }
    });
    
    // Update OrderItem status to APPROVED
    await this.prisma.orderItem.update({
      where: { id: result.sample.orderItemId },
      data: { status: 'APPROVED' }
    });

    // Check if this belongs to a referral and if all tests are verified
    if (result.sample.testOrderId) {
      const order = await this.prisma.testOrder.findUnique({
        where: { id: result.sample.testOrderId },
        include: { items: true }
      });
      
      if (order && order.referralRequestId) {
        const allVerified = order.items.every(item => item.status === 'APPROVED' || item.status === 'REPORTED');
        if (allVerified) {
          await this.prisma.referralRequest.update({
            where: { id: order.referralRequestId },
            data: { status: 'RESULT_READY' }
          });
        }
      }
    }

    return updatedResult;
  }

  async reject(id: string, reason: string, userId: string) {
    const result = await this.findOne(id);

    if (result.resultStatus !== ResultStatus.ENTERED) {
      throw new BadRequestException(`Result cannot be rejected. Current status is ${result.resultStatus}. Expected: ENTERED`);
    }

    const newRemarks = result.remarks ? `${result.remarks}\n[Rejected by Doctor]: ${reason}` : `[Rejected by Doctor]: ${reason}`;

    const updatedResult = await this.prisma.result.update({
      where: { id },
      data: {
        resultStatus: ResultStatus.PENDING,
        remarks: newRemarks,
        verifiedBy: null,
        verifiedAt: null
      }
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'REJECT_RESULT',
        entity: 'Result',
        entityId: id,
        oldValue: { status: result.resultStatus },
        newValue: { status: ResultStatus.PENDING, reason }
      }
    });

    return updatedResult;
  }
}
