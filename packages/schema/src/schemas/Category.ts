import { Schema } from 'mongoose'
import { ICategory } from '../interface'

const Category = new Schema<ICategory>(
  {
    name: { type: String, required: true, index: true, unique: true },
    slug: { type: String, required: true, unique: true }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
)

export default Category
