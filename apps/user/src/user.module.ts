import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Controllers
import { AuthController } from './interfaces/controllers/auth.controller';

// Use Cases
import {
  UserSignUpUseCase,
  UserLoginUseCase,
  VerifyEmailUseCase,
  ResendVerificationCodeUseCase
} from './application/use-cases';

// Repositories
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { RedisVerificationCodeRepository } from './infrastructure/repositories/redis-verification-code.repository';

// Services
import { PrismaService } from './infrastructure/services/prisma.service';
import { RedisService } from './infrastructure/services/redis.service';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';
import { JwtServiceImpl } from './infrastructure/services/jwt.service.impl';
import { NodemailerEmailService } from './infrastructure/services/nodemailer-email.service';

// Strategies
import { JwtStrategy } from './interfaces/strategies/jwt.strategy';

// Ports
import {
  UserRepository,
  VerificationCodeRepository,
  PasswordService,
  JwtService,
  EmailService
} from './application/ports';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    })
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    UserSignUpUseCase,
    UserLoginUseCase,
    VerifyEmailUseCase,
    ResendVerificationCodeUseCase,

    // Infrastructure Services
    PrismaService,
    RedisService,
    JwtStrategy,

    // Repository Implementations
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository
    },
    {
      provide: 'VerificationCodeRepository',
      useClass: RedisVerificationCodeRepository
    },

    // Service Implementations
    {
      provide: 'PasswordService',
      useClass: BcryptPasswordService
    },
    {
      provide: 'JwtService',
      useClass: JwtServiceImpl
    },
    {
      provide: 'EmailService',
      useClass: NodemailerEmailService
    }
  ],
  exports: [
    'UserRepository',
    'JwtService'
  ]
})
export class UserModule {}