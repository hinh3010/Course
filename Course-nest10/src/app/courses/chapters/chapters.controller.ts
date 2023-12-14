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

@Controller('courses/:courseId/chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get()
  findAllChaptersByCourse(@Param('courseId') courseId: string) {
    return this.chaptersService.findAllChaptersByCourse(courseId);
  }

  @Get(':chapterId')
  findChapterByCourse(@Param('courseId') courseId: string, @Param('chapterId') chapterId: string) {
    const payload = {
      courseId,
      chapterId,
    };

    return this.chaptersService.findChapterByCourse(payload);
  }

  @Post()
  @UseGuards(new RolesGuard('admin'))
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

  @Patch(':chapterId')
  @UseGuards(new RolesGuard('admin'))
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

  @Delete(':chapterId')
  @UseGuards(new RolesGuard('admin'))
  deleteChapterByCourse(@Param('courseId') courseId: string, @Param('chapterId') chapterId: string, @GetAccountContext('_id') accountId: string) {
    const payload: ChapterDeleteAction = {
      courseId,
      chapterId,
      accountId,
    };

    return this.chaptersService.deleteChapterByCourse(payload);
  }

  @Patch('reorder')
  @UseGuards(new RolesGuard('admin'))
  reorder(@Param('courseId') courseId: string, @Body() chaptersDto: UpdateChapterPositionsDto, @GetAccountContext('_id') accountId: string) {
    const payload: ChapterReorderAction = {
      courseId,
      chaptersDto,
      accountId,
    };

    return this.chaptersService.reorder(payload);
  }

  // publish
  @Patch(':chapterId/publish')
  @UseGuards(new RolesGuard('admin'))
  publish(@Param('courseId') courseId: string, @Param('chapterId') chapterId: string, @GetAccountContext('_id') accountId: string) {
    const payload: ChapterUpdatePublishAction = {
      courseId,
      chapterId,
      isPublished: true,
      accountId,
    };

    return this.chaptersService.changePublish(payload);
  }

  @Patch(':chapterId/unpublish')
  @UseGuards(new RolesGuard('admin'))
  unpublish(@Param('courseId') courseId: string, @Param('chapterId') chapterId: string, @GetAccountContext('_id') accountId: string) {
    const payload: ChapterUpdatePublishAction = {
      courseId,
      chapterId,
      isPublished: false,
      accountId,
    };

    return this.chaptersService.changePublish(payload);
  }

  // progress
  @Post(':chapterId/progress')
  @UseGuards(new RolesGuard('admin'))
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
