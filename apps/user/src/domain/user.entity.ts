import { UserEmail } from './user-email.value-object';
import { UserStatus } from './user-status.enum';
import { UserRole } from './user-role.enum';

export interface UserProps {
  id: bigint;
  email: UserEmail;
  password: string;
  nickname: string;
  status: UserStatus;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private static readonly NICKNAME_REGEX = /^[a-zA-Z0-9가-힣]{2,20}$/;

  private constructor(private readonly props: UserProps) {}

  public static create(props: UserProps): User {
    this.validateNickname(props.nickname);
    this.validatePassword(props.password);

    return new User(props);
  }

  private static validateNickname(nickname: string): void {
    if (!nickname || nickname.trim().length === 0) {
      throw new Error('닉네임은 필수입니다');
    }

    if (!this.NICKNAME_REGEX.test(nickname)) {
      throw new Error('닉네임은 2-20자의 한글, 영문, 숫자만 사용 가능합니다');
    }
  }

  private static validatePassword(password: string): void {
    if (!password || password.length === 0) {
      throw new Error('비밀번호는 필수입니다');
    }
  }

  public get id(): bigint {
    return this.props.id;
  }

  public get email(): UserEmail {
    return this.props.email;
  }

  public get password(): string {
    return this.props.password;
  }

  public get nickname(): string {
    return this.props.nickname;
  }

  public get status(): UserStatus {
    return this.props.status;
  }

  public get role(): UserRole {
    return this.props.role;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  public isPending(): boolean {
    return this.status === UserStatus.PENDING;
  }

  public isBanned(): boolean {
    return this.status === UserStatus.BANNED;
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  public activate(): User {
    if (this.status !== UserStatus.PENDING) {
      throw new Error('PENDING 상태의 사용자만 활성화할 수 있습니다');
    }

    return User.create({
      ...this.props,
      status: UserStatus.ACTIVE,
      updatedAt: new Date(),
    });
  }

  public ban(): User {
    if (this.status === UserStatus.BANNED) {
      throw new Error('이미 차단된 사용자입니다');
    }

    return User.create({
      ...this.props,
      status: UserStatus.BANNED,
      updatedAt: new Date(),
    });
  }

  public updatePassword(newPassword: string): User {
    User.validatePassword(newPassword);

    return User.create({
      ...this.props,
      password: newPassword,
      updatedAt: new Date(),
    });
  }

  public updateNickname(newNickname: string): User {
    User.validateNickname(newNickname);

    return User.create({
      ...this.props,
      nickname: newNickname,
      updatedAt: new Date(),
    });
  }
}
