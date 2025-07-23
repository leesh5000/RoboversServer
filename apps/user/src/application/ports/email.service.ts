export interface EmailService {
  sendVerificationEmail(email: string, code: string): Promise<void>;
}
