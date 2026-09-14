import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ensureSqliteSchema, seedAppData } from './bootstrap-db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    const url = process.env.DATABASE_URL || '';
    if (url.startsWith('file:')) {
      await ensureSqliteSchema(this);
      await seedAppData(this);
    }
  }
}
