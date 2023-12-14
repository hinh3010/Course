import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { RolesGuard } from 'src/middlewares/authenticate';
import { CategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(new RolesGuard('admin'))
  create(@Body() categoryDto: CategoryDto) {
    return this.categoriesService.create(categoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Patch(':id')
  @UseGuards(new RolesGuard('admin'))
  update(@Param('id') id: string, @Body() categoryDto: CategoryDto) {
    return this.categoriesService.update(id, categoryDto);
  }

  @Delete(':id')
  @UseGuards(new RolesGuard('admin'))
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
