// src/auth/dto/change-password.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '@/common/validators/password.validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'currentPassword123!',
  })
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123!',
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @IsStrongPassword()
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'newPassword123!',
  })
  @IsString({ message: 'Confirm password must be a string' })
  confirmPassword: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Reset token must be a string' })
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123!',
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @IsStrongPassword()
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'newPassword123!',
  })
  @IsString({ message: 'Confirm password must be a string' })
  confirmPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsString({ message: 'Email must be a string' })
  email: string;
}
