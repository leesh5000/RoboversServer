import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일',
  })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: '비밀번호 (8자 이상)',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
  @MaxLength(100, { message: '비밀번호는 100자를 초과할 수 없습니다' })
  password: string;

  @ApiProperty({
    example: '테스트유저',
    description: '닉네임 (2-20자의 한글, 영문, 숫자)',
    pattern: '^[a-zA-Z0-9가-힣]{2,20}$',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9가-힣]{2,20}$/, {
    message: '닉네임은 2-20자의 한글, 영문, 숫자만 사용 가능합니다',
  })
  nickname: string;
}
