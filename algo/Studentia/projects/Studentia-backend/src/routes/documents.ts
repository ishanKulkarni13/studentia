import { Router } from 'express'
import { decryptBlob, encryptBlob } from '../utils/crypto.js'
import { getConsentOnChain } from '../utils/algorand.js'
import { DocumentModel } from '../models/Document.js'

export const documentsRouter = Router()

documentsRouter.post('/upload', async (req, res) => {
  const { studentId, receiverGroup, dataGroup, fileName, mimeType, fileBase64 } = req.body || {}

  if (!studentId || !receiverGroup || !dataGroup || !fileName || !mimeType || !fileBase64) {
    return res.status(400).json({ error: 'studentId, receiverGroup, dataGroup, fileName, mimeType, fileBase64 required' })
  }

  try {
    const sizeBytes = Buffer.from(fileBase64, 'base64').length

    let storageMode: 'plain' | 'encrypted' = 'plain'
    let encryptedBlob: { iv: string; tag: string; data: string } | undefined
    let plainBlob: string | undefined = fileBase64

    try {
      encryptedBlob = encryptBlob(fileBase64)
      plainBlob = undefined
      storageMode = 'encrypted'
    } catch {
      storageMode = 'plain'
    }

    const created = await DocumentModel.create({
      studentId,
      receiverGroup,
      dataGroup,
      fileName,
      mimeType,
      sizeBytes,
      fileBase64: plainBlob,
      encryptedBlob,
      storageMode,
      sharedWith: [],
    })

    return res.json({
      ok: true,
      document: {
        id: String(created._id),
        studentId: created.studentId,
        receiverGroup: created.receiverGroup,
        dataGroup: created.dataGroup,
        fileName: created.fileName,
        mimeType: created.mimeType,
        sizeBytes: created.sizeBytes,
        storageMode: created.storageMode,
        sharedWith: created.sharedWith,
        createdAt: created.createdAt,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

documentsRouter.get('/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    const docs = await DocumentModel.find({ studentId }).sort({ createdAt: -1 }).lean()
    return res.json({
      ok: true,
      documents: docs.map((d) => ({
        id: String(d._id),
        studentId: d.studentId,
        receiverGroup: d.receiverGroup,
        dataGroup: d.dataGroup,
        fileName: d.fileName,
        mimeType: d.mimeType,
        sizeBytes: d.sizeBytes,
        storageMode: d.storageMode,
        sharedWith: d.sharedWith,
        createdAt: d.createdAt,
      })),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

documentsRouter.post('/:id/share', async (req, res) => {
  const { id } = req.params
  const { studentId, receiverGroup } = req.body || {}

  if (!studentId || !receiverGroup) {
    return res.status(400).json({ error: 'studentId and receiverGroup required' })
  }

  try {
    const doc = await DocumentModel.findById(id)
    if (!doc) return res.status(404).json({ error: 'document not found' })
    if (doc.studentId !== studentId) return res.status(403).json({ error: 'only owner can share' })

    const consent = await getConsentOnChain({ studentId, receiverGroup, dataGroup: doc.dataGroup })
    if (consent.status !== 'granted') {
      return res.status(403).json({
        error: 'consent not granted on-chain for this receiver/data group',
        onChainStatus: consent.status,
      })
    }

    if (!doc.sharedWith.includes(receiverGroup)) {
      doc.sharedWith.push(receiverGroup)
      await doc.save()
    }

    return res.json({ ok: true, id: String(doc._id), sharedWith: doc.sharedWith, onChainStatus: consent.status })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

documentsRouter.get('/download/:id', async (req, res) => {
  const { id } = req.params
  const ownerStudentId = String(req.query.ownerStudentId || '')
  const requesterGroup = String(req.query.requesterGroup || '')

  if (!ownerStudentId) {
    return res.status(400).json({ error: 'ownerStudentId query param required' })
  }

  try {
    const doc = await DocumentModel.findById(id)
    if (!doc) return res.status(404).json({ error: 'document not found' })
    if (doc.studentId !== ownerStudentId) {
      return res.status(403).json({ error: 'ownerStudentId does not match document owner' })
    }

    const ownerAccess = requesterGroup.length === 0
    let allowed = ownerAccess

    if (!ownerAccess) {
      const isShared = doc.sharedWith.includes(requesterGroup)
      if (!isShared) return res.status(403).json({ error: 'document not shared with this group' })

      const consent = await getConsentOnChain({
        studentId: ownerStudentId,
        receiverGroup: requesterGroup,
        dataGroup: doc.dataGroup,
      })
      allowed = consent.status === 'granted'
      if (!allowed) {
        return res.status(403).json({ error: 'on-chain consent is not granted', onChainStatus: consent.status })
      }
    }

    let fileBase64 = doc.fileBase64 || ''
    if (!fileBase64 && doc.encryptedBlob) {
      fileBase64 = decryptBlob(doc.encryptedBlob)
    }

    return res.json({
      ok: true,
      document: {
        id: String(doc._id),
        studentId: doc.studentId,
        receiverGroup: doc.receiverGroup,
        dataGroup: doc.dataGroup,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
      },
      fileBase64,
      accessMode: ownerAccess ? 'owner' : 'shared',
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})
