import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const EncryptedPayloadSchema = new Schema(
  {
    iv: { type: String, required: true },
    tag: { type: String, required: true },
    data: { type: String, required: true },
  },
  { _id: false }
)

const DocumentSchema = new Schema(
  {
    studentId: { type: String, required: true, index: true },
    receiverGroup: { type: String, required: true },
    dataGroup: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    fileBase64: { type: String },
    encryptedBlob: { type: EncryptedPayloadSchema },
    storageMode: { type: String, enum: ['plain', 'encrypted'], required: true },
    sharedWith: { type: [String], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export type DocumentRecord = InferSchemaType<typeof DocumentSchema>

export const DocumentModel =
  mongoose.models.Document || mongoose.model('Document', DocumentSchema)
