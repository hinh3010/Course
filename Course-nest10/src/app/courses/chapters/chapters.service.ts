import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { generateId } from 'src/libs/generateId';
import { toSlug } from 'src/libs/toSlug';
import { ChapterModel, CourseModel, UserProgressModel } from 'src/models';
import {
  ChapterCreateAction,
  ChapterDeleteAction,
  ChapterReorderAction,
  ChapterUpdateAction,
  ChapterUpdateProgressAction,
  ChapterUpdatePublishAction,
} from './types';
import { withTransaction } from 'src/libs/withTransaction';

@Injectable()
export class ChaptersService {
  private async _genSlug(str: string, courseId: string): Promise<string> {
    const slug = toSlug(str);

    const existsSlug = await ChapterModel.exists({ slug, course: courseId }).lean();

    if (existsSlug) {
      const code = generateId({ length: 3 });
      return await this._genSlug(str + `-${code}`, courseId);
    }

    return slug;
  }

  private async _getCourseById(courseId: string) {
    const course = await CourseModel.findOne({
      status: 'active',
      isPublished: true,
      _id: courseId,
    }).lean();

    if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    return course;
  }

  async findAllChaptersByCourse(courseId: string) {
    await this._getCourseById(courseId);

    const chapters = await ChapterModel.find({
      isPublished: true,
      course: courseId,
    })
      .sort({ position: 1 })
      .lean();

    return chapters;
  }

  async findChapterByCourse(payload: { courseId: string; chapterId: string }) {
    const { courseId, chapterId } = payload;

    await this._getCourseById(courseId);

    const chapter = await ChapterModel.findOne({
      isPublished: true,
      course: courseId,
      _id: chapterId,
    }).lean();

    if (!chapter) throw new HttpException('Chapter not found', HttpStatus.NOT_FOUND);

    return chapter;
  }

  async createChapterByCourse(payload: ChapterCreateAction) {
    const { courseId, createChapterDto, accountId } = payload;

    const course = await this._getCourseById(courseId);
    if (course.mentor.toString() !== accountId) throw new HttpException('You do not have permission', HttpStatus.NOT_FOUND);

    const { title, isFree, isPublished } = createChapterDto;

    const doc = {
      title,
      isPublished: isPublished ?? false,
      isFree: isFree ?? false,
      slug: await this._genSlug(title, courseId),
      course: courseId,
    };

    const fieldsToCheck = ['description', 'thumbnail', 'videoUrl'];
    fieldsToCheck.forEach((field) => {
      if (createChapterDto[field] !== undefined && createChapterDto[field] !== null) {
        doc[field] = createChapterDto[field];
      }
    });

    // const lastChapter = await ChapterModel.findOne({
    //   course: courseId,
    // })
    //   .select('position')
    //   .sort({ createdAt: -1 })
    //   .lean();

    // const position = lastChapter?.position ? lastChapter?.position + 1 : 1;
    // doc['position'] = position;

    const chapter = await withTransaction(async (session) => {
      const [chapter] = await ChapterModel.create([doc], { session });
      await CourseModel.findOneAndUpdate({ _id: courseId }, { $push: { chapters: chapter._id } }, { session });
      return chapter;
    });

    return chapter;
  }

  async updateChapterByCourse(payload: ChapterUpdateAction) {
    const { courseId, chapterId, updateChapterDto, accountId } = payload;

    const course = await this._getCourseById(courseId);
    if (course.mentor.toString() !== accountId) throw new HttpException('You do not have permission', HttpStatus.NOT_FOUND);

    const chapter = await ChapterModel.findOne({
      _id: chapterId,
      course: courseId,
    }).lean();

    if (!chapter) throw new HttpException('Chapter not found', HttpStatus.NOT_FOUND);

    const { title } = updateChapterDto;

    const update = {};

    if (title && title !== chapter.title) {
      update['title'] = title;
      update['slug'] = await this._genSlug(title, courseId);
    }

    const fieldsToCheck = ['description', 'thumbnail', 'videoUrl', 'isPublished', 'isFree'];
    fieldsToCheck.forEach((field) => {
      const value = updateChapterDto[field];
      if (value !== undefined && value !== null && value !== chapter[field]) {
        update[field] = value;
      }
    });

    if (Object.keys(update).length) {
      return await ChapterModel.findOneAndUpdate({ _id: chapterId }, { $set: update }, { new: true });
    }

    return chapter;
  }

  // mentor
  async deleteChapterByCourse(payload: ChapterDeleteAction) {
    const { courseId, chapterId, accountId } = payload;

    const course = await this._getCourseById(courseId);
    if (course.mentor.toString() !== accountId) throw new HttpException('You do not have permission', HttpStatus.NOT_FOUND);

    const chapter = await ChapterModel.findByIdAndDelete({
      _id: chapterId,
      course: courseId,
    }).lean();

    if (!chapter) throw new HttpException('Chapter not found', HttpStatus.NOT_FOUND);
    return chapter;
  }

  // change position
  async reorder(payload: ChapterReorderAction) {
    const { courseId, chaptersDto, accountId } = payload;

    const course = await this._getCourseById(courseId);
    if (course.mentor.toString() !== accountId) throw new HttpException('You do not have permission', HttpStatus.NOT_FOUND);

    const bulkReorder = [];

    for (const chapter of chaptersDto.chapters) {
      const { chapterId, position } = chapter;

      bulkReorder.push({
        updateOne: {
          filter: { _id: chapterId },
          update: { $set: { position } },
        },
      });
    }

    await ChapterModel.bulkWrite(bulkReorder);

    return true;
  }

  // change publish
  async changePublish(payload: ChapterUpdatePublishAction) {
    const { courseId, chapterId, isPublished, accountId } = payload;

    const course = await this._getCourseById(courseId);
    if (course.mentor.toString() !== accountId) throw new HttpException('You do not have permission', HttpStatus.NOT_FOUND);

    const chapter = await ChapterModel.findOneAndUpdate({ _id: chapterId, course: courseId }, { $set: { isPublished: isPublished } }, { new: true });

    if (!chapter) throw new HttpException('Chapter not found', HttpStatus.NOT_FOUND);

    return chapter;
  }

  // change progress
  async progress(payload: ChapterUpdateProgressAction) {
    const { courseId, chapterId, accountId, isCompleted } = payload;

    await this._getCourseById(courseId);

    const progress = await UserProgressModel.findOneAndUpdate(
      { chapter: chapterId, user: accountId },
      { $set: { chapter: chapterId, user: accountId, isCompleted: isCompleted } },
      { new: true, upsert: true },
    );

    return progress;
  }
}
