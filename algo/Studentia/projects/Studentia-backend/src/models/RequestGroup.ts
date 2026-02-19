import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const RequestGroupSchema = new Schema(
  {
    studentId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    normalizedName: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

RequestGroupSchema.index({ studentId: 1, normalizedName: 1 }, { unique: true })

export type RequestGroupRecord = InferSchemaType<typeof RequestGroupSchema>

export const RequestGroupModel =
  mongoose.models.RequestGroup || mongoose.model('RequestGroup', RequestGroupSchema)
