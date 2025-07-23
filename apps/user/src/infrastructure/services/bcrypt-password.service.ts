import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordService } from '../../application/ports';

@Injectable()
export class BcryptPasswordService implements PasswordService {
  private readonly SALT_ROUNDS = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
