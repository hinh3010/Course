import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CategoryModel, CourseModel, PurchaseModel } from 'src/models';
import { CreateCourseDto, UpdateCourseByIdDto } from './dto/course.dto';
import { toSlug } from 'src/libs/toSlug';
import { generateId } from 'src/libs/generateId';

@Injectable()
export class CoursesService {
  private async _genSlug(str: string): Promise<string> {
    const slug = toSlug(str);
    const existsSlug = await CourseModel.exists({ slug }).lean();

    if (existsSlug) {
      const code = generateId({ length: 3 });
      return await this._genSlug(str + `-${code}`);
    }

    return slug;
  }

  private async _getCategoryIds(categories: string[]) {
    const listCategory = await CategoryModel.find({ _id: { $in: categories } })
      .select('_id')
      .lean();

    if (!listCategory.length) throw new HttpException(`Categories ${categories.join(', ')} not found`, HttpStatus.NOT_FOUND);

    const categoryIds = listCategory.map((category) => category._id.toString());
    const categoriesNotFound = categories.filter((id) => !categoryIds.includes(id));
    if (categoriesNotFound.length) throw new HttpException(`Categories ${categoriesNotFound.join(', ')} not found`, HttpStatus.NOT_FOUND);

    return categoryIds.map((category) => category.toString());
  }

  async findAll() {
    const courses = await CourseModel.find({
      status: 'active',
      isPublished: true,
    })
      .populate({
        path: 'chapters',
        match: { isPublished: true },
      })
      .populate({
        path: 'categories',
      })
      .lean();

    return courses;
  }

  async findBySlug(slug: string) {
    const course = await CourseModel.findOne({
      slug,
      status: 'active',
      isPublished: true,
    })
      .populate({
        path: 'chapters',
        match: { isPublished: true },
      })
      .populate({
        path: 'categories',
      })
      .lean();
    return course;
  }

  async findById(courseId: string) {
    const course = await CourseModel.findOne({ _id: courseId, status: 'active', isPublished: true })
      .populate({
        path: 'chapters',
        match: { isPublished: true },
      })
      .populate({
        path: 'categories',
      })
      .lean();
    return course;
  }

  async checkout({ courseId, accountId }: { courseId: string; accountId: string }) {
    const course = await CourseModel.findOne({
      status: 'active',
      isPublished: true,
      _id: courseId,
    }).lean();

    if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    const purchase = await PurchaseModel.findOne({
      account: accountId,
      course: courseId,
    });

    if (purchase) throw new HttpException('Already purchased', HttpStatus.BAD_REQUEST);

    return (
      await PurchaseModel.create({
        account: accountId,
        course: courseId,
      })
    ).toJSON();
  }

  // mentor
  async create(createCourseDto: CreateCourseDto) {
    const { accountId, categories, isPublished, title } = createCourseDto;

    const doc = {
      title,
      isPublished,
      mentor: accountId,
      slug: await this._genSlug(title),
    };

    if (Array.isArray(categories) && categories.length > 0) {
      doc['categories'] = await this._getCategoryIds(categories);
    }

    const fieldsToCheck = ['basePrice', 'description', 'thumbnail', 'videoUrl'];
    fieldsToCheck.forEach((field) => {
      if (createCourseDto[field] !== undefined && createCourseDto[field] !== null) {
        doc[field] = createCourseDto[field];
      }
    });

    return (await CourseModel.create(doc)).toJSON();
  }

  async update(courseId: string, updateCourseDto: UpdateCourseByIdDto) {
    const { accountId, categories, title } = updateCourseDto;

    const course = await CourseModel.findOne({
      status: 'active',
      _id: courseId,
      mentor: accountId,
    }).lean();

    if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    const update = {};

    if (title && title !== course.title) {
      update['title'] = title;
      update['slug'] = await this._genSlug(title);
    }

    if (Array.isArray(categories) && categories.length > 0) {
      update['categories'] = categories.length > 0 ? await this._getCategoryIds(categories) : [];
    }

    const fieldsToCheck = ['basePrice', 'description', 'thumbnail', 'videoUrl', 'isPublished'];
    fieldsToCheck.forEach((field) => {
      const value = updateCourseDto[field];
      if (value !== undefined && value !== null && value !== course[field]) {
        update[field] = value;
      }
    });

    if (Object.keys(update).length) {
      return await CourseModel.findOneAndUpdate({ _id: courseId }, { $set: update }, { new: true });
    }

    return course;
  }

  async findMyCourses(accountId: string) {
    const courses = await CourseModel.find({
      mentor: accountId,
    })
      .populate({
        path: 'chapters',
      })
      .populate({
        path: 'categories',
      })
      .lean();

    return courses;
  }

  async findMyCourseById({ courseId, accountId }: { courseId: string; accountId: string }) {
    const course = await CourseModel.findOne({ _id: courseId, mentor: accountId })
      .populate({
        path: 'chapters',
      })
      .populate({
        path: 'categories',
      })
      .lean();
    return course;
  }

  async findMyCourseBySlug({ slug, accountId }: { slug: string; accountId: string }) {
    const course = await CourseModel.findOne({ slug: slug, mentor: accountId })
      .populate({
        path: 'chapters',
      })
      .populate({
        path: 'categories',
      })
      .lean();
    return course;
  }

  async deleteCourse({ courseId, accountId }: { courseId: string; accountId: string }) {
    const course = await CourseModel.findOneAndDelete({
      _id: courseId,
      mentor: accountId,
    }).lean();

    if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    return course;
  }
}
