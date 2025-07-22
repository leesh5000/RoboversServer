import { UserEmail } from './user-email.value-object';

describe('UserEmail', () => {
  describe('create', () => {
    it('should create valid email', () => {
      const email = UserEmail.create('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = UserEmail.create('TEST@EXAMPLE.COM');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = UserEmail.create('  test@example.com  ');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw error for empty email', () => {
      expect(() => UserEmail.create('')).toThrow('이메일은 필수입니다');
      expect(() => UserEmail.create('   ')).toThrow('이메일은 필수입니다');
    });

    it('should throw error for email exceeding max length', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(() => UserEmail.create(longEmail)).toThrow('이메일은 255자를 초과할 수 없습니다');
    });

    it('should throw error for invalid email format', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test@.com',
        'test@example',
        'test.example.com',
        'test@example..com',
        'test@exam ple.com'
      ];

      invalidEmails.forEach(invalidEmail => {
        expect(() => UserEmail.create(invalidEmail)).toThrow('유효하지 않은 이메일 형식입니다');
      });
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.kr',
        'user_name@example-domain.com',
        '123@example.com'
      ];

      validEmails.forEach(validEmail => {
        expect(() => UserEmail.create(validEmail)).not.toThrow();
      });
    });
  });

  describe('equals', () => {
    it('should return true for same email values', () => {
      const email1 = UserEmail.create('test@example.com');
      const email2 = UserEmail.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different email values', () => {
      const email1 = UserEmail.create('test1@example.com');
      const email2 = UserEmail.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });

    it('should be case-insensitive when comparing', () => {
      const email1 = UserEmail.create('Test@Example.com');
      const email2 = UserEmail.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return email string', () => {
      const email = UserEmail.create('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });
  });
});