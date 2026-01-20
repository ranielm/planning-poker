import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private _client: PrismaClient | null = null;

  async onModuleInit() {
    const databaseUrl = process.env.DATABASE_URL || '';

    try {
      if (databaseUrl.startsWith('libsql://')) {
        this.logger.log('🔗 Initializing Turso remote database...');

        // Parse URL and auth token
        const urlObj = new URL(databaseUrl);
        const baseUrl = `libsql://${urlObj.host}`;
        const authToken = urlObj.searchParams.get('authToken') || process.env.TURSO_AUTH_TOKEN;

        this.logger.log(`📍 Turso URL: ${baseUrl}`);
        this.logger.log(`🔑 Auth token present: ${!!authToken}`);

        if (!authToken) {
          throw new Error('TURSO_AUTH_TOKEN not found in DATABASE_URL or environment');
        }

        // Dynamic import to avoid issues with bundling
        const { PrismaLibSql } = await import('@prisma/adapter-libsql');

        const adapter = new PrismaLibSql({ url: baseUrl, authToken });
        this._client = new PrismaClient({ adapter } as any);

        await this._client.$connect();
        this.logger.log('✅ Connected to Turso remote database');
      } else {
        this.logger.log('📁 Initializing local SQLite database...');
        this._client = new PrismaClient({
          log: process.env.NODE_ENV === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['error'],
        });
        await this._client.$connect();
        this.logger.log('✅ Connected to local SQLite database');
      }
    } catch (error) {
      this.logger.error('❌ Failed to connect to database');
      this.logger.error(error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this._client) {
      await this._client.$disconnect();
    }
  }

  private get client(): PrismaClient {
    if (!this._client) {
      throw new Error('PrismaClient not initialized. Did you forget to call onModuleInit?');
    }
    return this._client;
  }

  // Expose Prisma models via getters
  get user() {
    return this.client.user;
  }

  get session() {
    return this.client.session;
  }

  get refreshToken() {
    return this.client.refreshToken;
  }

  get room() {
    return this.client.room;
  }

  get participant() {
    return this.client.participant;
  }

  get round() {
    return this.client.round;
  }

  get vote() {
    return this.client.vote;
  }

  // Expose $queryRaw for raw SQL queries
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Promise<T> {
    return this.client.$queryRaw(query, ...values);
  }

  // Expose $transaction for complex operations
  $transaction<T>(fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<T> {
    return this.client.$transaction(fn);
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }

    await this.client.vote.deleteMany();
    await this.client.participant.deleteMany();
    await this.client.room.deleteMany();
    await this.client.refreshToken.deleteMany();
    await this.client.session.deleteMany();
    await this.client.user.deleteMany();
  }
}
