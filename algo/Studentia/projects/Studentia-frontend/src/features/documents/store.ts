import { create } from 'zustand'
import type { DataGroup, GroupedDocuments } from './types'

type DocumentsStore = {
  studentId: string
  receiverGroup: string
  customReceiverGroup: string
  selectedDataGroup: string
  newDataGroupName: string
  selectedFile: File | null
  dataGroups: DataGroup[]
  groupedDocuments: GroupedDocuments[]
  isLoadingGroups: boolean
  isLoadingDocuments: boolean
  isCreatingGroup: boolean
  isUploading: boolean
  setStudentId: (value: string) => void
  setReceiverGroup: (value: string) => void
  setCustomReceiverGroup: (value: string) => void
  setSelectedDataGroup: (value: string) => void
  setNewDataGroupName: (value: string) => void
  setSelectedFile: (value: File | null) => void
  setDataGroups: (value: DataGroup[]) => void
  setGroupedDocuments: (value: GroupedDocuments[]) => void
  setIsLoadingGroups: (value: boolean) => void
  setIsLoadingDocuments: (value: boolean) => void
  setIsCreatingGroup: (value: boolean) => void
  setIsUploading: (value: boolean) => void
  resetFile: () => void
}

export const useDocumentsStore = create<DocumentsStore>((set) => ({
  studentId: 'student-001',
  receiverGroup: 'Recruiters',
  customReceiverGroup: '',
  selectedDataGroup: '',
  newDataGroupName: '',
  selectedFile: null,
  dataGroups: [],
  groupedDocuments: [],
  isLoadingGroups: false,
  isLoadingDocuments: false,
  isCreatingGroup: false,
  isUploading: false,
  setStudentId: (value) => set({ studentId: value }),
  setReceiverGroup: (value) => set({ receiverGroup: value }),
  setCustomReceiverGroup: (value) => set({ customReceiverGroup: value }),
  setSelectedDataGroup: (value) => set({ selectedDataGroup: value }),
  setNewDataGroupName: (value) => set({ newDataGroupName: value }),
  setSelectedFile: (value) => set({ selectedFile: value }),
  setDataGroups: (value) => set({ dataGroups: value }),
  setGroupedDocuments: (value) => set({ groupedDocuments: value }),
  setIsLoadingGroups: (value) => set({ isLoadingGroups: value }),
  setIsLoadingDocuments: (value) => set({ isLoadingDocuments: value }),
  setIsCreatingGroup: (value) => set({ isCreatingGroup: value }),
  setIsUploading: (value) => set({ isUploading: value }),
  resetFile: () => set({ selectedFile: null }),
}))
