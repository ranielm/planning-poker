import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private _client: PrismaClient;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL || '';

    if (databaseUrl.startsWith('libsql://')) {
      // Turso remote database - use libSQL adapter
      this.logger.log('🔗 Initializing Turso remote database...');

      const url = databaseUrl.split('?')[0];
      const authToken = databaseUrl.includes('authToken=')
        ? databaseUrl.split('authToken=')[1].split('&')[0]
        : process.env.TURSO_AUTH_TOKEN;

      const adapter = new PrismaLibSql({ url, authToken });
      this._client = new PrismaClient({ adapter } as any);
    } else {
      // Local SQLite file
      this.logger.log('📁 Initializing local SQLite database...');
      this._client = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      });
    }
  }

  async onModuleInit() {
    try {
      await this._client.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this._client.$disconnect();
  }

  // Expose Prisma models via getters
  get user() {
    return this._client.user;
  }

  get session() {
    return this._client.session;
  }

  get refreshToken() {
    return this._client.refreshToken;
  }

  get room() {
    return this._client.room;
  }

  get participant() {
    return this._client.participant;
  }

  get round() {
    return this._client.round;
  }

  get vote() {
    return this._client.vote;
  }

  // Expose $queryRaw for raw SQL queries
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Promise<T> {
    return this._client.$queryRaw(query, ...values);
  }

  // Expose $transaction for complex operations
  $transaction<T>(fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<T> {
    return this._client.$transaction(fn);
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }

    await this._client.vote.deleteMany();
    await this._client.participant.deleteMany();
    await this._client.room.deleteMany();
    await this._client.refreshToken.deleteMany();
    await this._client.session.deleteMany();
    await this._client.user.deleteMany();
  }
}
