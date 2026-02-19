import type { DataGroup, GroupedDocuments, UploadDocumentInput } from './types'
import { fetchApi, getAuthHeaders } from '@/lib/apiClient'

export async function getDataGroups(studentId: string) {
  const data = (await fetchApi(`/data-groups/${encodeURIComponent(studentId)}`, {
    headers: getAuthHeaders(false),
  })) as { dataGroups?: DataGroup[] }

  return data.dataGroups || []
}

export async function createCustomDataGroup(studentId: string, name: string) {
  const data = (await fetchApi('/data-groups', {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ studentId, name }),
  })) as { dataGroup?: DataGroup }

  if (!data.dataGroup) {
    throw new Error('Failed to create data group')
  }
  return data.dataGroup
}

export async function uploadDocument(input: UploadDocumentInput) {
  const formData = new FormData()
  formData.set('studentId', input.studentId)
  formData.set('receiverGroup', input.receiverGroup)
  formData.set('dataGroup', input.dataGroup)
  formData.set('file', input.file, input.file.name)

  return fetchApi('/documents/upload-form', {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: formData,
  })
}

export async function getGroupedDocuments(studentId: string) {
  const data = (await fetchApi(`/documents/${encodeURIComponent(studentId)}/grouped`, {
    headers: getAuthHeaders(false),
  })) as { groups?: GroupedDocuments[] }

  return data.groups || []
}
