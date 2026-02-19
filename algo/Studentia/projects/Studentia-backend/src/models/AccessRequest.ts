import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const AccessRequestSchema = new Schema(
  {
    studentId: { type: String, required: true, index: true },
    requesterGroup: { type: String, required: true, index: true },
    dataGroup: { type: String, required: true },
    purpose: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    approvedTxId: { type: String },
    approvedReturnValue: { type: String },
    rejectReason: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export type AccessRequestRecord = InferSchemaType<typeof AccessRequestSchema>

export const AccessRequestModel =
  mongoose.models.AccessRequest || mongoose.model('AccessRequest', AccessRequestSchema)
