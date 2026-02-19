import { fetchApi, getAuthHeaders } from '@/lib/apiClient'
import type { AccessRequestRecord, RequestGroup, RequesterMember } from './types'

export async function getRequestGroups(studentId: string) {
  const data = (await fetchApi(`/request-groups/${encodeURIComponent(studentId)}`, {
    headers: getAuthHeaders(false),
  })) as { requestGroups?: RequestGroup[] }

  return data.requestGroups || []
}

export async function createRequestGroup(studentId: string, name: string) {
  const data = (await fetchApi('/request-groups', {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ studentId, name }),
  })) as { requestGroup?: RequestGroup }

  if (!data.requestGroup) throw new Error('Failed to create request group')
  return data.requestGroup
}

export async function getRequestGroupMembers(studentId: string, groupName: string) {
  const data = (await fetchApi(
    `/request-groups/${encodeURIComponent(studentId)}/members/${encodeURIComponent(groupName)}`,
    { headers: getAuthHeaders(false) }
  )) as { members?: RequesterMember[] }

  return data.members || []
}

export async function addRequestGroupMember(input: {
  studentId: string
  requestGroup: string
  displayName: string
  email?: string
  walletAddress?: string
  organization?: string
}) {
  const data = (await fetchApi('/request-groups/members', {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(input),
  })) as { member?: RequesterMember }

  if (!data.member) throw new Error('Failed to add requester member')
  return data.member
}

export async function updateRequestGroupMemberStatus(memberId: string, status: 'active' | 'inactive') {
  const data = (await fetchApi(`/request-groups/members/${encodeURIComponent(memberId)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ status }),
  })) as { member?: RequesterMember }

  if (!data.member) throw new Error('Failed to update requester member status')
  return data.member
}

export async function createAccessRequest(input: {
  studentId: string
  requesterGroup: string
  dataGroup: string
  purpose?: string
}) {
  return fetchApi('/access-requests', {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(input),
  })
}

export async function getStudentAccessRequests(studentId: string) {
  const data = (await fetchApi(`/access-requests/student/${encodeURIComponent(studentId)}`, {
    headers: getAuthHeaders(false),
  })) as { requests?: AccessRequestRecord[] }

  return data.requests || []
}

export async function getRequesterAccessRequests(requesterGroup: string) {
  const data = (await fetchApi(`/access-requests/requester/${encodeURIComponent(requesterGroup)}`, {
    headers: getAuthHeaders(false),
  })) as { requests?: AccessRequestRecord[] }

  return data.requests || []
}

export async function approveAccessRequest(requestId: string) {
  return fetchApi(`/access-requests/${encodeURIComponent(requestId)}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(false),
  })
}

export async function rejectAccessRequest(requestId: string, reason: string) {
  return fetchApi(`/access-requests/${encodeURIComponent(requestId)}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify({ reason }),
  })
}
