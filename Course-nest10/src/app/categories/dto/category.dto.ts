import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CategoryDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MinLength(3, { message: 'Name must be at least 8 characters long' })
  name: string;
}
