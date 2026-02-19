import { create } from 'zustand'
import type { AccessRequestRecord, RequestGroup, RequesterMember } from './types'

type RequestersStore = {
  studentId: string
  selectedRequestGroup: string
  newRequestGroupName: string
  memberDisplayName: string
  memberEmail: string
  memberWalletAddress: string
  memberOrganization: string
  accessDataGroup: string
  accessPurpose: string
  accessRequestId: string
  rejectReason: string
  requestGroups: RequestGroup[]
  members: RequesterMember[]
  studentRequests: AccessRequestRecord[]
  requesterRequests: AccessRequestRecord[]
  isLoadingGroups: boolean
  isLoadingMembers: boolean
  isLoadingRequests: boolean
  isSavingGroup: boolean
  isSavingMember: boolean
  isSubmittingRequest: boolean
  isUpdatingRequest: boolean
  setStudentId: (value: string) => void
  setSelectedRequestGroup: (value: string) => void
  setNewRequestGroupName: (value: string) => void
  setMemberDisplayName: (value: string) => void
  setMemberEmail: (value: string) => void
  setMemberWalletAddress: (value: string) => void
  setMemberOrganization: (value: string) => void
  setAccessDataGroup: (value: string) => void
  setAccessPurpose: (value: string) => void
  setAccessRequestId: (value: string) => void
  setRejectReason: (value: string) => void
  setRequestGroups: (value: RequestGroup[]) => void
  setMembers: (value: RequesterMember[]) => void
  setStudentRequests: (value: AccessRequestRecord[]) => void
  setRequesterRequests: (value: AccessRequestRecord[]) => void
  setIsLoadingGroups: (value: boolean) => void
  setIsLoadingMembers: (value: boolean) => void
  setIsLoadingRequests: (value: boolean) => void
  setIsSavingGroup: (value: boolean) => void
  setIsSavingMember: (value: boolean) => void
  setIsSubmittingRequest: (value: boolean) => void
  setIsUpdatingRequest: (value: boolean) => void
  resetMemberForm: () => void
}

export const useRequestersStore = create<RequestersStore>((set) => ({
  studentId: 'student-001',
  selectedRequestGroup: 'Recruiters',
  newRequestGroupName: '',
  memberDisplayName: '',
  memberEmail: '',
  memberWalletAddress: '',
  memberOrganization: '',
  accessDataGroup: 'Portfolio',
  accessPurpose: 'Screening',
  accessRequestId: '',
  rejectReason: 'Not required right now',
  requestGroups: [],
  members: [],
  studentRequests: [],
  requesterRequests: [],
  isLoadingGroups: false,
  isLoadingMembers: false,
  isLoadingRequests: false,
  isSavingGroup: false,
  isSavingMember: false,
  isSubmittingRequest: false,
  isUpdatingRequest: false,
  setStudentId: (value) => set({ studentId: value }),
  setSelectedRequestGroup: (value) => set({ selectedRequestGroup: value }),
  setNewRequestGroupName: (value) => set({ newRequestGroupName: value }),
  setMemberDisplayName: (value) => set({ memberDisplayName: value }),
  setMemberEmail: (value) => set({ memberEmail: value }),
  setMemberWalletAddress: (value) => set({ memberWalletAddress: value }),
  setMemberOrganization: (value) => set({ memberOrganization: value }),
  setAccessDataGroup: (value) => set({ accessDataGroup: value }),
  setAccessPurpose: (value) => set({ accessPurpose: value }),
  setAccessRequestId: (value) => set({ accessRequestId: value }),
  setRejectReason: (value) => set({ rejectReason: value }),
  setRequestGroups: (value) => set({ requestGroups: value }),
  setMembers: (value) => set({ members: value }),
  setStudentRequests: (value) => set({ studentRequests: value }),
  setRequesterRequests: (value) => set({ requesterRequests: value }),
  setIsLoadingGroups: (value) => set({ isLoadingGroups: value }),
  setIsLoadingMembers: (value) => set({ isLoadingMembers: value }),
  setIsLoadingRequests: (value) => set({ isLoadingRequests: value }),
  setIsSavingGroup: (value) => set({ isSavingGroup: value }),
  setIsSavingMember: (value) => set({ isSavingMember: value }),
  setIsSubmittingRequest: (value) => set({ isSubmittingRequest: value }),
  setIsUpdatingRequest: (value) => set({ isUpdatingRequest: value }),
  resetMemberForm: () =>
    set({
      memberDisplayName: '',
      memberEmail: '',
      memberWalletAddress: '',
      memberOrganization: '',
    }),
}))
