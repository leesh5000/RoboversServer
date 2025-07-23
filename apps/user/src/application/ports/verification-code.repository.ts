import { VerificationCode } from '../../domain';

export interface VerificationCodeRepository {
  save(userId: bigint, code: VerificationCode): Promise<void>;
  saveWithEmailRateLimit(
    userId: bigint,
    email: string,
    code: VerificationCode,
  ): Promise<void>;
  findByUserIdAndCode(
    userId: bigint,
    code: string,
  ): Promise<VerificationCode | null>;
  deleteByUserId(userId: bigint): Promise<void>;
}
