import { IAccount, IAttachment, ICategory, IChapter, ICourse, IGlobalSetting, IPurchase, IUserProgress } from '@hellocacbantre/schema';
import { Model } from 'mongoose';

export interface IAccountModel extends Model<IAccount & Document> {}

export interface ICategoryModel extends Model<ICategory & Document> {}
export interface ICourseModel extends Model<ICourse & Document> {}
export interface IAttachmentModel extends Model<IAttachment & Document> {}
export interface IChapterModel extends Model<IChapter & Document> {}
export interface IUserProgressModel extends Model<IUserProgress & Document> {}
export interface IPurchaseModel extends Model<IPurchase & Document> {}

export interface IGlobalSettingModel extends Model<IGlobalSetting & Document> {}
