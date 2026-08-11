import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Optional: We can add query logging here in the future
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the PostgreSQL database via Prisma.');
    } catch (error) {
      this.logger.error('Failed to connect to the PostgreSQL database.', error);
      throw error;
    }
  }
}
