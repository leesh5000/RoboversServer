import { Injectable, Inject } from '@nestjs/common';
import { VerificationCode } from '../../domain';
import { UserRepository, VerificationCodeRepository, EmailService } from '../ports';

export interface ResendVerificationCodeCommand {
  email: string;
}

@Injectable()
export class ResendVerificationCodeUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('VerificationCodeRepository') private readonly verificationCodeRepository: VerificationCodeRepository,
    @Inject('EmailService') private readonly emailService: EmailService
  ) {}

  async execute(command: ResendVerificationCodeCommand): Promise<void> {
    // 사용자 조회
    const user = await this.userRepository.findByEmail(command.email.toLowerCase());
    if (!user) {
      // 보안상 존재하지 않는 이메일에 대해서도 동일한 응답
      return;
    }

    // 이미 활성화된 사용자인지 확인
    if (user.isActive()) {
      throw new Error('이미 인증된 사용자입니다');
    }

    // 기존 인증 코드 삭제
    await this.verificationCodeRepository.deleteByUserId(user.id);

    // 새 인증 코드 생성
    const newVerificationCode = VerificationCode.generate();

    // 저장 및 이메일 발송
    await Promise.all([
      this.verificationCodeRepository.save(user.id, newVerificationCode),
      this.emailService.sendVerificationEmail(user.email.getValue(), newVerificationCode.getValue())
    ]);
  }
}