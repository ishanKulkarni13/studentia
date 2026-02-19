import { Router } from 'express'
import { DataGroupModel } from '../models/DataGroup.js'
import {
  canonicalDefaultDataGroup,
  DEFAULT_DATA_GROUPS,
  normalizeDataGroupName,
} from '../utils/dataGroups.js'

export const dataGroupsRouter = Router()

dataGroupsRouter.get('/:studentId', async (req, res) => {
  const { studentId } = req.params
  if (!studentId) {
    return res.status(400).json({ error: 'studentId required' })
  }

  try {
    const custom = await DataGroupModel.find({ studentId }).sort({ createdAt: -1 }).lean()
    const customGroups = custom.map((group) => ({
      id: String(group._id),
      studentId: group.studentId,
      name: group.name,
      isCustom: true,
      createdAt: group.createdAt,
    }))

    const defaultGroups = DEFAULT_DATA_GROUPS.map((name) => ({
      id: `default:${name.toLowerCase()}`,
      studentId,
      name,
      isCustom: false,
      createdAt: null,
    }))

    return res.json({
      ok: true,
      studentId,
      dataGroups: [...defaultGroups, ...customGroups],
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})

dataGroupsRouter.post('/', async (req, res) => {
  const { studentId, name } = req.body || {}
  if (!studentId || !name) {
    return res.status(400).json({ error: 'studentId and name required' })
  }

  const trimmedName = String(name).trim()
  if (trimmedName.length < 2 || trimmedName.length > 64) {
    return res.status(400).json({ error: 'name must be between 2 and 64 characters' })
  }

  const defaultMatch = canonicalDefaultDataGroup(trimmedName)
  if (defaultMatch) {
    return res.json({
      ok: true,
      dataGroup: {
        id: `default:${defaultMatch.toLowerCase()}`,
        studentId,
        name: defaultMatch,
        isCustom: false,
        createdAt: null,
      },
      message: 'default data group already available',
    })
  }

  try {
    const normalizedName = normalizeDataGroupName(trimmedName)
    const upserted = await DataGroupModel.findOneAndUpdate(
      { studentId, normalizedName },
      { studentId, name: trimmedName, normalizedName },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean()

    return res.json({
      ok: true,
      dataGroup: {
        id: String(upserted?._id),
        studentId: upserted?.studentId,
        name: upserted?.name,
        isCustom: true,
        createdAt: upserted?.createdAt,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return res.status(500).json({ error: msg })
  }
})
