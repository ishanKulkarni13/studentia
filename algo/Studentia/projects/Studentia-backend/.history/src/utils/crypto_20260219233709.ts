import crypto from 'crypto'

const keyB64 = process.env.DATA_ENC_KEY || ''
const key = keyB64 ? Buffer.from(keyB64, 'base64') : null
const ALGO = 'aes-256-gcm'

export function encryptBlob(plain: string) {
  if (!key || key.length !== 32) throw new Error('DATA_ENC_KEY missing or invalid (need 32-byte base64)')
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: enc.toString('base64'),
  }
}

export function decryptBlob(payload: { iv: string; tag: string; data: string }) {
  if (!key || key.length !== 32) throw new Error('DATA_ENC_KEY missing or invalid (need 32-byte base64)')
  const iv = Buffer.from(payload.iv, 'base64')
  const tag = Buffer.from(payload.tag, 'base64')
  const data = Buffer.from(payload.data, 'base64')
  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(data), decipher.final()])
  return dec.toString('utf8')
}
