import { IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @Length(6, 6, { message: '인증 코드는 6자리여야 합니다' })
  code: string;
}
