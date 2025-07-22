import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { UserRepository } from '../../application/ports';
import { User, UserEmail, UserStatus, UserRole } from '../../domain';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email.getValue(),
        emailVerified: user.status === UserStatus.ACTIVE,
        password: user.password,
        nickname: user.nickname,
        status: user.status,
        role: user.role,
        updatedAt: user.updatedAt
      },
      create: {
        id: user.id,
        email: user.email.getValue(),
        emailVerified: user.status === UserStatus.ACTIVE,
        password: user.password,
        nickname: user.nickname,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  }

  async findById(id: bigint): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id }
    });

    return prismaUser ? this.toDomainModel(prismaUser) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    return prismaUser ? this.toDomainModel(prismaUser) : null;
  }

  async findByNickname(nickname: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { nickname }
    });

    return prismaUser ? this.toDomainModel(prismaUser) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase() }
    });

    return count > 0;
  }

  async existsByNickname(nickname: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { nickname }
    });

    return count > 0;
  }

  private toDomainModel(prismaUser: PrismaUser): User {
    return User.create({
      id: prismaUser.id,
      email: UserEmail.create(prismaUser.email),
      password: prismaUser.password,
      nickname: prismaUser.nickname,
      status: prismaUser.status as UserStatus,
      role: prismaUser.role as UserRole,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt
    });
  }
}