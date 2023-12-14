import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class BaseChapterDto {
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean = false;
}

export class CreateChapterDto extends BaseChapterDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  courseId: string;
  accountId: string;
}

export class UpdateChapterByIdDto extends BaseChapterDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title?: string;
}

export class ChapterPositionDto {
  @IsString({ message: 'Chapter ID must be a string' })
  @IsNotEmpty({ message: 'Chapter ID must not be empty' })
  chapterId: string;

  @IsNumber({}, { message: 'Position must be a number' })
  position: number;
}

export class UpdateChapterPositionsDto {
  chapters: ChapterPositionDto[];
}
