import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient;

  constructor() {
    // Check if using Turso (libsql://) or local SQLite (file:)
    const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

    if (databaseUrl.startsWith('libsql://')) {
      // Use Turso with libSQL adapter
      const libsql = createClient({
        url: databaseUrl.split('?')[0], // URL without query params
        authToken: databaseUrl.includes('authToken=')
          ? databaseUrl.split('authToken=')[1].split('&')[0]
          : undefined,
      });

      const adapter = new PrismaLibSQL(libsql);
      super({ adapter });
      this.client = this as PrismaClient;
    } else {
      // Use local SQLite
      super();
      this.client = this as PrismaClient;
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
