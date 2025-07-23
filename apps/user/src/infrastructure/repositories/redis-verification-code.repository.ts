import { Injectable } from '@nestjs/common';
import { RedisService } from '../services/redis.service';
import { VerificationCodeRepository } from '../../application/ports';
import { VerificationCode } from '../../domain';

@Injectable()
export class RedisVerificationCodeRepository
  implements VerificationCodeRepository
{
  private readonly KEY_PREFIX = 'verification_code:';
  private readonly ATTEMPT_KEY_PREFIX = 'verification_attempt:';
  private readonly EMAIL_RATE_LIMIT_PREFIX = 'email_rate_limit:';
  private readonly TTL_SECONDS = 300; // 5분
  private readonly MAX_ATTEMPTS = 5; // 최대 시도 횟수
  private readonly ATTEMPT_TTL_SECONDS = 3600; // 시도 횟수 TTL (1시간)
  private readonly EMAIL_RATE_LIMIT_TTL = 60; // 이메일 발송 제한 TTL (1분)
  private readonly MAX_EMAIL_PER_MINUTE = 1; // 분당 최대 이메일 발송 횟수

  constructor(private readonly redis: RedisService) {}

  async save(userId: bigint, code: VerificationCode): Promise<void> {
    const key = this.getKey(userId);
    const value = JSON.stringify({
      id: code.getId(),
      code: code.getValue(),
      expiresAt: code.getExpiresAt().toISOString(),
    });

    await this.redis.setex(key, this.TTL_SECONDS, value);
  }

  async saveWithEmailRateLimit(
    userId: bigint,
    email: string,
    code: VerificationCode,
  ): Promise<void> {
    // 이메일 발송 제한 확인
    await this.checkEmailRateLimit(email);

    // 기본 save 실행
    await this.save(userId, code);

    // 이메일 발송 횟수 증가
    await this.incrementEmailSendCount(email);
  }

  async findByUserIdAndCode(
    userId: bigint,
    code: string,
  ): Promise<VerificationCode | null> {
    // 먼저 시도 횟수 확인
    const attempts = await this.incrementAttempts(userId);
    if (attempts > this.MAX_ATTEMPTS) {
      throw new Error(
        '인증 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
      );
    }

    const key = this.getKey(userId);
    const value = await this.redis.get(key);

    if (!value) {
      return null;
    }

    const data = JSON.parse(value) as {
      id: string;
      code: string;
      expiresAt: string;
    };
    const verificationCode = VerificationCode.fromValue(
      data.id,
      data.code,
      new Date(data.expiresAt),
    );

    if (!verificationCode.matches(code)) {
      return null;
    }

    // 인증 성공 시 시도 횟수 초기화
    await this.resetAttempts(userId);

    return verificationCode;
  }

  async deleteByUserId(userId: bigint): Promise<void> {
    const key = this.getKey(userId);
    await this.redis.del(key);
  }

  private getKey(userId: bigint): string {
    return `${this.KEY_PREFIX}${userId}`;
  }

  private getAttemptKey(userId: bigint): string {
    return `${this.ATTEMPT_KEY_PREFIX}${userId}`;
  }

  private async incrementAttempts(userId: bigint): Promise<number> {
    const key = this.getAttemptKey(userId);
    const attempts = await this.redis.incr(key);

    // 첫 번째 시도인 경우 TTL 설정
    if (attempts === 1) {
      await this.redis.expire(key, this.ATTEMPT_TTL_SECONDS);
    }

    return attempts;
  }

  private async resetAttempts(userId: bigint): Promise<void> {
    const key = this.getAttemptKey(userId);
    await this.redis.del(key);
  }

  async getAttemptCount(userId: bigint): Promise<number> {
    const key = this.getAttemptKey(userId);
    const attempts = await this.redis.get(key);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  private getEmailRateLimitKey(email: string): string {
    return `${this.EMAIL_RATE_LIMIT_PREFIX}${email}`;
  }

  private async checkEmailRateLimit(email: string): Promise<void> {
    const key = this.getEmailRateLimitKey(email);
    const count = await this.redis.get(key);

    if (count && parseInt(count, 10) >= this.MAX_EMAIL_PER_MINUTE) {
      throw new Error(
        '인증 이메일 발송 제한을 초과했습니다. 1분 후 다시 시도해주세요.',
      );
    }
  }

  private async incrementEmailSendCount(email: string): Promise<void> {
    const key = this.getEmailRateLimitKey(email);
    const count = await this.redis.incr(key);

    // 첫 번째 발송인 경우 TTL 설정
    if (count === 1) {
      await this.redis.expire(key, this.EMAIL_RATE_LIMIT_TTL);
    }
  }
}
