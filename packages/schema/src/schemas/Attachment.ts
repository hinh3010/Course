import { Schema } from 'mongoose'
import { IAttachment } from '../interface'

const Attachment = new Schema<IAttachment>({
  filePath: { type: String },
  filename: { type: String },
  fileUrl: { type: String },
  type: { type: String },
  size: { type: Number },
  mimetype: { type: String },
  uploader: { type: Schema.Types.ObjectId, required: true, ref: 'Account' }
  // deleted: {
  //   type: {
  //     deletedAt: { type: Date, default: Date.now() },
  //     deletedBy: { type: String }
  //   }
  // }
})
export default Attachment
