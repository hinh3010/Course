import { Schema } from 'mongoose'
import { IUserProgress } from '../interface'

const UserProgress = new Schema<IUserProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Account'
    },
    chapter: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Chapter'
    },
    isCompleted: { type: Boolean, default: false }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
)

UserProgress.index({ user: 1, chapter: 1 }, { unique: true })
export default UserProgress
