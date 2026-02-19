export type DataGroup = {
  id: string
  studentId: string
  name: string
  isCustom: boolean
  createdAt: string | null
}

export type DocumentSummary = {
  id: string
  studentId: string
  receiverGroup: string
  dataGroup: string
  fileName: string
  mimeType: string
  sizeBytes: number
  storageMode: string
  sharedWith: string[]
  createdAt?: string
}

export type GroupedDocuments = {
  dataGroup: string
  count: number
  documents: DocumentSummary[]
}

export type UploadDocumentInput = {
  studentId: string
  receiverGroup: string
  dataGroup: string
  file: File
}
