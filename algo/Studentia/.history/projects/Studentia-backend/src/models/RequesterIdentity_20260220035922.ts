import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const RequesterIdentitySchema = new Schema(
  {
    studentId: { type: String, required: true, index: true },
    requestGroupName: { type: String, required: true },
    requestGroupNormalized: { type: String, required: true, index: true },
    displayName: { type: String, required: true },
    email: { type: String },
    walletAddress: { type: String },
    organization: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

RequesterIdentitySchema.index({ studentId: 1, requestGroupNormalized: 1 })

export type RequesterIdentityRecord = InferSchemaType<typeof RequesterIdentitySchema>

export const RequesterIdentityModel =
  mongoose.models.RequesterIdentity ||
  mongoose.model('RequesterIdentity', RequesterIdentitySchema)
