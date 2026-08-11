import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
@Injectable()
export class TestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTestDto: CreateTestDto) {
    const existingTest = await this.prisma.test.findUnique({
      where: { testCode: createTestDto.testCode },
    });

    if (existingTest) {
      throw new ConflictException(`Test with code ${createTestDto.testCode} already exists`);
    }

    return this.prisma.test.create({
      data: createTestDto,
    });
  }

  async findAll() {
    return this.prisma.test.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    return test;
  }

  async update(id: string, updateData: UpdateTestDto) {
    await this.findOne(id); // verify existence

    // If updating testCode, verify uniqueness
    if (updateData.testCode) {
      const existing = await this.prisma.test.findUnique({
        where: { testCode: updateData.testCode },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Test with code ${updateData.testCode} already exists`);
      }
    }

    return this.prisma.test.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // verify existence

    // We do soft delete as per enterprise LIS standard
    return this.prisma.test.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
