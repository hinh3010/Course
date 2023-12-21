import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GetAccountContext } from 'src/decorators/getAccountContext';
import { RolesGuard } from 'src/middlewares/authenticate';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseByIdDto } from './dto/course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':courseId')
  findById(@Param('courseId') courseId: string) {
    return this.coursesService.findById(courseId);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Post(':courseId/checkout')
  @UseGuards(new RolesGuard())
  checkout(@Param('courseId') courseId: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.checkout({ courseId, accountId });
  }

  // mentor
  @Get('my-courses/:courseId')
  @UseGuards(new RolesGuard('mentor'))
  findMyCourseById(@Param('courseId') courseId: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.findMyCourseById({ courseId, accountId });
  }

  @Get('my-courses/slug/:slug')
  @UseGuards(new RolesGuard('mentor'))
  findMyCourseBySlug(@Param('slug') slug: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.findMyCourseBySlug({ slug, accountId });
  }

  @Get('my-courses')
  @UseGuards(new RolesGuard('mentor'))
  findMyCourses(@GetAccountContext('_id') accountId: string) {
    return this.coursesService.findMyCourses(accountId);
  }

  @Post('my-courses')
  @UseGuards(new RolesGuard('mentor'))
  createCourse(@Body() createCourseDto: CreateCourseDto, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.create({ ...createCourseDto, accountId });
  }

  @Patch('my-courses/:courseId')
  @UseGuards(new RolesGuard('mentor'))
  deleteCourse(@Param('courseId') courseId: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.deleteCourse({ courseId, accountId });
  }

  @Delete('my-courses/:courseId')
  @UseGuards(new RolesGuard('mentor'))
  updateCourse(@Param('courseId') courseId: string, @Body() updateCourseDto: UpdateCourseByIdDto, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.update(courseId, { ...updateCourseDto, accountId });
  }
}
