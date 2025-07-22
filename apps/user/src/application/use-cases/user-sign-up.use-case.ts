import { Injectable, Inject } from '@nestjs/common';
import { User, UserEmail, UserStatus, UserRole, VerificationCode } from '../../domain';
import { UserRepository, VerificationCodeRepository, EmailService, PasswordService } from '../ports';
import { SnowflakeFactory, NodeIdStrategy } from '@robovers/common/snowflake';

export interface UserSignUpCommand {
  email: string;
  password: string;
  nickname: string;
}

export interface UserSignUpResult {
  userId: string;
  email: string;
  nickname: string;
}

@Injectable()
export class UserSignUpUseCase {
  private readonly snowflakeGenerator = SnowflakeFactory.create(NodeIdStrategy.ENVIRONMENT);

  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('VerificationCodeRepository') private readonly verificationCodeRepository: VerificationCodeRepository,
    @Inject('EmailService') private readonly emailService: EmailService,
    @Inject('PasswordService') private readonly passwordService: PasswordService
  ) {}

  async execute(command: UserSignUpCommand): Promise<UserSignUpResult> {
    // 이메일 검증
    const email = UserEmail.create(command.email);

    // 중복 검사
    const [emailExists, nicknameExists] = await Promise.all([
      this.userRepository.existsByEmail(email.getValue()),
      this.userRepository.existsByNickname(command.nickname)
    ]);

    if (emailExists) {
      throw new Error('이미 사용 중인 이메일입니다');
    }

    if (nicknameExists) {
      throw new Error('이미 사용 중인 닉네임입니다');
    }

    // 비밀번호 암호화
    const hashedPassword = await this.passwordService.hash(command.password);

    // 사용자 생성
    const user = User.create({
      id: this.snowflakeGenerator.generate(),
      email,
      password: hashedPassword,
      nickname: command.nickname,
      status: UserStatus.PENDING,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 인증 코드 생성
    const verificationCode = VerificationCode.generate();

    // 저장
    await Promise.all([
      this.userRepository.save(user),
      this.verificationCodeRepository.save(user.id, verificationCode),
      this.emailService.sendVerificationEmail(email.getValue(), verificationCode.getValue())
    ]);

    return {
      userId: user.id.toString(),
      email: user.email.getValue(),
      nickname: user.nickname
    };
  }
}