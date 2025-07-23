export interface PasswordService {
  hash(password: string): Promise<string>;
  verify(password: string, hashedPassword: string): Promise<boolean>;
}
