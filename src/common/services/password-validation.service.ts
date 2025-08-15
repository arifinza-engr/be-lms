// src/common/services/password-validation.service.ts
import { Injectable } from '@nestjs/common';
import { ValidationException } from '@/common/exceptions/domain.exceptions';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

@Injectable()
export class PasswordValidationService {
  private readonly minLength = 8;
  private readonly maxLength = 128;

  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    // Length validation
    if (password.length < this.minLength) {
      errors.push(
        `Password must be at least ${this.minLength} characters long`,
      );
    }

    if (password.length > this.maxLength) {
      errors.push(`Password must not exceed ${this.maxLength} characters`);
    }

    // Character type validation
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password,
    );

    if (!hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }

    if (!hasSpecialChars) {
      errors.push('Password must contain at least one special character');
    }

    // Common password patterns
    if (this.isCommonPassword(password)) {
      errors.push(
        'Password is too common. Please choose a more unique password',
      );
    }

    // Sequential characters
    if (this.hasSequentialChars(password)) {
      errors.push(
        'Password should not contain sequential characters (e.g., 123, abc)',
      );
    }

    // Repeated characters
    if (this.hasRepeatedChars(password)) {
      errors.push('Password should not contain too many repeated characters');
    }

    // Calculate strength
    if (errors.length === 0) {
      const criteriaCount = [
        hasLowercase,
        hasUppercase,
        hasNumbers,
        hasSpecialChars,
      ].filter(Boolean).length;

      if (password.length >= 12 && criteriaCount === 4) {
        strength = 'strong';
      } else if (password.length >= 10 && criteriaCount >= 3) {
        strength = 'medium';
      } else if (criteriaCount >= 2) {
        strength = 'medium';
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  validatePasswordStrength(password: string): void {
    const result = this.validatePassword(password);

    if (!result.isValid) {
      throw new ValidationException(
        `Password validation failed: ${result.errors.join(', ')}`,
      );
    }

    if (result.strength === 'weak') {
      throw new ValidationException(
        'Password is too weak. Please choose a stronger password',
      );
    }
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password',
      'password123',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password1',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      '1234567890',
      'dragon',
      'master',
      'hello',
      'freedom',
      'whatever',
      'qazwsx',
      'trustno1',
      'jordan23',
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  private hasSequentialChars(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      '0123456789',
      'qwertyuiopasdfghjklzxcvbnm',
    ];

    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 3; i++) {
        const subseq = sequence.substring(i, i + 3);
        if (password.toLowerCase().includes(subseq)) {
          return true;
        }
      }
    }

    return false;
  }

  private hasRepeatedChars(password: string): boolean {
    // Check for more than 2 consecutive identical characters
    const repeatedPattern = /(.)\1{2,}/;
    return repeatedPattern.test(password);
  }

  generatePasswordSuggestion(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';

    // Ensure at least one character from each category
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(numbers);
    password += this.getRandomChar(symbols);

    // Fill the rest randomly
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += this.getRandomChar(allChars);
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  private getRandomChar(chars: string): string {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }
}
