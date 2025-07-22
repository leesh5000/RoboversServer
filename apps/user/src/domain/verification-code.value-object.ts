export class VerificationCode {
  private static readonly CODE_LENGTH = 6;
  private static readonly EXPIRATION_MINUTES = 5;

  private constructor(
    private readonly value: string,
    private readonly expiresAt: Date
  ) {}

  public static generate(): VerificationCode {
    const code = this.generateRandomCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.EXPIRATION_MINUTES);
    
    return new VerificationCode(code, expiresAt);
  }

  public static fromValue(code: string, expiresAt: Date): VerificationCode {
    if (!code || code.length !== this.CODE_LENGTH) {
      throw new Error(`인증 코드는 ${this.CODE_LENGTH}자리여야 합니다`);
    }

    if (!/^\d+$/.test(code)) {
      throw new Error('인증 코드는 숫자로만 구성되어야 합니다');
    }

    return new VerificationCode(code, expiresAt);
  }

  private static generateRandomCode(): string {
    const min = Math.pow(10, this.CODE_LENGTH - 1);
    const max = Math.pow(10, this.CODE_LENGTH) - 1;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    return code.toString();
  }

  public getValue(): string {
    return this.value;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public matches(code: string): boolean {
    return this.value === code;
  }

  public toString(): string {
    return this.value;
  }
}