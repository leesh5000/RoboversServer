import { Injectable } from '@nestjs/common';
import { RedisService } from '../services/redis.service';
import { VerificationCodeRepository } from '../../application/ports';
import { VerificationCode } from '../../domain';

@Injectable()
export class RedisVerificationCodeRepository implements VerificationCodeRepository {
  private readonly KEY_PREFIX = 'verification_code:';
  private readonly TTL_SECONDS = 300; // 5분

  constructor(private readonly redis: RedisService) {}

  async save(userId: bigint, code: VerificationCode): Promise<void> {
    const key = this.getKey(userId);
    const value = JSON.stringify({
      code: code.getValue(),
      expiresAt: code.getExpiresAt().toISOString()
    });

    await this.redis.setex(key, this.TTL_SECONDS, value);
  }

  async findByUserIdAndCode(userId: bigint, code: string): Promise<VerificationCode | null> {
    const key = this.getKey(userId);
    const value = await this.redis.get(key);

    if (!value) {
      return null;
    }

    const data = JSON.parse(value);
    const verificationCode = VerificationCode.fromValue(data.code, new Date(data.expiresAt));

    if (!verificationCode.matches(code)) {
      return null;
    }

    return verificationCode;
  }

  async deleteByUserId(userId: bigint): Promise<void> {
    const key = this.getKey(userId);
    await this.redis.del(key);
  }

  private getKey(userId: bigint): string {
    return `${this.KEY_PREFIX}${userId}`;
  }
}