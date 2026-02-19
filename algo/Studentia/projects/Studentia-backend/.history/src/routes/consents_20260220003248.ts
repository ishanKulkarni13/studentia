import { Router } from 'express'
import { encryptBlob, decryptBlob } from '../utils/crypto.js'
import { recordStore } from '../utils/store.js'
import { callConsent, getConsentOnChain } from '../utils/algorand.js'

export const consentsRouter = Router()

consentsRouter.post('/grant', async (req, res) => {
  const { studentId, receiverGroup, dataGroup, dataBlob } = req.body || {}
  if (!studentId || !receiverGroup || !dataGroup) {
    return res.status(400).json({ error: 'studentId, receiverGroup, dataGroup required' })
  }
  try {
    const encrypted = dataBlob ? encryptBlob(dataBlob) : undefined
    const result = await callConsent('grant', { studentId, receiverGroup, dataGroup })
    recordStore.add({ studentId, receiverGroup, dataGroup, status: 'granted', txId: result.txId, encrypted })
    return res.json({ ok: true, txId: result.txId, returnValue: result.returnValue })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

consentsRouter.post('/revoke', async (req, res) => {
  const { studentId, receiverGroup, dataGroup } = req.body || {}
  if (!studentId || !receiverGroup || !dataGroup) {
    return res.status(400).json({ error: 'studentId, receiverGroup, dataGroup required' })
  }
  try {
    const result = await callConsent('revoke', { studentId, receiverGroup, dataGroup })
    recordStore.add({ studentId, receiverGroup, dataGroup, status: 'revoked', txId: result.txId })
    return res.json({ ok: true, txId: result.txId, returnValue: result.returnValue })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

consentsRouter.get('/:studentId', (req, res) => {
  const studentId = req.params.studentId
  const records = recordStore.getByStudent(studentId).map((r) => ({
    studentId: r.studentId,
    receiverGroup: r.receiverGroup,
    dataGroup: r.dataGroup,
    status: r.status,
    txId: r.txId,
    encrypted: r.encrypted,
  }))
  return res.json({ ok: true, records })
})

consentsRouter.get('/onchain/:studentId/:receiverGroup/:dataGroup', async (req, res) => {
  const { studentId, receiverGroup, dataGroup } = req.params
  if (!studentId || !receiverGroup || !dataGroup) {
    return res.status(400).json({ error: 'studentId, receiverGroup, dataGroup required' })
  }

  try {
    const result = await getConsentOnChain({ studentId, receiverGroup, dataGroup })
    return res.json({ ok: true, ...result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})
