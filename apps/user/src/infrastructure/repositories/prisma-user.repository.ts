import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { UserRepository } from '../../application/ports';
import { User, UserEmail, UserStatus, UserRole } from '../../domain';
import { User as PrismaUser, Prisma } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    const upsertData: Prisma.UserUpsertArgs = {
      where: { id: user.id },
      update: {
        email: user.email.getValue(),
        emailVerified: user.status === UserStatus.ACTIVE,
        password: user.password,
        nickname: user.nickname,
        status: user.status,
        role: user.role,
        updatedAt: user.updatedAt,
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
        updatedAt: user.updatedAt,
      },
    };

    await this.prisma.user.upsert(upsertData as any);
  }

  async findById(id: bigint): Promise<User | null> {
    const findArgs: Prisma.UserFindUniqueArgs = {
      where: { id },
    };

    const prismaUser = await this.prisma.user.findUnique(findArgs as any) as PrismaUser | null;

    return prismaUser ? this.toDomainModel(prismaUser) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const findArgs: Prisma.UserFindUniqueArgs = {
      where: { email: email.toLowerCase() },
    };

    const prismaUser = await this.prisma.user.findUnique(findArgs as any) as PrismaUser | null;

    return prismaUser ? this.toDomainModel(prismaUser) : null;
  }

  async findByNickname(nickname: string): Promise<User | null> {
    const findArgs: Prisma.UserFindUniqueArgs = {
      where: { nickname },
    };

    const prismaUser = await this.prisma.user.findUnique(findArgs as any) as PrismaUser | null;

    return prismaUser ? this.toDomainModel(prismaUser) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const countArgs: Prisma.UserCountArgs = {
      where: { email: email.toLowerCase() },
    };

    const count = await this.prisma.user.count(countArgs as any);

    return count > 0;
  }

  async existsByNickname(nickname: string): Promise<boolean> {
    const countArgs: Prisma.UserCountArgs = {
      where: { nickname },
    };

    const count = await this.prisma.user.count(countArgs as any);

    return count > 0;
  }

  private toDomainModel(prismaUser: PrismaUser): User {
    // 명시적 타입 검증으로 타입 안전성 확보
    if (!prismaUser || typeof prismaUser !== 'object') {
      throw new Error('Invalid Prisma user data');
    }

    const userStatus = prismaUser.status as UserStatus;
    const userRole = prismaUser.role as UserRole;

    return User.create({
      id: prismaUser.id,
      email: UserEmail.create(prismaUser.email),
      password: prismaUser.password,
      nickname: prismaUser.nickname,
      status: userStatus,
      role: userRole,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
