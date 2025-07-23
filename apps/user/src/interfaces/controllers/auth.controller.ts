import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  UserSignUpUseCase,
  UserLoginUseCase,
  VerifyEmailUseCase,
  ResendVerificationCodeUseCase,
} from '../../application/use-cases';
import {
  SignUpDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationCodeDto,
} from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userSignUpUseCase: UserSignUpUseCase,
    private readonly userLoginUseCase: UserLoginUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationCodeUseCase: ResendVerificationCodeUseCase,
  ) {}

  @Post('sign-up')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async signUp(@Body() dto: SignUpDto) {
    return this.userSignUpUseCase.execute({
      email: dto.email,
      password: dto.password,
      nickname: dto.nickname,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() dto: LoginDto) {
    return this.userLoginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }

  @Post('verify-email/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '이메일 인증' })
  @ApiResponse({ status: 204, description: '인증 성공' })
  @ApiResponse({ status: 400, description: '잘못된 인증 코드' })
  async verifyEmail(
    @Param('userId') userId: string,
    @Body() dto: VerifyEmailDto,
  ) {
    await this.verifyEmailUseCase.execute({
      userId,
      code: dto.code,
    });
  }

  @Post('resend-verification-code')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendVerificationCode(@Body() dto: ResendVerificationCodeDto) {
    await this.resendVerificationCodeUseCase.execute({
      email: dto.email,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 204, description: '로그아웃 성공' })
  async logout() {
    // JWT는 stateless이므로 클라이언트에서 토큰을 삭제하면 됨
    // 필요시 Redis에 블랙리스트 구현 가능
  }
}
