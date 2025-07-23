import { User } from './user.entity';
import { UserEmail } from './user-email.value-object';
import { UserStatus } from './user-status.enum';
import { UserRole } from './user-role.enum';

describe('User', () => {
  const createValidUserProps = () => ({
    id: 12345n,
    email: UserEmail.create('test@example.com'),
    password: 'hashedPassword123',
    nickname: '테스트유저',
    status: UserStatus.PENDING,
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('create', () => {
    it('should create user with valid props', () => {
      const props = createValidUserProps();
      const user = User.create(props);

      expect(user.id).toBe(props.id);
      expect(user.email).toBe(props.email);
      expect(user.password).toBe(props.password);
      expect(user.nickname).toBe(props.nickname);
      expect(user.status).toBe(props.status);
      expect(user.role).toBe(props.role);
    });

    it('should throw error for invalid nickname', () => {
      const invalidNicknames = [
        '',
        '   ',
        'a', // 너무 짧음
        'a'.repeat(21), // 너무 긴
        'nick@name', // 특수문자
        'nick name', // 공백
      ];

      invalidNicknames.forEach((nickname) => {
        const props = { ...createValidUserProps(), nickname };
        expect(() => User.create(props)).toThrow();
      });
    });

    it('should accept valid nicknames', () => {
      const validNicknames = [
        'ab',
        'test123',
        '한글닉네임',
        'Mix혼합123',
        'a'.repeat(20),
      ];

      validNicknames.forEach((nickname) => {
        const props = { ...createValidUserProps(), nickname };
        expect(() => User.create(props)).not.toThrow();
      });
    });

    it('should throw error for empty password', () => {
      const props = { ...createValidUserProps(), password: '' };
      expect(() => User.create(props)).toThrow('비밀번호는 필수입니다');
    });
  });

  describe('status checks', () => {
    it('should check if user is active', () => {
      const props = { ...createValidUserProps(), status: UserStatus.ACTIVE };
      const user = User.create(props);
      expect(user.isActive()).toBe(true);
      expect(user.isPending()).toBe(false);
    });

    it('should check if user is pending', () => {
      const props = { ...createValidUserProps(), status: UserStatus.PENDING };
      const user = User.create(props);
      expect(user.isPending()).toBe(true);
      expect(user.isActive()).toBe(false);
    });

    it('should check if user is banned', () => {
      const props = { ...createValidUserProps(), status: UserStatus.BANNED };
      const user = User.create(props);
      expect(user.isBanned()).toBe(true);
    });

    it('should check if user is admin', () => {
      const props = { ...createValidUserProps(), role: UserRole.ADMIN };
      const user = User.create(props);
      expect(user.isAdmin()).toBe(true);
    });
  });

  describe('activate', () => {
    it('should activate pending user', async () => {
      const props = { ...createValidUserProps(), status: UserStatus.PENDING };
      const user = User.create(props);

      // 약간의 시간 지연
      await new Promise((resolve) => setTimeout(resolve, 1));

      const activatedUser = user.activate();

      expect(activatedUser.status).toBe(UserStatus.ACTIVE);
      expect(activatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
        user.updatedAt.getTime(),
      );
    });

    it('should throw error when activating non-pending user', () => {
      const props = { ...createValidUserProps(), status: UserStatus.ACTIVE };
      const user = User.create(props);

      expect(() => user.activate()).toThrow(
        'PENDING 상태의 사용자만 활성화할 수 있습니다',
      );
    });
  });

  describe('ban', () => {
    it('should ban active user', async () => {
      const props = { ...createValidUserProps(), status: UserStatus.ACTIVE };
      const user = User.create(props);

      // 약간의 시간 지연
      await new Promise((resolve) => setTimeout(resolve, 1));

      const bannedUser = user.ban();

      expect(bannedUser.status).toBe(UserStatus.BANNED);
      expect(bannedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
        user.updatedAt.getTime(),
      );
    });

    it('should throw error when banning already banned user', () => {
      const props = { ...createValidUserProps(), status: UserStatus.BANNED };
      const user = User.create(props);

      expect(() => user.ban()).toThrow('이미 차단된 사용자입니다');
    });
  });

  describe('updatePassword', () => {
    it('should update password', async () => {
      const user = User.create(createValidUserProps());
      const newPassword = 'newHashedPassword';

      // 약간의 시간 지연
      await new Promise((resolve) => setTimeout(resolve, 1));

      const updatedUser = user.updatePassword(newPassword);

      expect(updatedUser.password).toBe(newPassword);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
        user.updatedAt.getTime(),
      );
    });

    it('should throw error for empty password', () => {
      const user = User.create(createValidUserProps());
      expect(() => user.updatePassword('')).toThrow('비밀번호는 필수입니다');
    });
  });

  describe('updateNickname', () => {
    it('should update nickname', async () => {
      const user = User.create(createValidUserProps());
      const newNickname = '새닉네임';

      // 약간의 시간 지연
      await new Promise((resolve) => setTimeout(resolve, 1));

      const updatedUser = user.updateNickname(newNickname);

      expect(updatedUser.nickname).toBe(newNickname);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
        user.updatedAt.getTime(),
      );
    });

    it('should throw error for invalid nickname', () => {
      const user = User.create(createValidUserProps());
      expect(() => user.updateNickname('a')).toThrow();
    });
  });
});
