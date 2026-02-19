import { useSnackbar } from 'notistack'
import {
  addRequestGroupMember,
  approveAccessRequest,
  createAccessRequest,
  createRequestGroup,
  getRequestGroupMembers,
  getRequestGroups,
  getRequesterAccessRequests,
  getStudentAccessRequests,
  rejectAccessRequest,
  updateRequestGroupMemberStatus,
} from './api'
import { useRequestersStore } from './store'

export function useRequestersFeature() {
  const store = useRequestersStore()
  const { enqueueSnackbar } = useSnackbar()

  const loadRequestGroups = async () => {
    if (!store.studentId.trim()) {
      enqueueSnackbar('Student ID is required', { variant: 'warning' })
      return
    }

    store.setIsLoadingGroups(true)
    try {
      const groups = await getRequestGroups(store.studentId.trim())
      store.setRequestGroups(groups)
      if (!store.selectedRequestGroup && groups.length > 0) {
        store.setSelectedRequestGroup(groups[0].name)
      }
    } catch (error) {
      enqueueSnackbar(`Failed to load request groups: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
    store.setIsLoadingGroups(false)
  }

  const loadMembers = async () => {
    if (!store.studentId.trim() || !store.selectedRequestGroup.trim()) return

    store.setIsLoadingMembers(true)
    try {
      const members = await getRequestGroupMembers(store.studentId.trim(), store.selectedRequestGroup.trim())
      store.setMembers(members)
    } catch (error) {
      enqueueSnackbar(`Failed to load members: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
    store.setIsLoadingMembers(false)
  }

  const loadAccessRequests = async () => {
    if (!store.studentId.trim() || !store.selectedRequestGroup.trim()) return

    store.setIsLoadingRequests(true)
    try {
      const [studentRequests, requesterRequests] = await Promise.all([
        getStudentAccessRequests(store.studentId.trim()),
        getRequesterAccessRequests(store.selectedRequestGroup.trim()),
      ])

      store.setStudentRequests(studentRequests)
      store.setRequesterRequests(requesterRequests)
    } catch (error) {
      enqueueSnackbar(`Failed to load requests: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
    store.setIsLoadingRequests(false)
  }

  const createGroup = async () => {
    if (!store.studentId.trim()) {
      enqueueSnackbar('Student ID is required', { variant: 'warning' })
      return
    }
    if (!store.newRequestGroupName.trim()) {
      enqueueSnackbar('Enter a custom request group name', { variant: 'warning' })
      return
    }

    store.setIsSavingGroup(true)
    try {
      const group = await createRequestGroup(store.studentId.trim(), store.newRequestGroupName.trim())
      store.setNewRequestGroupName('')
      store.setSelectedRequestGroup(group.name)
      enqueueSnackbar(`Request group ready: ${group.name}`, { variant: 'success' })
      await loadRequestGroups()
    } catch (error) {
      enqueueSnackbar(`Failed to create request group: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
    store.setIsSavingGroup(false)
  }

  const addMember = async () => {
    if (!store.studentId.trim() || !store.selectedRequestGroup.trim() || !store.memberDisplayName.trim()) {
      enqueueSnackbar('studentId, request group and member name are required', { variant: 'warning' })
      return
    }

    store.setIsSavingMember(true)
    try {
      await addRequestGroupMember({
        studentId: store.studentId.trim(),
        requestGroup: store.selectedRequestGroup.trim(),
        displayName: store.memberDisplayName.trim(),
        email: store.memberEmail.trim() || undefined,
        walletAddress: store.memberWalletAddress.trim() || undefined,
        organization: store.memberOrganization.trim() || undefined,
      })

      store.resetMemberForm()
      enqueueSnackbar('Requester member added', { variant: 'success' })
      await loadMembers()
      await loadRequestGroups()
    } catch (error) {
      enqueueSnackbar(`Failed to add member: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
    store.setIsSavingMember(false)
  }

  const toggleMemberStatus = async (memberId: string, status: 'active' | 'inactive') => {
    try {
      await updateRequestGroupMemberStatus(memberId, status)
      enqueueSnackbar(`Member marked ${status}`, { variant: 'success' })
      await loadMembers()
      await loadRequestGroups()
    } catch (error) {
      enqueueSnackbar(`Failed to update member: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
  }

  const createNewAccessRequest = async () => {
    if (!store.studentId.trim() || !store.selectedRequestGroup.trim() || !store.accessDataGroup.trim()) {
      enqueueSnackbar('studentId, request group and data group are required', { variant: 'warning' })
      return
    }

    store.setIsSubmittingRequest(true)
    try {
      const data = (await createAccessRequest({
        studentId: store.studentId.trim(),
        requesterGroup: store.selectedRequestGroup.trim(),
        dataGroup: store.accessDataGroup.trim(),
        purpose: store.accessPurpose.trim(),
      })) as { request?: { id?: string } }

      const createdId = data.request?.id || ''
      if (createdId) store.setAccessRequestId(createdId)
      enqueueSnackbar('Access request created', { variant: 'success' })
      await loadAccessRequests()
    } catch (error) {
      enqueueSnackbar(`Failed to create request: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
    store.setIsSubmittingRequest(false)
  }

  const approveRequest = async () => {
    if (!store.accessRequestId.trim()) {
      enqueueSnackbar('Request ID required to approve', { variant: 'warning' })
      return
    }

    store.setIsUpdatingRequest(true)
    try {
      await approveAccessRequest(store.accessRequestId.trim())
      enqueueSnackbar('Access request approved (Algorand grant sent)', { variant: 'success' })
      await loadAccessRequests()
    } catch (error) {
      enqueueSnackbar(`Failed to approve request: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
    store.setIsUpdatingRequest(false)
  }

  const rejectRequest = async () => {
    if (!store.accessRequestId.trim()) {
      enqueueSnackbar('Request ID required to reject', { variant: 'warning' })
      return
    }

    store.setIsUpdatingRequest(true)
    try {
      await rejectAccessRequest(store.accessRequestId.trim(), store.rejectReason.trim())
      enqueueSnackbar('Access request rejected', { variant: 'success' })
      await loadAccessRequests()
    } catch (error) {
      enqueueSnackbar(`Failed to reject request: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
    store.setIsUpdatingRequest(false)
  }

  return {
    store,
    loadRequestGroups,
    loadMembers,
    loadAccessRequests,
    createGroup,
    addMember,
    toggleMemberStatus,
    createNewAccessRequest,
    approveRequest,
    rejectRequest,
  }
}
