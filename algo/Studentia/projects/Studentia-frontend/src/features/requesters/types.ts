export type RequestGroup = {
  id: string
  studentId: string
  name: string
  isCustom: boolean
  memberCount: number
  createdAt: string | null
}

export type RequesterMember = {
  id: string
  studentId: string
  requestGroupName: string
  displayName: string
  email: string
  walletAddress: string
  organization: string
  status: 'active' | 'inactive'
  createdAt?: string
}

export type AccessRequestRecord = {
  _id?: string
  id?: string
  studentId: string
  requesterGroup: string
  dataGroup: string
  purpose?: string
  status: string
  approvedTxId?: string
  approvedReturnValue?: string
  rejectReason?: string
  createdAt?: string
  updatedAt?: string
}
