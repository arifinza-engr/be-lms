// src/common/services/password.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ValidationException } from '@/common/exceptions/domain.exceptions';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number; // 0-100
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbidCommonPasswords: boolean;
  forbidPersonalInfo: boolean;
  maxRepeatingChars: number;
}

@Injectable()
export class PasswordService {
  private readonly defaultPolicy: PasswordPolicy = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbidCommonPasswords: true,
    forbidPersonalInfo: true,
    maxRepeatingChars: 3,
  };

  private readonly commonPasswords = new Set([
    'password',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
    'password1',
    'qwerty123',
    'admin123',
    'root',
    'toor',
    'pass',
    '12345678',
    'indonesia',
    'jakarta',
    'bandung',
    'surabaya',
    'medan',
  ]);

  private readonly specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  /**
   * Validate password against policy
   */
  validatePassword(
    password: string,
    policy: Partial<PasswordPolicy> = {},
    personalInfo: string[] = [],
  ): PasswordValidationResult {
    const activePolicy = { ...this.defaultPolicy, ...policy };
    const errors: string[] = [];
    let score = 0;

    // Length validation
    if (password.length < activePolicy.minLength) {
      errors.push(
        `Password must be at least ${activePolicy.minLength} characters long`,
      );
    } else {
      score += Math.min(25, (password.length / activePolicy.minLength) * 25);
    }

    if (password.length > activePolicy.maxLength) {
      errors.push(
        `Password must not exceed ${activePolicy.maxLength} characters`,
      );
    }

    // Character type requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = new RegExp(
      `[${this.escapeRegex(this.specialChars)}]`,
    ).test(password);

    if (activePolicy.requireUppercase && !hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (hasUppercase) {
      score += 15;
    }

    if (activePolicy.requireLowercase && !hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (hasLowercase) {
      score += 15;
    }

    if (activePolicy.requireNumbers && !hasNumbers) {
      errors.push('Password must contain at least one number');
    } else if (hasNumbers) {
      score += 15;
    }

    if (activePolicy.requireSpecialChars && !hasSpecialChars) {
      errors.push(
        `Password must contain at least one special character (${this.specialChars})`,
      );
    } else if (hasSpecialChars) {
      score += 20;
    }

    // Common password check
    if (activePolicy.forbidCommonPasswords && this.isCommonPassword(password)) {
      errors.push(
        'Password is too common. Please choose a more unique password',
      );
      score -= 30;
    }

    // Personal info check
    if (
      activePolicy.forbidPersonalInfo &&
      this.containsPersonalInfo(password, personalInfo)
    ) {
      errors.push('Password must not contain personal information');
      score -= 20;
    }

    // Repeating characters check
    if (
      this.hasExcessiveRepeatingChars(password, activePolicy.maxRepeatingChars)
    ) {
      errors.push(
        `Password must not have more than ${activePolicy.maxRepeatingChars} repeating characters`,
      );
      score -= 15;
    }

    // Pattern checks
    if (this.hasSequentialChars(password)) {
      errors.push(
        'Password must not contain sequential characters (e.g., 123, abc)',
      );
      score -= 10;
    }

    // Bonus points for complexity
    const uniqueChars = new Set(password).size;
    score += Math.min(10, (uniqueChars / password.length) * 10);

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    const strength = this.calculateStrength(score);
    const isValid = errors.length === 0 && score >= 50; // Minimum score for valid password

    return {
      isValid,
      errors,
      strength,
      score: Math.round(score),
    };
  }

  /**
   * Hash password with secure settings
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 14; // High cost for security
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = this.specialChars;

    const allChars = uppercase + lowercase + numbers + special;
    let password = '';

    // Ensure at least one character from each required type
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(numbers);
    password += this.getRandomChar(special);

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += this.getRandomChar(allChars);
    }

    // Shuffle the password
    return this.shuffleString(password);
  }

  /**
   * Check if password needs to be updated (based on age or policy changes)
   */
  shouldUpdatePassword(
    passwordChangedAt: Date,
    maxAgeInDays: number = 90,
  ): boolean {
    const ageInDays =
      (Date.now() - passwordChangedAt.getTime()) / (1000 * 60 * 60 * 24);
    return ageInDays > maxAgeInDays;
  }

  /**
   * Validate password change request
   */
  validatePasswordChange(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
    currentHash: string,
    personalInfo: string[] = [],
  ): Promise<{ isValid: boolean; errors: string[] }> {
    return new Promise(async (resolve) => {
      const errors: string[] = [];

      // Verify current password
      const isCurrentValid = await this.verifyPassword(
        currentPassword,
        currentHash,
      );
      if (!isCurrentValid) {
        errors.push('Current password is incorrect');
      }

      // Check if new password is different from current
      const isSamePassword = await this.verifyPassword(
        newPassword,
        currentHash,
      );
      if (isSamePassword) {
        errors.push('New password must be different from current password');
      }

      // Confirm password match
      if (newPassword !== confirmPassword) {
        errors.push('New password and confirmation do not match');
      }

      // Validate new password
      const validation = this.validatePassword(newPassword, {}, personalInfo);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }

      resolve({
        isValid: errors.length === 0,
        errors,
      });
    });
  }

  private isCommonPassword(password: string): boolean {
    return this.commonPasswords.has(password.toLowerCase());
  }

  private containsPersonalInfo(
    password: string,
    personalInfo: string[],
  ): boolean {
    const lowerPassword = password.toLowerCase();
    return personalInfo.some(
      (info) => info.length >= 3 && lowerPassword.includes(info.toLowerCase()),
    );
  }

  private hasExcessiveRepeatingChars(
    password: string,
    maxRepeating: number,
  ): boolean {
    let count = 1;
    for (let i = 1; i < password.length; i++) {
      if (password[i] === password[i - 1]) {
        count++;
        if (count > maxRepeating) {
          return true;
        }
      } else {
        count = 1;
      }
    }
    return false;
  }

  private hasSequentialChars(password: string): boolean {
    const sequences = [
      '0123456789',
      'abcdefghijklmnopqrstuvwxyz',
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm',
    ];

    const lowerPassword = password.toLowerCase();

    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 3; i++) {
        const subseq = sequence.substring(i, i + 3);
        const reverseSubseq = subseq.split('').reverse().join('');

        if (
          lowerPassword.includes(subseq) ||
          lowerPassword.includes(reverseSubseq)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private calculateStrength(
    score: number,
  ): 'weak' | 'medium' | 'strong' | 'very_strong' {
    if (score < 30) return 'weak';
    if (score < 60) return 'medium';
    if (score < 80) return 'strong';
    return 'very_strong';
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private getRandomChar(chars: string): string {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }

  private shuffleString(str: string): string {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }
}
