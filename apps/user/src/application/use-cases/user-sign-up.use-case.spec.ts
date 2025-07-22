import { Test } from '@nestjs/testing';
import { UserSignUpUseCase } from './user-sign-up.use-case';
import { UserRepository, VerificationCodeRepository, EmailService, PasswordService } from '../ports';
import { User, UserEmail, UserStatus, UserRole } from '../../domain';

describe('UserSignUpUseCase', () => {
  let useCase: UserSignUpUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let verificationCodeRepository: jest.Mocked<VerificationCodeRepository>;
  let emailService: jest.Mocked<EmailService>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserSignUpUseCase,
        {
          provide: 'UserRepository',
          useValue: {
            save: jest.fn(),
            existsByEmail: jest.fn(),
            existsByNickname: jest.fn()
          }
        },
        {
          provide: 'VerificationCodeRepository',
          useValue: {
            save: jest.fn()
          }
        },
        {
          provide: 'EmailService',
          useValue: {
            sendVerificationEmail: jest.fn()
          }
        },
        {
          provide: 'PasswordService',
          useValue: {
            hash: jest.fn()
          }
        }
      ]
    }).compile();

    useCase = module.get<UserSignUpUseCase>(UserSignUpUseCase);
    userRepository = module.get('UserRepository');
    verificationCodeRepository = module.get('VerificationCodeRepository');
    emailService = module.get('EmailService');
    passwordService = module.get('PasswordService');
  });

  describe('execute', () => {
    const command = {
      email: 'test@example.com',
      password: 'password123',
      nickname: '테스트유저'
    };

    beforeEach(() => {
      userRepository.existsByEmail.mockResolvedValue(false);
      userRepository.existsByNickname.mockResolvedValue(false);
      passwordService.hash.mockResolvedValue('hashedPassword');
      userRepository.save.mockResolvedValue(undefined);
      verificationCodeRepository.save.mockResolvedValue(undefined);
      emailService.sendVerificationEmail.mockResolvedValue(undefined);
    });

    it('should create a new user successfully', async () => {
      const result = await useCase.execute(command);

      expect(result).toBeDefined();
      expect(result.email).toBe(command.email);
      expect(result.nickname).toBe(command.nickname);
      expect(result.userId).toBeDefined();

      expect(passwordService.hash).toHaveBeenCalledWith(command.password);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.objectContaining({ value: command.email }),
          nickname: command.nickname,
          status: UserStatus.PENDING,
          role: UserRole.USER
        })
      );
      expect(verificationCodeRepository.save).toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        command.email,
        expect.stringMatching(/^\d{6}$/)
      );
    });

    it('should throw error when email already exists', async () => {
      userRepository.existsByEmail.mockResolvedValue(true);

      await expect(useCase.execute(command)).rejects.toThrow('이미 사용 중인 이메일입니다');
    });

    it('should throw error when nickname already exists', async () => {
      userRepository.existsByNickname.mockResolvedValue(true);

      await expect(useCase.execute(command)).rejects.toThrow('이미 사용 중인 닉네임입니다');
    });

    it('should throw error for invalid email format', async () => {
      const invalidCommand = { ...command, email: 'invalid-email' };

      await expect(useCase.execute(invalidCommand)).rejects.toThrow('유효하지 않은 이메일 형식입니다');
    });

    it('should throw error for invalid nickname', async () => {
      const invalidCommand = { ...command, nickname: 'a' };

      await expect(useCase.execute(invalidCommand)).rejects.toThrow('닉네임은 2-20자의 한글, 영문, 숫자만 사용 가능합니다');
    });
  });
});