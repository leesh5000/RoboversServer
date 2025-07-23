import { Injectable } from '@nestjs/common';
import { EmailService } from '../../application/ports';

@Injectable()
export class ConsoleEmailService implements EmailService {
  sendVerificationEmail(email: string, code: string): Promise<void> {
    console.log('\n========================================');
    console.log('📧 이메일 인증 코드 (개발 환경)');
    console.log('========================================');
    console.log(`수신자: ${email}`);
    console.log(`인증 코드: ${code}`);
    console.log(`유효 시간: 5분`);
    console.log('========================================\n');
    return Promise.resolve();
  }
}
