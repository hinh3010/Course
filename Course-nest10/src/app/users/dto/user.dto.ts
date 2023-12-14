import { IsEmpty, IsOptional, IsString, IsUrl, Matches, MinLength } from 'class-validator';

export class UpdateMeDto {
  @IsString({ message: 'Display name must be a string' })
  @MinLength(8, { message: 'Display name must be at least 8 characters long' })
  @IsOptional()
  displayName?: string;

  @IsString({ message: 'Phone Number must be a string' })
  @MinLength(10, { message: 'Phone Number must be at least 10 characters long' })
  @Matches(/^(\+?84|0)(\d{9,10})$/, { message: 'Invalid Vietnam phone number' })
  @IsOptional()
  phoneNumber?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;
}

export class UpdateUserDto {
  @IsString({ each: true, message: 'Roles must be an array of strings' })
  @IsOptional()
  roles?: ['user', 'admin', 'super admin', 'mentor'];

  @IsEmpty()
  @IsString({ message: 'Status must be a string' })
  @IsOptional()
  status?: 'active' | 'banned';
}
