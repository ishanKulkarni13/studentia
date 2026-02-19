import mongoose from 'mongoose'

let isConnected = false

export async function connectMongo() {
  if (isConnected) return

  const mongoUri = process.env.MONGODB_URI || ''
  if (!mongoUri) {
    throw new Error('MONGODB_URI env not set')
  }

  await mongoose.connect(mongoUri)
  isConnected = true
  console.log('MongoDB connected')
}
