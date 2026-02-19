import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const DataGroupSchema = new Schema(
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

DataGroupSchema.index({ studentId: 1, normalizedName: 1 }, { unique: true })

export type DataGroupRecord = InferSchemaType<typeof DataGroupSchema>

export const DataGroupModel =
  mongoose.models.DataGroup || mongoose.model('DataGroup', DataGroupSchema)
