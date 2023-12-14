import { IAccount, ICategory, ICourse, IAttachment, IChapter, IPurchase, IUserProgress, IGlobalSetting } from '@hellocacbantre/schema';

export interface IAccountDocument extends IAccount, Document {}

export interface IAttachmentDocument extends IAttachment, Document {}

export interface ICategoryDocument extends ICategory, Document {}
export interface ICourseDocument extends ICourse, Document {}
export interface IChapterDocument extends IChapter, Document {}
export interface IUserProgressDocument extends IUserProgress, Document {}
export interface IPurchaseDocument extends IPurchase, Document {}

export interface IGlobalSettingDocument extends IGlobalSetting, Document {}
