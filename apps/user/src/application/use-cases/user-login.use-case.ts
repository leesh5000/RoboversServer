import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, PasswordService, JwtService } from '../ports';

export interface UserLoginCommand {
  email: string;
  password: string;
}

export interface UserLoginResult {
  accessToken: string;
  userId: string;
  email: string;
  nickname: string;
  role: string;
}

@Injectable()
export class UserLoginUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('PasswordService') private readonly passwordService: PasswordService,
    @Inject('JwtService') private readonly jwtService: JwtService
  ) {}

  async execute(command: UserLoginCommand): Promise<UserLoginResult> {
    // 사용자 조회
    const user = await this.userRepository.findByEmail(command.email.toLowerCase());
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    // 비밀번호 검증
    const isPasswordValid = await this.passwordService.verify(command.password, user.password);
    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    // 사용자 상태 확인
    if (!user.isActive()) {
      if (user.isPending()) {
        throw new Error('이메일 인증이 필요합니다');
      }
      if (user.isBanned()) {
        throw new Error('차단된 계정입니다');
      }
      throw new Error('로그인할 수 없는 계정입니다');
    }

    // JWT 토큰 생성
    const accessToken = this.jwtService.sign({
      userId: user.id.toString(),
      email: user.email.getValue(),
      role: user.role
    });

    return {
      accessToken,
      userId: user.id.toString(),
      email: user.email.getValue(),
      nickname: user.nickname,
      role: user.role
    };
  }
}