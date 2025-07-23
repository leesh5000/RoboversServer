import { VerificationCode } from './verification-code.value-object';

describe('VerificationCode', () => {
  describe('generate', () => {
    it('should generate 6-digit code', () => {
      const code = VerificationCode.generate('test-id-1');
      expect(code.getValue()).toMatch(/^\d{6}$/);
    });

    it('should set expiration time to 5 minutes from now', () => {
      const beforeGenerate = new Date();
      const code = VerificationCode.generate('test-id-2');
      const afterGenerate = new Date();

      const expiresAt = code.getExpiresAt();
      const expectedExpiration = new Date(beforeGenerate);
      expectedExpiration.setMinutes(expectedExpiration.getMinutes() + 5);

      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(
        expectedExpiration.getTime(),
      );
      expect(expiresAt.getTime()).toBeLessThanOrEqual(
        afterGenerate.getTime() + 5 * 60 * 1000,
      );
    });

    it('should generate different codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(VerificationCode.generate(`test-id-${i}`).getValue());
      }

      // 100개 생성시 최소 50개 이상은 달라야 함 (충분히 랜덤)
      expect(codes.size).toBeGreaterThan(50);
    });
  });

  describe('fromValue', () => {
    it('should create from valid code and expiration', () => {
      const id = 'test-id';
      const codeValue = '123456';
      const expiresAt = new Date();
      const code = VerificationCode.fromValue(id, codeValue, expiresAt);

      expect(code.getValue()).toBe(codeValue);
      expect(code.getExpiresAt()).toBe(expiresAt);
    });

    it('should throw error for invalid code length', () => {
      const expiresAt = new Date();

      expect(() =>
        VerificationCode.fromValue('test-id', '12345', expiresAt),
      ).toThrow('인증 코드는 6자리여야 합니다');
      expect(() =>
        VerificationCode.fromValue('test-id', '1234567', expiresAt),
      ).toThrow('인증 코드는 6자리여야 합니다');
      expect(() =>
        VerificationCode.fromValue('test-id', '', expiresAt),
      ).toThrow('인증 코드는 6자리여야 합니다');
    });

    it('should throw error for non-numeric code', () => {
      const expiresAt = new Date();

      expect(() =>
        VerificationCode.fromValue('test-id', '12345a', expiresAt),
      ).toThrow('인증 코드는 숫자로만 구성되어야 합니다');
      expect(() =>
        VerificationCode.fromValue('test-id', 'abcdef', expiresAt),
      ).toThrow('인증 코드는 숫자로만 구성되어야 합니다');
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired code', () => {
      const code = VerificationCode.generate('test-id');
      expect(code.isExpired()).toBe(false);
    });

    it('should return true for expired code', () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);

      const code = VerificationCode.fromValue('test-id', '123456', pastDate);
      expect(code.isExpired()).toBe(true);
    });
  });

  describe('matches', () => {
    it('should return true for matching code', () => {
      const codeValue = '123456';
      const code = VerificationCode.fromValue('test-id', codeValue, new Date());

      expect(code.matches(codeValue)).toBe(true);
    });

    it('should return false for non-matching code', () => {
      const code = VerificationCode.fromValue('test-id', '123456', new Date());

      expect(code.matches('654321')).toBe(false);
      expect(code.matches('123457')).toBe(false);
      expect(code.matches('')).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return code value as string', () => {
      const codeValue = '123456';
      const code = VerificationCode.fromValue('test-id', codeValue, new Date());

      expect(code.toString()).toBe(codeValue);
    });
  });

  describe('getId', () => {
    it('should return the id', () => {
      const id = 'test-verification-id';
      const code = VerificationCode.generate(id);

      expect(code.getId()).toBe(id);
    });
  });
});
