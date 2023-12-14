import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CategoryDto } from './dto/category.dto';
import { CategoryModel } from 'src/models';
import { toSlug } from 'src/libs/toSlug';

@Injectable()
export class CategoriesService {
  async create(categoryDto: CategoryDto) {
    const name = categoryDto.name.trim();

    const isExists = await CategoryModel.exists({ name }).lean();
    if (isExists) throw new HttpException('Category is exists', HttpStatus.NOT_FOUND);

    return (await CategoryModel.create({ name, slug: toSlug(name) })).toJSON();
  }

  async findAll() {
    return await CategoryModel.find({}).lean();
  }

  async update(id: string, categoryDto: CategoryDto) {
    const name = categoryDto.name.trim();

    const category = await CategoryModel.findById(id);
    if (!category) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    if (name === category.name) throw new HttpException(`Old and new name must be different for ${name}`, HttpStatus.BAD_REQUEST);

    const isExists = await CategoryModel.exists({ name }).lean();
    if (isExists) throw new HttpException('Category is exists', HttpStatus.NOT_FOUND);

    category.name = name;
    category.slug = toSlug(name);
    await category.save();

    return category.toJSON();
  }

  async remove(id: string) {
    const category = await CategoryModel.findOneAndDelete({ _id: id }).lean();
    if (!category) throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    return true;
  }
}
