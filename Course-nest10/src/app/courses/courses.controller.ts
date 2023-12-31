import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GetAccountContext } from 'src/decorators/getAccountContext';
import { RolesGuard } from 'src/middlewares/authenticate';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseByIdDto } from './dto/course.dto';

@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('courses')
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('courses/:courseId')
  findById(@Param('courseId') courseId: string) {
    return this.coursesService.findById(courseId);
  }

  @Get('courses/slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  // user
  @Post(':courseId/checkout')
  @UseGuards(new RolesGuard())
  checkout(@Param('courseId') courseId: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.checkout({ courseId, accountId });
  }

  @Get('my-courses')
  @UseGuards(new RolesGuard('user'))
  myCourses(@GetAccountContext('_id') accountId: string) {
    return this.coursesService.myCourses({ accountId });
  }

  @Get('my-courses/:slug')
  @UseGuards(new RolesGuard('user'))
  myCourseBySlug(@Param('slug') slug: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.myCourseBySlug({ accountId, slug });
  }

  // mentor
  @Get('mentor/courses/:slug')
  @UseGuards(new RolesGuard('mentor'))
  getCourseByMentor(@Param('slug') slug: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.getCourseByMentor({ slug, accountId });
  }

  @Get('mentor/courses')
  @UseGuards(new RolesGuard('mentor'))
  getCoursesByMentor(@GetAccountContext('_id') accountId: string) {
    return this.coursesService.getCoursesByMentor(accountId);
  }

  @Post('mentor/courses')
  @UseGuards(new RolesGuard('mentor'))
  createCourse(@Body() createCourseDto: CreateCourseDto, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.create({ ...createCourseDto, accountId });
  }

  @Delete('mentor/courses/:courseId')
  @UseGuards(new RolesGuard('mentor'))
  deleteCourse(@Param('courseId') courseId: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.deleteCourse({ courseId, accountId });
  }

  @Patch('mentor/courses/:courseId')
  @UseGuards(new RolesGuard('mentor'))
  updateCourse(@Param('courseId') courseId: string, @Body() updateCourseDto: UpdateCourseByIdDto, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.updateCourse(courseId, { ...updateCourseDto, accountId });
  }
}
