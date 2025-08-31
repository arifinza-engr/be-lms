// src/auth/auth.service.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { DatabaseService } from '@/database/database.service';
import { UserRepository } from './repositories/user.repository';
import { TransactionService } from '@/common/services/transaction.service';
import { PasswordService } from '@/common/services/password.service';
import { UserRole } from '@/types/enums';

describe('AuthService Integration Tests', () => {
  let service: AuthService;
  let database: DatabaseService;
  let userRepository: UserRepository;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET') || 'test-secret',
            signOptions: {
              expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
            },
          }),
          inject: [ConfigService],
        }),
        EventEmitterModule.forRoot(),
      ],
      providers: [
        AuthService,
        DatabaseService,
        UserRepository,
        TransactionService,
        {
          provide: 'RedisService',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            increment: jest.fn(),
          },
        },
        PasswordService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    database = module.get<DatabaseService>(DatabaseService);
    userRepository = module.get<UserRepository>(UserRepository);

    // Setup test database connection
    await database.connect();
  });

  afterAll(async () => {
    await database.disconnect();
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await database.db.delete(database.schema.users);
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        name: 'Test User',
        role: UserRole.SISWA,
      };

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe(UserRole.SISWA);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ConflictException for duplicate email', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        name: 'Test User',
        role: UserRole.SISWA,
      };

      // Register first user
      await service.register(registerDto);

      // Try to register with same email
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash password correctly', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
        name: 'Test User',
        role: UserRole.SISWA,
      };

      await service.register(registerDto);

      const user = await userRepository.findByEmail('test@example.com');
      expect(user.password).not.toBe('StrongPassword123!');
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await service.register({
        email: 'test@example.com',
        password: 'StrongPassword123!',
        name: 'Test User',
        role: UserRole.SISWA,
      });
    });

    it('should login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
      };

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'StrongPassword123!',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reset login attempts on successful login', async () => {
      const user = await userRepository.findByEmail('test@example.com');

      // Simulate failed attempts
      await userRepository.incrementLoginAttempts(user.id);
      await userRepository.incrementLoginAttempts(user.id);

      const loginDto = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
      };

      await service.login(loginDto);

      const updatedUser = await userRepository.findByEmail('test@example.com');
      expect(updatedUser.loginAttempts).toBe(0);
    });

    it('should lock account after max failed attempts', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      // Attempt login 5 times with wrong password
      for (let i = 0; i < 5; i++) {
        try {
          await service.login(loginDto);
        } catch (error) {
          // Expected to fail
        }
      }

      const user = await userRepository.findByEmail('test@example.com');
      expect(user.lockedUntil).toBeDefined();
      expect(user.lockedUntil.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Token Management', () => {
    let user: any;
    let tokens: any;

    beforeEach(async () => {
      const registerResult = await service.register({
        email: 'test@example.com',
        password: 'StrongPassword123!',
        name: 'Test User',
        role: UserRole.SISWA,
      });

      user = registerResult.user;
      tokens = {
        accessToken: registerResult.accessToken,
        refreshToken: registerResult.refreshToken,
      };
    });

    it('should refresh tokens with valid refresh token', async () => {
      const refreshDto = {
        refreshToken: tokens.refreshToken,
      };

      const result = await service.refreshToken(refreshDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).not.toBe(tokens.accessToken);
      expect(result.refreshToken).not.toBe(tokens.refreshToken);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshDto = {
        refreshToken: 'invalid-refresh-token',
      };

      await expect(service.refreshToken(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should logout user successfully', async () => {
      await service.logout(user.id);

      const updatedUser = await userRepository.findById(user.id);
      expect(updatedUser.refreshToken).toBeNull();
      expect(updatedUser.refreshTokenExpiresAt).toBeNull();
    });
  });

  describe('User Validation', () => {
    beforeEach(async () => {
      await service.register({
        email: 'test@example.com',
        password: 'StrongPassword123!',
        name: 'Test User',
        role: UserRole.SISWA,
      });
    });

    it('should validate user with correct credentials', async () => {
      const result = await service.validateUser(
        'test@example.com',
        'StrongPassword123!',
      );

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('should return null for invalid credentials', async () => {
      const result = await service.validateUser(
        'test@example.com',
        'WrongPassword123!',
      );
      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const result = await service.validateUser(
        'nonexistent@example.com',
        'StrongPassword123!',
      );
      expect(result).toBeNull();
    });

    it('should return null for inactive user', async () => {
      const user = await userRepository.findByEmail('test@example.com');
      await database.db
        .update(database.schema.users)
        .set({ isActive: false })
        .where(database.eq(database.schema.users.id, user.id));

      const result = await service.validateUser(
        'test@example.com',
        'StrongPassword123!',
      );
      expect(result).toBeNull();
    });
  });
});
