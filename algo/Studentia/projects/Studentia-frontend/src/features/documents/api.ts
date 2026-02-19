import type { DataGroup, GroupedDocuments, UploadDocumentInput } from './types'

function getApiToken() {
  return (import.meta.env.VITE_API_TOKEN as string | undefined)?.trim()
}

function getBaseCandidates() {
  const raw = (import.meta.env.VITE_API_BASE as string | undefined)?.trim()
  if (!raw) {
    throw new Error('Set VITE_API_BASE to enable documents API')
  }
  const base = raw.replace(/\/+$/, '')
  return [base, `${base}/api`]
}

function buildHeaders(withJson = true) {
  return {
    ...(withJson ? { 'Content-Type': 'application/json' } : {}),
    ...(getApiToken() ? { Authorization: `Bearer ${getApiToken()}` } : {}),
  }
}

async function parseJson(response: Response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const body = await response.text()
    throw new Error(`Expected JSON but got ${contentType || 'unknown'}: ${body.slice(0, 120)}`)
  }
  return response.json()
}

async function fetchFromCandidates(path: string, init?: RequestInit) {
  const candidates = getBaseCandidates()
  let lastError: Error | null = null

  for (const base of candidates) {
    const response = await fetch(`${base}${path}`, init)
    if (response.status === 404) {
      lastError = new Error(`Route not found at ${base}${path}`)
      continue
    }

    const data = await parseJson(response)
    if (!response.ok) {
      throw new Error((data as { error?: string }).error || `Request failed (${response.status})`)
    }

    return data
  }

  throw lastError || new Error('No valid API base found')
}

export async function getDataGroups(studentId: string) {
  const data = (await fetchFromCandidates(`/data-groups/${encodeURIComponent(studentId)}`, {
    headers: buildHeaders(false),
  })) as { dataGroups?: DataGroup[] }

  return data.dataGroups || []
}

export async function createCustomDataGroup(studentId: string, name: string) {
  const data = (await fetchFromCandidates('/data-groups', {
    method: 'POST',
    headers: buildHeaders(true),
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

  return fetchFromCandidates('/documents/upload-form', {
    method: 'POST',
    headers: buildHeaders(false),
    body: formData,
  })
}

export async function getGroupedDocuments(studentId: string) {
  const data = (await fetchFromCandidates(`/documents/${encodeURIComponent(studentId)}/grouped`, {
    headers: buildHeaders(false),
  })) as { groups?: GroupedDocuments[] }

  return data.groups || []
}
