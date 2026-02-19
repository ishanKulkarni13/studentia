import { useMemo } from 'react'
import { useSnackbar } from 'notistack'
import { createCustomDataGroup, getDataGroups, getGroupedDocuments, uploadDocument } from './api'
import { useDocumentsStore } from './store'

export function useDocumentsFeature() {
  const { enqueueSnackbar } = useSnackbar()

  const store = useDocumentsStore()

  const resolvedReceiverGroup = useMemo(() => {
    if (store.receiverGroup !== 'Custom') return store.receiverGroup
    return store.customReceiverGroup.trim()
  }, [store.receiverGroup, store.customReceiverGroup])

  const loadDataGroups = async () => {
    if (!store.studentId.trim()) {
      enqueueSnackbar('Student ID is required', { variant: 'warning' })
      return
    }

    store.setIsLoadingGroups(true)
    try {
      const groups = await getDataGroups(store.studentId.trim())
      store.setDataGroups(groups)
      if (!store.selectedDataGroup && groups.length > 0) {
        store.setSelectedDataGroup(groups[0].name)
      }
    } catch (error) {
      enqueueSnackbar(
        `Failed to load data groups: ${error instanceof Error ? error.message : 'unknown error'}`,
        { variant: 'error' }
      )
    }
    store.setIsLoadingGroups(false)
  }

  const loadGroupedDocuments = async () => {
    if (!store.studentId.trim()) {
      enqueueSnackbar('Student ID is required', { variant: 'warning' })
      return
    }

    store.setIsLoadingDocuments(true)
    try {
      const groups = await getGroupedDocuments(store.studentId.trim())
      store.setGroupedDocuments(groups)
    } catch (error) {
      enqueueSnackbar(`Failed to load files: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
    store.setIsLoadingDocuments(false)
  }

  const createGroup = async () => {
    if (!store.studentId.trim()) {
      enqueueSnackbar('Student ID is required', { variant: 'warning' })
      return
    }
    if (!store.newDataGroupName.trim()) {
      enqueueSnackbar('Enter a custom data group name', { variant: 'warning' })
      return
    }

    store.setIsCreatingGroup(true)
    try {
      const group = await createCustomDataGroup(store.studentId.trim(), store.newDataGroupName.trim())
      store.setNewDataGroupName('')
      store.setSelectedDataGroup(group.name)
      enqueueSnackbar(`Data group ready: ${group.name}`, { variant: 'success' })
      await loadDataGroups()
    } catch (error) {
      enqueueSnackbar(
        `Failed to create data group: ${error instanceof Error ? error.message : 'unknown error'}`,
        { variant: 'error' }
      )
    }
    store.setIsCreatingGroup(false)
  }

  const uploadSelectedFile = async () => {
    if (!store.studentId.trim()) {
      enqueueSnackbar('Student ID is required', { variant: 'warning' })
      return
    }
    if (!store.selectedDataGroup) {
      enqueueSnackbar('Select a data group', { variant: 'warning' })
      return
    }
    if (!resolvedReceiverGroup) {
      enqueueSnackbar('Receiver group is required', { variant: 'warning' })
      return
    }
    if (!store.selectedFile) {
      enqueueSnackbar('Choose a file to upload', { variant: 'warning' })
      return
    }

    store.setIsUploading(true)
    try {
      await uploadDocument({
        studentId: store.studentId.trim(),
        receiverGroup: resolvedReceiverGroup,
        dataGroup: store.selectedDataGroup,
        file: store.selectedFile,
      })

      enqueueSnackbar('File uploaded successfully', { variant: 'success' })
      store.resetFile()
      await loadGroupedDocuments()
    } catch (error) {
      enqueueSnackbar(`Upload failed: ${error instanceof Error ? error.message : 'unknown error'}`, {
        variant: 'error',
      })
    }
    store.setIsUploading(false)
  }

  return {
    store,
    resolvedReceiverGroup,
    loadDataGroups,
    loadGroupedDocuments,
    createGroup,
    uploadSelectedFile,
  }
}
