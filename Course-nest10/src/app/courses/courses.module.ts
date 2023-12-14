import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { ChaptersModule } from './chapters/chapters.module';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [ChaptersModule],
})
export class CoursesModule {}
