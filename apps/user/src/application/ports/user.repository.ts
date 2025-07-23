import { User } from '../../domain';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: bigint): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByNickname(nickname: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByNickname(nickname: string): Promise<boolean>;
}
