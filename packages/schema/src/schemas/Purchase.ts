import { Schema } from 'mongoose'
import { IPurchase } from '../interface'

const Purchase = new Schema<IPurchase>(
  {
    account: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Account'
    },
    course: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Course'
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
)

Purchase.index({ account: 1, course: 1 }, { unique: true })
export default Purchase
