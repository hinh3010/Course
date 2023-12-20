import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Post(':id/checkout')
  @UseGuards(new RolesGuard('admin'))
  checkout(@Param('id') id: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.checkout({ id, accountId });
  }

  // mentor
  @Get('my-courses/:courseId')
  @UseGuards(new RolesGuard('admin'))
  findMyCourseById(@Param('courseId') courseId: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.findMyCourseById({ courseId, accountId });
  }

  @Get('my-courses')
  @UseGuards(new RolesGuard('admin'))
  findMyCourses(@GetAccountContext('_id') accountId: string) {
    return this.coursesService.findMyCourses(accountId);
  }

  @Post('my-courses')
  @UseGuards(new RolesGuard('admin'))
  createCourse(@Body() createCourseDto: CreateCourseDto, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.create({ ...createCourseDto, accountId });
  }

  @Patch('my-courses/:id')
  @UseGuards(new RolesGuard('admin'))
  updateCourse(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseByIdDto, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.update(id, { ...updateCourseDto, accountId });
  }
}
