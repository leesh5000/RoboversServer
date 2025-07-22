import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailService } from '../../application/ports';

@Injectable()
export class NodemailerEmailService implements EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: `"Robovers" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '[Robovers] 이메일 인증',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">이메일 인증</h1>
          <p>안녕하세요! Robovers 회원가입을 위한 인증 코드입니다.</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h2 style="color: #007bff; margin: 0;">${code}</h2>
          </div>
          <p>이 코드는 5분간 유효합니다.</p>
          <p>본인이 요청하지 않은 경우, 이 이메일을 무시하세요.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">© 2024 Robovers. All rights reserved.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}