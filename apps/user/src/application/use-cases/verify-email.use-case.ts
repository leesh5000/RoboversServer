import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, VerificationCodeRepository } from '../ports';

export interface VerifyEmailCommand {
  userId: string;
  code: string;
}

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('VerificationCodeRepository')
    private readonly verificationCodeRepository: VerificationCodeRepository,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<void> {
    const userId = BigInt(command.userId);

    // 사용자 조회
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    // 이미 인증된 사용자인지 확인
    if (user.isActive()) {
      throw new Error('이미 인증된 사용자입니다');
    }

    // 인증 코드 조회
    const verificationCode =
      await this.verificationCodeRepository.findByUserIdAndCode(
        userId,
        command.code,
      );
    if (!verificationCode) {
      throw new Error('유효하지 않은 인증 코드입니다');
    }

    // 인증 코드 만료 확인
    if (verificationCode.isExpired()) {
      throw new Error('인증 코드가 만료되었습니다');
    }

    // 사용자 활성화
    const activatedUser = user.activate();

    // 변경사항 저장
    await Promise.all([
      this.userRepository.save(activatedUser),
      this.verificationCodeRepository.deleteByUserId(userId),
    ]);
  }
}
