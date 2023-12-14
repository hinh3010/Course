import {
  IAccountDocument,
  IAttachmentDocument,
  ICategoryDocument,
  IChapterDocument,
  ICourseDocument,
  IGlobalSettingDocument,
  IPurchaseDocument,
  IUserProgressDocument,
} from 'src/types';
import { getModel } from 'src/libs/getDb';

export const AccountModel = getModel<IAccountDocument>('Account');

export const AttachmentModel = getModel<IAttachmentDocument>('Attachment');

export const CategoryModel = getModel<ICategoryDocument>('Category');
export const CourseModel = getModel<ICourseDocument>('Course');
export const ChapterModel = getModel<IChapterDocument>('Chapter');
export const UserProgressModel = getModel<IUserProgressDocument>('UserProgress');
export const PurchaseModel = getModel<IPurchaseDocument>('Purchase');

export const GlobalSettingModel = getModel<IGlobalSettingDocument>('GlobalSetting');
