// src/common/validators/password-standalone.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPasswordStandalone', async: false })
export class IsStrongPasswordStandaloneConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string, args: ValidationArguments) {
    if (!password) return false;

    // Get personal info from the object if available
    const object = args.object as any;
    const personalInfo = [];

    if (object.name) personalInfo.push(object.name);
    if (object.email) personalInfo.push(object.email.split('@')[0]);

    const validation = this.performValidation(password, personalInfo);

    // Store validation result for custom message
    (args as any).validationResult = validation;

    return validation.isValid;
  }

  defaultMessage(args: ValidationArguments) {
    const validation = (args as any).validationResult;
    if (validation && validation.errors.length > 0) {
      return validation.errors.join('. ');
    }
    return 'Password does not meet security requirements';
  }

  private performValidation(password: string, personalInfo: string[] = []) {
    const errors: string[] = [];
    let score = 0;

    // Length validation
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score += 25;
    }

    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    // Character type requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

    if (!hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 15;
    }

    if (!hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 15;
    }

    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    } else {
      score += 15;
    }

    if (!hasSpecialChars) {
      errors.push(
        'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
      );
    } else {
      score += 20;
    }

    // Common password check
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push(
        'Password is too common. Please choose a more unique password',
      );
      score -= 30;
    }

    // Personal info check
    const lowerPassword = password.toLowerCase();
    for (const info of personalInfo) {
      if (info.length >= 3 && lowerPassword.includes(info.toLowerCase())) {
        errors.push('Password must not contain personal information');
        score -= 20;
        break;
      }
    }

    // Repeating characters check
    let repeatCount = 1;
    for (let i = 1; i < password.length; i++) {
      if (password[i] === password[i - 1]) {
        repeatCount++;
        if (repeatCount > 3) {
          errors.push(
            'Password must not have more than 3 repeating characters',
          );
          score -= 15;
          break;
        }
      } else {
        repeatCount = 1;
      }
    }

    score = Math.max(0, Math.min(100, score));
    const isValid = errors.length === 0 && score >= 50;

    return {
      isValid,
      errors,
      strength:
        score < 30
          ? 'weak'
          : score < 60
            ? 'medium'
            : score < 80
              ? 'strong'
              : 'very_strong',
      score: Math.round(score),
    };
  }
}

export function IsStrongPasswordStandalone(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordStandaloneConstraint,
    });
  };
}
