import { Schema } from 'mongoose'
import { type IGlobalSetting } from '../interface'

const GlobalSetting = new Schema<IGlobalSetting>({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: String,
    required: true
  }
})

GlobalSetting.index({ createdAt: -1 })
export default GlobalSetting
