import { Schema } from 'mongoose'
import { IAccount } from '../interface'

const Account = new Schema<IAccount>(
  {
    displayName: { type: String, required: true },
    accountId: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, private: true },
    roles: {
      type: [String],
      default: ['user'],
      index: true
    },

    accountType: {
      type: String,
      default: 'account',
      index: true
    },

    status: {
      type: String,
      default: 'active',
      index: true
    },

    phoneNumber: { type: String, index: true },
    avatarUrl: { type: String },
    coverImageUrl: { type: String }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
)
Account.index({ displayName: 'text' }, { background: false })
export default Account
