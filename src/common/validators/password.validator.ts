// src/common/validators/password.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable, Inject } from '@nestjs/common';
import { PasswordService } from '@/common/services/password.service';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
@Injectable()
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly passwordService: PasswordService) {}

  validate(password: string, args: ValidationArguments) {
    if (!password) return false;

    // Get personal info from the object if available
    const object = args.object as any;
    const personalInfo = [];

    if (object.name) personalInfo.push(object.name);
    if (object.email) personalInfo.push(object.email.split('@')[0]);

    const validation = this.passwordService.validatePassword(
      password,
      {},
      personalInfo,
    );

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
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
