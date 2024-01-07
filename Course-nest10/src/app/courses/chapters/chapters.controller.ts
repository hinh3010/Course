import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GetAccountContext } from 'src/decorators/getAccountContext';
import { RolesGuard } from 'src/middlewares/authenticate';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto, UpdateChapterByIdDto, UpdateChapterPositionsDto } from './dto/chapter.dto';
import {
  ChapterCreateAction,
  ChapterDeleteAction,
  ChapterReorderAction,
  ChapterUpdateAction,
  ChapterUpdateProgressAction,
  ChapterUpdatePublishAction,
} from './types';

@Controller()
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get('courses/:courseId/chapters')
  findAllChaptersByCourse(@Param('courseId') courseId: string) {
    return this.chaptersService.findAllChaptersByCourse(courseId);
  }

  @Get('courses/:courseId/chapters:chapterId')
  findChapterByCourse(@Param('courseId') courseId: string, @Param('chapterId') chapterId: string) {
    const payload = {
      courseId,
      chapterId,
    };

    return this.chaptersService.findChapterByCourse(payload);
  }

  // mentor
  @Get('mentor/courses/:courseSlug/chapters/:chapterId')
  @UseGuards(new RolesGuard('mentor'))
  findChapterByMentor(@Param('courseSlug') courseSlug: string, @Param('chapterId') chapterId: string, @GetAccountContext('_id') accountId: string) {
    const payload = {
      courseSlug,
      chapterId,
      accountId,
    };

    return this.chaptersService.findChapterByMentor(payload);
  }

  @Post('mentor/courses/:courseId/chapters')
  @UseGuards(new RolesGuard('mentor'))
  createChapterByCourse(
    @Param('courseId') courseId: string,
    @Body() createChapterDto: CreateChapterDto,
    @GetAccountContext('_id') accountId: string,
  ) {
    const payload: ChapterCreateAction = {
      courseId,
      createChapterDto,
      accountId,
    };

    return this.chaptersService.createChapterByCourse(payload);
  }

  @Patch('mentor/courses/:courseId/chapters/:chapterId')
  @UseGuards(new RolesGuard('mentor'))
  updateChapterByCourse(
    @Param('courseId') courseId: string,
    @Param('chapterId') chapterId: string,
    @Body() updateChapterDto: UpdateChapterByIdDto,
    @GetAccountContext('_id') accountId: string,
  ) {
    const payload: ChapterUpdateAction = {
      courseId,
      chapterId,
      updateChapterDto,
      accountId,
    };

    return this.chaptersService.updateChapterByCourse(payload);
  }

  @Delete('mentor/courses/:courseId/chapters/:chapterId')
  @UseGuards(new RolesGuard('mentor'))
  deleteChapterByCourse(@Param('courseId') courseId: string, @Param('chapterId') chapterId: string, @GetAccountContext('_id') accountId: string) {
    const payload: ChapterDeleteAction = {
      courseId,
      chapterId,
      accountId,
    };

    return this.chaptersService.deleteChapterByCourse(payload);
  }

  @Patch('mentor/courses/:courseId/chapters/reorder')
  @UseGuards(new RolesGuard('mentor'))
  reorder(@Param('courseId') courseId: string, @Body() chaptersDto: UpdateChapterPositionsDto, @GetAccountContext('_id') accountId: string) {
    const payload: ChapterReorderAction = {
      courseId,
      chaptersDto,
      accountId,
    };

    return this.chaptersService.reorder(payload);
  }

  @Patch('mentor/courses/:courseId/chapters/:chapterId/publish')
  @UseGuards(new RolesGuard('mentor'))
  publish(@Param('courseId') courseId: string, @Param('chapterId') chapterId: string, @GetAccountContext('_id') accountId: string) {
    const payload: ChapterUpdatePublishAction = {
      courseId,
      chapterId,
      isPublished: true,
      accountId,
    };

    return this.chaptersService.changePublish(payload);
  }

  @Patch('mentor/courses/:courseId/chapters/:chapterId/unpublish')
  @UseGuards(new RolesGuard('mentor'))
  unpublish(@Param('courseId') courseId: string, @Param('chapterId') chapterId: string, @GetAccountContext('_id') accountId: string) {
    const payload: ChapterUpdatePublishAction = {
      courseId,
      chapterId,
      isPublished: false,
      accountId,
    };

    return this.chaptersService.changePublish(payload);
  }

  // user progress
  @Post('mentor/courses/:courseId/chapters/:chapterId/progress')
  @UseGuards(new RolesGuard('user'))
  progress(
    @Body('isCompleted') isCompleted: boolean,
    @Param('courseId') courseId: string,
    @Param('chapterId') chapterId: string,
    @GetAccountContext('_id') accountId: string,
  ) {
    const payload: ChapterUpdateProgressAction = {
      courseId,
      chapterId,
      accountId,
      isCompleted,
    };

    return this.chaptersService.progress(payload);
  }
}
