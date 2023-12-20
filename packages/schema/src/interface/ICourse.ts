import { ObjectId } from 'mongoose'

export interface IDeleted {
  deletedBy: ObjectId
  deletedAt: Date
}

export interface ICourse {
  title: string
  slug: string
  description: string
  thumbnail: string
  videoUrl: string
  basePrice: number
  isPublished: boolean
  status: 'active' | 'banned'

  mentor: ObjectId
  categories: ObjectId[]
  chapters: ObjectId[]
  // deleted: IDeleted
}

export interface ICategory {
  name: string
  slug: string
}

export interface IAttachment {
  fileUrl: string
  filePath: string
  filename: string
  type: 'image' | 'video' | 'audio' | 'document'
  size: number
  mimetype: string

  uploader: ObjectId
  course: ObjectId
  // deleted: IDeleted
}

export interface IChapter {
  title: string
  slug: string
  description: string
  videoUrl: string
  thumbnail: string
  position: number
  isPublished: boolean
  isFree: boolean

  course: ObjectId
  // deleted: IDeleted
}

export interface IUserProgress {
  user: ObjectId
  chapter: ObjectId
  isCompleted: boolean
}

export interface IPurchase {
  account: ObjectId
  course: ObjectId
}
