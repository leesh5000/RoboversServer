import { IsEmail } from 'class-validator';

export class ResendVerificationCodeDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요' })
  email: string;
}
