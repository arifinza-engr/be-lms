// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { DatabaseService } from '@/database/database.service';
import { UserRepository } from './repositories/user.repository';
import { TransactionService } from '@/common/services/transaction.service';
import { PasswordService } from '@/common/services/password.service';
import { UserRole } from '@/types/enums';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/change-password.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let transactionService: jest.Mocked<TransactionService>;
  let passwordService: jest.Mocked<PasswordService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: UserRole.SISWA,
    isActive: true,
    loginAttempts: 0,
    lockedUntil: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateRefreshToken: jest.fn(),
      resetLoginAttempts: jest.fn(),
      incrementLoginAttempts: jest.fn(),
      lockAccount: jest.fn(),
      updatePassword: jest.fn(),
      findByResetToken: jest.fn(),
      updateResetToken: jest.fn(),
      findByRefreshToken: jest.fn(),
      clearResetToken: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      sign: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const mockTransactionService = {
      executeInTransaction: jest.fn((callback) => callback()),
    };

    const mockPasswordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
      validatePassword: jest.fn(),
      validatePasswordChange: jest.fn(),
      generateResetToken: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          JWT_SECRET: 'test-secret',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: {},
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);
    eventEmitter = module.get(EventEmitter2);
    transactionService = module.get(TransactionService);
    passwordService = module.get(PasswordService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: UserRole.SISWA,
    };

    it('should register a new user successfully', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      userRepository.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('mock-access-token');
      jwtService.signAsync.mockResolvedValueOnce('mock-access-token');
      jwtService.signAsync.mockResolvedValueOnce('mock-refresh-token');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(passwordService.hashPassword).toHaveBeenCalledWith('password123');
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: UserRole.SISWA,
        passwordChangedAt: expect.any(Date),
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should register user with default SISWA role if no role provided', async () => {
      // Arrange
      const registerDtoWithoutRole = { ...registerDto };
      delete registerDtoWithoutRole.role;

      userRepository.findByEmail.mockResolvedValue(null);
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      userRepository.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('mock-token');

      // Act
      await service.register(registerDtoWithoutRole);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: UserRole.SISWA,
        passwordChangedAt: expect.any(Date),
      });
    });

    it('should emit user.registered event after successful registration', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      passwordService.hashPassword.mockResolvedValue('hashedPassword');
      userRepository.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('mock-token');

      // Act
      await service.register(registerDto);

      // Assert
      // Use setTimeout to check for setImmediate call
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.registered',
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordService.verifyPassword.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValueOnce('mock-access-token');
      jwtService.signAsync.mockResolvedValueOnce('mock-refresh-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(userRepository.resetLoginAttempts).toHaveBeenCalledWith(
        'user-id-1',
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(passwordService.verifyPassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordService.verifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
    });

    it('should throw UnauthorizedException for locked account', async () => {
      // Arrange
      const lockedUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 10000), // 10 seconds in future
      };
      userRepository.findByEmail.mockResolvedValue(lockedUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(passwordService.verifyPassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      userRepository.findByEmail.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(passwordService.verifyPassword).not.toHaveBeenCalled();
    });

    it('should emit user.logged-in event after successful login', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordService.verifyPassword.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('mock-token');

      // Act
      await service.login(loginDto);

      // Assert
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.logged_in',
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
        }),
      );
    });

    it('should handle failed login attempts correctly', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordService.verifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      // The handleFailedLogin method should be called internally
      // This would increment login attempts and potentially lock the account
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should refresh tokens successfully', async () => {
      // Arrange
      const mockPayload = {
        sub: 'user-id-1',
        email: 'test@example.com',
        type: 'refresh',
      };
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: 'valid-refresh-token',
        refreshTokenExpiresAt: new Date(Date.now() + 3600000),
      };

      jwtService.verify.mockReturnValue(mockPayload);
      userRepository.findByRefreshToken.mockResolvedValue(userWithRefreshToken);
      jwtService.signAsync.mockResolvedValueOnce('new-access-token');
      jwtService.signAsync.mockResolvedValueOnce('new-refresh-token');

      // Act
      const result = await service.refreshToken(refreshTokenDto);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-refresh-secret',
      });
      expect(userRepository.findByRefreshToken).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      const mockPayload = {
        sub: 'user-id-1',
        email: 'test@example.com',
        type: 'refresh',
      };
      jwtService.verify.mockReturnValue(mockPayload);
      userRepository.findByRefreshToken.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);

      // Act
      await service.logout('user-id-1');

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
      expect(userRepository.updateRefreshToken).toHaveBeenCalledWith(
        'user-id-1',
        null,
        null,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.logged-out',
        expect.objectContaining({
          userId: 'user-id-1',
        }),
      );
    });

    it('should handle logout for non-existent user gracefully', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act
      await service.logout('non-existent-id');

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(userRepository.updateRefreshToken).toHaveBeenCalledWith(
        'non-existent-id',
        null,
        null,
      );
      // No event should be emitted for non-existent user
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    };

    it('should change password successfully', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      passwordService.validatePasswordChange.mockResolvedValue({
        isValid: true,
        errors: [],
      });
      passwordService.hashPassword.mockResolvedValue('newHashedPassword');

      // Act
      const result = await service.changePassword(
        'user-id-1',
        changePasswordDto,
      );

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
      expect(passwordService.validatePasswordChange).toHaveBeenCalledWith(
        'oldPassword123',
        'newPassword123',
        'newPassword123',
        'hashedPassword',
        ['Test User', 'test'],
      );
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        'newPassword123',
      );
      expect(userRepository.updatePassword).toHaveBeenCalledWith(
        'user-id-1',
        'newHashedPassword',
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.password_changed',
        expect.objectContaining({
          userId: 'user-id-1',
        }),
      );
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should throw BadRequestException for invalid password change', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      passwordService.validatePasswordChange.mockResolvedValue({
        isValid: false,
        errors: ['Current password is incorrect'],
      });

      // Act & Assert
      await expect(
        service.changePassword('user-id-1', changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should initiate password reset successfully', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('reset-token-123');

      // Act
      const result = await service.forgotPassword('test@example.com');

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, type: 'password_reset' },
        { expiresIn: '1h' },
      );
      expect(userRepository.updateResetToken).toHaveBeenCalledWith(
        'user-id-1',
        'reset-token-123',
        expect.any(Date),
      );
      expect(result).toEqual({
        message: 'If the email exists, a reset link has been sent',
      });
    });

    it('should not reveal if email does not exist', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.forgotPassword('nonexistent@example.com');

      // Assert
      expect(result).toEqual({
        message: 'If the email exists, a reset link has been sent',
      });
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(userRepository.updateResetToken).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-reset-token',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    };

    it('should reset password successfully', async () => {
      // Arrange
      const userWithResetToken = {
        ...mockUser,
        resetToken: 'valid-reset-token',
        resetTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      };
      jwtService.verify.mockReturnValue({
        sub: 'user-id-1',
        type: 'password_reset',
      });
      userRepository.findById.mockResolvedValue(userWithResetToken);
      passwordService.validatePassword.mockReturnValue({
        isValid: true,
        errors: [],
      });
      passwordService.hashPassword.mockResolvedValue('newHashedPassword');

      // Act
      const result = await service.resetPassword(resetPasswordDto);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith('valid-reset-token');
      expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
      expect(passwordService.validatePassword).toHaveBeenCalledWith(
        'newPassword123',
        {},
        ['Test User', 'test'],
      );
      expect(passwordService.hashPassword).toHaveBeenCalledWith(
        'newPassword123',
      );
      expect(userRepository.updatePassword).toHaveBeenCalledWith(
        'user-id-1',
        'newHashedPassword',
      );
      expect(userRepository.clearResetToken).toHaveBeenCalledWith('user-id-1');
      expect(result).toEqual({ message: 'Password reset successfully' });
    });

    it('should throw UnauthorizedException for invalid reset token', async () => {
      // Arrange
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      jwtService.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired reset token', async () => {
      // Arrange
      const userWithExpiredToken = {
        ...mockUser,
        resetToken: 'valid-reset-token',
        resetTokenExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };
      jwtService.verify.mockReturnValue({
        sub: 'user-id-1',
        type: 'password_reset',
      });
      userRepository.findById.mockResolvedValue(userWithExpiredToken);

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('service initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have correct dependencies injected', () => {
      expect(service['userRepository']).toBeDefined();
      expect(service['jwtService']).toBeDefined();
      expect(service['configService']).toBeDefined();
      expect(service['eventEmitter']).toBeDefined();
      expect(service['transactionService']).toBeDefined();
      expect(service['passwordService']).toBeDefined();
    });
  });
});
