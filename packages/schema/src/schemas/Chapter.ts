import { Schema } from 'mongoose'
import { IChapter } from '../interface'

const Chapter = new Schema<IChapter>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String },
    thumbnail: { type: String },
    position: { type: Number },
    isPublished: { type: Boolean, default: true },
    isFree: { type: Boolean, default: false },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    // deleted: {
    //   type: {
    //     deletedAt: { type: Date, default: Date.now() },
    //     deletedBy: { type: String }
    //   }
    // }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
)
Chapter.index({ createdAt: -1 })
Chapter.index({ slug: 1, course: 1 }, { unique: true })
export default Chapter
