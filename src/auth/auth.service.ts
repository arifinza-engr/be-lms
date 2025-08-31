// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { eq, and, lt } from 'drizzle-orm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto, TokenResponseDto } from './dto/refresh-token.dto';
import {
  ChangePasswordDto,
  ResetPasswordDto,
  ForgotPasswordDto,
} from './dto/change-password.dto';
import { DatabaseService } from '@/database/database.service';
import { users } from '@/database/schema';
import { UserRole } from '@/types/enums';
import { JwtPayload } from './strategies/jwt.strategy';
import { UserRepository } from './repositories/user.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TransactionService } from '@/common/services/transaction.service';
import { PasswordService } from '@/common/services/password.service';
import {
  UserRegisteredEvent,
  UserLoggedInEvent,
  UserLoggedOutEvent,
  UserAccountLockedEvent,
  PasswordChangedEvent,
} from '@/common/events/user.events';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME = 30 * 60 * 1000; // 30 minutes

  constructor(
    private readonly database: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly transactionService: TransactionService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<TokenResponseDto & { user: any }> {
    const { email, password, name, role } = registerDto;

    return this.transactionService.executeInTransaction(async (tx) => {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        throw new ConflictException('User dengan email ini sudah terdaftar');
      }

      // Hash password using PasswordService
      const hashedPassword = await this.passwordService.hashPassword(password);

      // Create user
      const newUser = await this.userRepository.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: role || UserRole.SISWA,
        passwordChangedAt: new Date(),
      });

      // Generate tokens
      const tokens = await this.generateTokens(newUser);

      this.logger.log(`New user registered: ${newUser.email}`);

      // Emit user registered event (after transaction commits)
      setImmediate(() => {
        this.eventEmitter.emit(
          'user.registered',
          new UserRegisteredEvent(
            newUser.id,
            newUser.email,
            newUser.name,
            newUser.role,
          ),
        );
      });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
        ...tokens,
      };
    });
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto & { user: any }> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists or not
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account locked. Try again in ${remainingTime} minutes`,
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.userRepository.resetLoginAttempts(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`User logged in: ${user.email}`);

    // Emit user logged in event
    this.eventEmitter.emit(
      'user.logged_in',
      new UserLoggedInEvent(user.id, user.email, new Date()),
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: new Date(),
      },
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const [user] = await this.database.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || !user.isActive) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const { password: _, refreshToken: __, ...result } = user;
    return result;
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find user and validate refresh token
      const user = await this.userRepository.findByRefreshToken(refreshToken);

      if (!user || user.id !== payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token is expired
      if (
        user.refreshTokenExpiresAt &&
        user.refreshTokenExpiresAt < new Date()
      ) {
        // Clean up expired token
        await this.userRepository.updateRefreshToken(user.id, null, null);
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      this.logger.log(`Token refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    await this.userRepository.updateRefreshToken(userId, null, null);

    this.logger.log(`User logged out: ${userId}`);

    // Emit user logged out event
    if (user) {
      this.eventEmitter.emit(
        'user.logged-out',
        new UserLoggedOutEvent(user.id, user.email, new Date()),
      );
    }
  }

  async logoutWithTokens(
    accessToken: string | null,
    refreshToken?: string,
  ): Promise<void> {
    let userId: string | null = null;

    // Try to get user ID from access token first
    if (accessToken) {
      try {
        // Try to decode the token without verification to get user ID
        // This allows logout even with expired tokens
        const decoded = this.jwtService.decode(accessToken) as JwtPayload;

        if (decoded && decoded.sub) {
          userId = decoded.sub;
        } else {
          // If we can't decode the token, try to verify it (might be valid)
          try {
            const verified = this.jwtService.verify(accessToken, {
              secret: this.configService.get<string>('JWT_SECRET'),
            }) as JwtPayload;

            if (verified && verified.sub) {
              userId = verified.sub;
            }
          } catch (verifyError) {
            // Token is invalid or expired, continue to try refresh token
            this.logger.warn(
              `Access token invalid during logout: ${verifyError.message}`,
            );
          }
        }
      } catch (error) {
        this.logger.warn(
          `Error processing access token during logout: ${error.message}`,
        );
      }
    }

    // If we couldn't get user ID from access token, try refresh token
    if (!userId && refreshToken) {
      try {
        const user = await this.userRepository.findByRefreshToken(refreshToken);
        if (user) {
          userId = user.id;
        }
      } catch (error) {
        this.logger.warn(
          `Error processing refresh token during logout: ${error.message}`,
        );
      }
    }

    // If we have a user ID, perform logout
    if (userId) {
      await this.logout(userId);
      this.logger.log(`User logged out successfully: ${userId}`);
    } else {
      // Even if we can't identify the user, we should succeed
      // This handles cases where tokens are completely invalid
      this.logger.warn(
        'Logout attempted without valid tokens - allowing anonymous logout',
      );
    }
  }

  // Keep the old method for backward compatibility
  async logoutWithToken(token: string): Promise<void> {
    return this.logoutWithTokens(token, undefined);
  }

  private async generateTokens(user: any): Promise<TokenResponseDto> {
    const accessTokenPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshTokenPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    const accessTokenExpiresIn = this.configService.get<string>(
      'JWT_EXPIRES_IN',
      '15m',
    );
    const refreshTokenExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    // Calculate refresh token expiry
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // 7 days

    // Store refresh token in database
    await this.userRepository.updateRefreshToken(
      user.id,
      refreshToken,
      refreshTokenExpiresAt,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresIn(accessTokenExpiresIn),
      tokenType: 'Bearer',
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validate password change using PasswordService
    const validation = await this.passwordService.validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword,
      user.password,
      [user.name, user.email.split('@')[0]], // Personal info to avoid
    );

    if (!validation.isValid) {
      throw new BadRequestException(validation.errors.join('. '));
    }

    // Hash new password
    const hashedNewPassword =
      await this.passwordService.hashPassword(newPassword);

    // Update password in database
    await this.userRepository.updatePassword(userId, hashedNewPassword);

    // Emit password changed event
    this.eventEmitter.emit(
      'user.password_changed',
      new PasswordChangedEvent(user.id, user.email, new Date()),
    );

    this.logger.log(`Password changed for user: ${user.email}`);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password_reset' },
      { expiresIn: '1h' },
    );

    // Store reset token in database (you might want to add a reset_token field)
    // For now, we'll use a simple approach
    await this.userRepository.updateResetToken(
      user.id,
      resetToken,
      new Date(Date.now() + 3600000),
    );

    // TODO: Send email with reset link
    this.logger.log(`Password reset requested for user: ${user.email}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.resetToken || user.resetToken !== token) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
        throw new UnauthorizedException('Reset token has expired');
      }

      // Validate new password
      const validation = this.passwordService.validatePassword(
        newPassword,
        {},
        [user.name, user.email.split('@')[0]],
      );

      if (!validation.isValid) {
        throw new BadRequestException(validation.errors.join('. '));
      }

      // Hash new password
      const hashedPassword =
        await this.passwordService.hashPassword(newPassword);

      // Update password and clear reset token
      await this.userRepository.updatePassword(user.id, hashedPassword);
      await this.userRepository.clearResetToken(user.id);

      // Emit password changed event
      this.eventEmitter.emit(
        'user.password_changed',
        new PasswordChangedEvent(user.id, user.email, new Date()),
      );

      this.logger.log(`Password reset completed for user: ${user.email}`);

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }
      throw error;
    }
  }

  private async handleFailedLogin(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) return;

    const newAttempts = user.loginAttempts + 1;

    // Lock account after max attempts
    if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + this.LOCK_TIME);
      await this.userRepository.lockAccount(userId, lockUntil);
      this.logger.warn(
        `Account locked due to too many failed attempts: ${userId}`,
      );

      // Emit account locked event
      this.eventEmitter.emit(
        'user.account-locked',
        new UserAccountLockedEvent(
          user.id,
          user.email,
          new Date(),
          'Too many failed login attempts',
          lockUntil,
        ),
      );
    } else {
      await this.userRepository.incrementLoginAttempts(userId);
    }
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    // This method is now handled by userRepository.resetLoginAttempts
    // Keeping for backward compatibility but delegating to repository
    await this.userRepository.resetLoginAttempts(userId);
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 900; // 15 minutes default
    }
  }
}
