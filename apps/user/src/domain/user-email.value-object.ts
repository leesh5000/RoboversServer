export class UserEmail {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static readonly MAX_LENGTH = 255;

  private constructor(private readonly value: string) {}

  public static create(email: string): UserEmail {
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!normalizedEmail) {
      throw new Error('이메일은 필수입니다');
    }

    if (normalizedEmail.length > UserEmail.MAX_LENGTH) {
      throw new Error(`이메일은 ${UserEmail.MAX_LENGTH}자를 초과할 수 없습니다`);
    }

    if (!UserEmail.EMAIL_REGEX.test(normalizedEmail)) {
      throw new Error('유효하지 않은 이메일 형식입니다');
    }

    return new UserEmail(normalizedEmail);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserEmail): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}