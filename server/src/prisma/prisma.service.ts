import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async onModuleInit() {
    const databaseUrl = process.env.DATABASE_URL || '';

    try {
      if (databaseUrl.startsWith('libsql://')) {
        this.logger.log('🔗 Connecting to Turso remote database...');
        // For Turso, we need to use the libsql client directly
        // The connection will be handled by the libsql driver
      } else {
        this.logger.log('� Connecting to local SQLite database...');
      }

      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }

    await this.vote.deleteMany();
    await this.participant.deleteMany();
    await this.room.deleteMany();
    await this.session.deleteMany();
    await this.user.deleteMany();
  }
}
