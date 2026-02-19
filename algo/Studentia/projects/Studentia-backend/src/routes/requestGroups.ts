import { Router } from 'express'
import { RequestGroupModel } from '../models/RequestGroup.js'
import { RequesterIdentityModel } from '../models/RequesterIdentity.js'
import {
  canonicalDefaultRequestGroup,
  DEFAULT_REQUEST_GROUPS,
  normalizeRequestGroupName,
} from '../utils/requestGroups.js'

export const requestGroupsRouter = Router()

/**
 * GET /request-groups/:studentId
 * Returns all request groups (default + custom) for a student with member counts.
 */
requestGroupsRouter.get('/:studentId', async (req, res) => {
  const { studentId } = req.params
  if (!studentId) {
    return res.status(400).json({ error: 'studentId required' })
  }

  try {
    const [customGroups, counts] = await Promise.all([
      RequestGroupModel.find({ studentId }).sort({ createdAt: -1 }).lean(),
      RequesterIdentityModel.aggregate([
        { $match: { studentId, status: 'active' } },
        { $group: { _id: '$requestGroupNormalized', count: { $sum: 1 } } },
      ]),
    ])

    const countMap = new Map<string, number>(counts.map((item) => [String(item._id), Number(item.count)]))

    const defaults = DEFAULT_REQUEST_GROUPS.map((name) => {
      const normalized = normalizeRequestGroupName(name)
      return {
        id: `default:${normalized}`,
        studentId,
        name,
        isCustom: false,
        memberCount: countMap.get(normalized) || 0,
        createdAt: null,
      }
    })

    const custom = customGroups.map((group) => ({
      id: String(group._id),
      studentId: group.studentId,
      name: group.name,
      isCustom: true,
      memberCount: countMap.get(group.normalizedName) || 0,
      createdAt: group.createdAt,
    }))

    return res.json({ ok: true, studentId, requestGroups: [...defaults, ...custom] })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

/**
 * POST /request-groups
 * Creates a custom request group for a student.
 */
requestGroupsRouter.post('/', async (req, res) => {
  const { studentId, name } = req.body || {}
  if (!studentId || !name) {
    return res.status(400).json({ error: 'studentId and name required' })
  }

  const trimmedName = String(name).trim()
  if (trimmedName.length < 2 || trimmedName.length > 64) {
    return res.status(400).json({ error: 'name must be between 2 and 64 characters' })
  }

  const defaultMatch = canonicalDefaultRequestGroup(trimmedName)
  if (defaultMatch) {
    return res.json({
      ok: true,
      requestGroup: {
        id: `default:${defaultMatch.toLowerCase()}`,
        studentId,
        name: defaultMatch,
        isCustom: false,
        createdAt: null,
      },
      message: 'default request group already available',
    })
  }

  try {
    const normalizedName = normalizeRequestGroupName(trimmedName)
    const group = await RequestGroupModel.findOneAndUpdate(
      { studentId, normalizedName },
      { studentId, name: trimmedName, normalizedName },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean()

    return res.json({
      ok: true,
      requestGroup: {
        id: String(group?._id),
        studentId: group?.studentId,
        name: group?.name,
        isCustom: true,
        createdAt: group?.createdAt,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

/**
 * GET /request-groups/:studentId/members/:groupName
 * Lists requester identities in a specific request group.
 */
requestGroupsRouter.get('/:studentId/members/:groupName', async (req, res) => {
  const { studentId, groupName } = req.params
  if (!studentId || !groupName) {
    return res.status(400).json({ error: 'studentId and groupName required' })
  }

  try {
    const normalized = normalizeRequestGroupName(groupName)
    const members = await RequesterIdentityModel.find({ studentId, requestGroupNormalized: normalized })
      .sort({ createdAt: -1 })
      .lean()

    return res.json({
      ok: true,
      studentId,
      groupName,
      members: members.map((member) => ({
        id: String(member._id),
        studentId: member.studentId,
        requestGroupName: member.requestGroupName,
        displayName: member.displayName,
        email: member.email || '',
        walletAddress: member.walletAddress || '',
        organization: member.organization || '',
        status: member.status,
        createdAt: member.createdAt,
      })),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

/**
 * POST /request-groups/members
 * Adds a requester identity to a request group.
 */
requestGroupsRouter.post('/members', async (req, res) => {
  const { studentId, requestGroup, displayName, email, walletAddress, organization } = req.body || {}

  if (!studentId || !requestGroup || !displayName) {
    return res.status(400).json({ error: 'studentId, requestGroup, displayName required' })
  }

  const trimmedGroup = String(requestGroup).trim()
  const normalizedGroup = normalizeRequestGroupName(trimmedGroup)

  try {
    const defaultMatch = canonicalDefaultRequestGroup(trimmedGroup)
    if (!defaultMatch) {
      const customGroup = await RequestGroupModel.findOne({ studentId, normalizedName: normalizedGroup }).lean()
      if (!customGroup) {
        return res.status(400).json({ error: 'invalid requestGroup for this student' })
      }
    }

    const created = await RequesterIdentityModel.create({
      studentId,
      requestGroupName: defaultMatch || trimmedGroup,
      requestGroupNormalized: normalizedGroup,
      displayName: String(displayName).trim(),
      email: email ? String(email).trim() : undefined,
      walletAddress: walletAddress ? String(walletAddress).trim() : undefined,
      organization: organization ? String(organization).trim() : undefined,
      status: 'active',
    })

    return res.json({
      ok: true,
      member: {
        id: String(created._id),
        studentId: created.studentId,
        requestGroupName: created.requestGroupName,
        displayName: created.displayName,
        email: created.email || '',
        walletAddress: created.walletAddress || '',
        organization: created.organization || '',
        status: created.status,
        createdAt: created.createdAt,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

/**
 * PATCH /request-groups/members/:id/status
 * Soft-activates/deactivates requester identity.
 */
requestGroupsRouter.patch('/members/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body || {}

  if (!id || !status || !['active', 'inactive'].includes(String(status))) {
    return res.status(400).json({ error: 'valid member id and status (active|inactive) required' })
  }

  try {
    const updated = await RequesterIdentityModel.findByIdAndUpdate(
      id,
      { status: String(status) },
      { new: true }
    ).lean()

    if (!updated) return res.status(404).json({ error: 'member not found' })

    return res.json({
      ok: true,
      member: {
        id: String(updated._id),
        status: updated.status,
        requestGroupName: updated.requestGroupName,
        displayName: updated.displayName,
        updatedAt: updated.updatedAt,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})
