import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly _client: PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error'
  >;

  constructor() {
    this._client = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  get user() {
    return this._client.user;
  }

  async onModuleInit(): Promise<void> {
    await this._client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this._client.$disconnect();
  }
}
