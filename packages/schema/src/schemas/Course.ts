import { Schema } from 'mongoose'
import { ICourse } from '../interface'

const Course = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    thumbnail: { type: String },
    videoUrl: { type: String },
    basePrice: { type: Number },
    isPublished: { type: Boolean, default: true },
    categories: [{ type: Schema.Types.ObjectId, index: true, ref: 'Category' }],
    chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }],
    mentor: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'Account'
    },
    status: { type: String, default: 'active' },
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
Course.index({ createdAt: -1 })
Course.index({ displayName: 'text' }, { background: false })
export default Course
