import { Router } from 'express'
import { AccessRequestModel } from '../models/AccessRequest.js'
import { callConsent } from '../utils/algorand.js'

export const accessRequestsRouter = Router()

accessRequestsRouter.post('/', async (req, res) => {
  const { studentId, requesterGroup, dataGroup, purpose } = req.body || {}
  if (!studentId || !requesterGroup || !dataGroup) {
    return res.status(400).json({ error: 'studentId, requesterGroup, dataGroup required' })
  }

  try {
    const created = await AccessRequestModel.create({
      studentId,
      requesterGroup,
      dataGroup,
      purpose: purpose || '',
      status: 'pending',
    })

    return res.json({
      ok: true,
      request: {
        id: String(created._id),
        studentId: created.studentId,
        requesterGroup: created.requesterGroup,
        dataGroup: created.dataGroup,
        purpose: created.purpose,
        status: created.status,
        createdAt: created.createdAt,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

accessRequestsRouter.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params
  try {
    const items = await AccessRequestModel.find({ studentId }).sort({ createdAt: -1 }).lean()
    return res.json({ ok: true, requests: items })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

accessRequestsRouter.get('/requester/:requesterGroup', async (req, res) => {
  const { requesterGroup } = req.params
  try {
    const items = await AccessRequestModel.find({ requesterGroup }).sort({ createdAt: -1 }).lean()
    return res.json({ ok: true, requests: items })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

accessRequestsRouter.post('/:id/approve', async (req, res) => {
  const { id } = req.params

  try {
    const request = await AccessRequestModel.findById(id)
    if (!request) return res.status(404).json({ error: 'access request not found' })
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `request already ${request.status}` })
    }

    const chain = await callConsent('grant', {
      studentId: request.studentId,
      receiverGroup: request.requesterGroup,
      dataGroup: request.dataGroup,
    })

    request.status = 'approved'
    request.approvedTxId = chain.txId
    request.approvedReturnValue = chain.returnValue || ''
    await request.save()

    return res.json({
      ok: true,
      request: {
        id: String(request._id),
        studentId: request.studentId,
        requesterGroup: request.requesterGroup,
        dataGroup: request.dataGroup,
        status: request.status,
        approvedTxId: request.approvedTxId,
        approvedReturnValue: request.approvedReturnValue,
        updatedAt: request.updatedAt,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

accessRequestsRouter.post('/:id/reject', async (req, res) => {
  const { id } = req.params
  const { reason } = req.body || {}

  try {
    const request = await AccessRequestModel.findById(id)
    if (!request) return res.status(404).json({ error: 'access request not found' })
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `request already ${request.status}` })
    }

    request.status = 'rejected'
    request.rejectReason = reason || ''
    await request.save()

    return res.json({
      ok: true,
      request: {
        id: String(request._id),
        studentId: request.studentId,
        requesterGroup: request.requesterGroup,
        dataGroup: request.dataGroup,
        status: request.status,
        rejectReason: request.rejectReason,
        updatedAt: request.updatedAt,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})
