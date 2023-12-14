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

  @Post()
  @UseGuards(new RolesGuard('admin'))
  createCourse(@Body() createCourseDto: CreateCourseDto, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.create({ ...createCourseDto, accountId });
  }

  @Patch(':id')
  @UseGuards(new RolesGuard())
  updateCourse(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseByIdDto, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.update(id, { ...updateCourseDto, accountId });
  }

  @Post(':id/checkout')
  @UseGuards(new RolesGuard('admin'))
  checkout(@Param('id') id: string, @GetAccountContext('_id') accountId: string) {
    return this.coursesService.checkout({ id, accountId });
  }
}
