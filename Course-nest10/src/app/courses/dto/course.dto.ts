// import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

// export class CreateCourseDto {
//   @IsString({ message: 'Title must be a string' })
//   @IsNotEmpty({ message: 'Title must not be empty' })
//   @MinLength(8, { message: 'Title must be at least 8 characters long' })
//   title: string;

//   @IsString({ message: 'Description must be a string' })
//   @IsOptional()
//   description?: string;

//   @IsUrl()
//   @IsOptional()
//   thumbnail?: string;

//   @IsUrl()
//   @IsOptional()
//   videoUrl?: string;

//   @IsNumber()
//   @IsOptional()
//   basePrice?: number;

//   @IsBoolean()
//   @IsOptional()
//   isPublished?: boolean;

//   @IsArray()
//   @IsOptional()
//   categories?: [string];
// }

// export class UpdateCourseByIdDto {
//   @IsString({ message: 'Title must be a string' })
//   @MinLength(8, { message: 'Title must be at least 8 characters long' })
//   title: string;

//   @IsString({ message: 'Description must be a string' })
//   @IsOptional()
//   description?: string;

//   @IsUrl()
//   @IsOptional()
//   thumbnail?: string;

//   @IsUrl()
//   @IsOptional()
//   videoUrl?: string;

//   @IsNumber()
//   @IsOptional()
//   basePrice?: number;

//   @IsBoolean()
//   @IsOptional()
//   isPublished?: boolean;

//   @IsArray()
//   @IsOptional()
//   categories?: [string];
// }

import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { IsArrayMongoIds } from 'src/validation';

export class BaseCourseDto {
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @IsOptional()
  basePrice?: number = 0;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean = false;

  @IsArray()
  @IsOptional()
  @IsArrayMongoIds({ message: 'Categories must be an array of valid ObjectIds' })
  categories?: [string];

  @IsOptional()
  accountId?: string;
}

export class CreateCourseDto extends BaseCourseDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MinLength(8, { message: 'Title must be at least 8 characters long' })
  title: string;
}

export class UpdateCourseByIdDto extends BaseCourseDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(8, { message: 'Title must be at least 8 characters long' })
  title?: string;
}
