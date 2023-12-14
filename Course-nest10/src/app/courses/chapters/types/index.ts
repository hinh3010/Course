import { CreateChapterDto, UpdateChapterByIdDto, UpdateChapterPositionsDto } from '../dto/chapter.dto';

type BaseChapter = {
  courseId: string;
  accountId: string;
};

export type ChapterCreateAction = BaseChapter & { createChapterDto: CreateChapterDto };
export type ChapterUpdateAction = BaseChapter & { chapterId: string; updateChapterDto: UpdateChapterByIdDto };
export type ChapterDeleteAction = BaseChapter & { chapterId: string };
export type ChapterReorderAction = BaseChapter & { chaptersDto: UpdateChapterPositionsDto };
export type ChapterUpdatePublishAction = BaseChapter & { chapterId: string; isPublished: boolean };
export type ChapterUpdateProgressAction = BaseChapter & { chapterId: string; isCompleted: boolean };
