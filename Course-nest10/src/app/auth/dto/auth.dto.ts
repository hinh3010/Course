import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString({ message: 'Display name must be a string' })
  @IsNotEmpty({ message: 'Display name must not be empty' })
  @MinLength(8, { message: 'Display name must be at least 8 characters long' })
  displayName: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  refetchToken: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refetchToken: string;
}

export class ChangePasswordDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  oldPassword: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;
}

export class ForgetPasswordDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;
}
