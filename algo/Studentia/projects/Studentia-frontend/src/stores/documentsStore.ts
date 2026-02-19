import { create } from "zustand";

export interface DocMeta {
  id: string;
  owner: string;
  requesterGroup: string;
  dataGroup: string;
  fileName: string;
  mimeType: string;
  uploadedAt: string;
}

interface DocumentsState {
  // Form state
  studentId: string;
  receiverGroup: string;
  dataGroup: string;
  selectedFileName: string;
  selectedMimeType: string;
  selectedFile: File | null;

  // Download state
  docId: string;
  downloadOwnerId: string;
  downloadRequesterGroup: string;

  // Data state
  documents: DocMeta[];
  downloadPreview: string;
  loading: boolean;

  // Actions
  setStudentId: (id: string) => void;
  setReceiverGroup: (group: string) => void;
  setDataGroup: (group: string) => void;
  setSelectedFileName: (name: string) => void;
  setSelectedMimeType: (type: string) => void;
  setSelectedFile: (file: File | null) => void;

  setDocId: (id: string) => void;
  setDownloadOwnerId: (id: string) => void;
  setDownloadRequesterGroup: (group: string) => void;

  setDocuments: (docs: DocMeta[]) => void;
  addDocument: (doc: DocMeta) => void;
  removeDocument: (id: string) => void;
  setDownloadPreview: (preview: string) => void;
  setLoading: (loading: boolean) => void;

  resetFileSelection: () => void;
  resetDownloadForm: () => void;
}

const initialState = {
  studentId: "student-001",
  receiverGroup: "Recruiters",
  dataGroup: "Portfolio",
  selectedFileName: "",
  selectedMimeType: "application/octet-stream",
  selectedFile: null,
  docId: "",
  downloadOwnerId: "student-001",
  downloadRequesterGroup: "Recruiters",
  documents: [],
  downloadPreview: "",
  loading: false,
};

export const useDocumentsStore = create<DocumentsState>((set) => ({
  ...initialState,

  setStudentId: (id) => set({ studentId: id }),
  setReceiverGroup: (group) => set({ receiverGroup: group }),
  setDataGroup: (group) => set({ dataGroup: group }),
  setSelectedFileName: (name) => set({ selectedFileName: name }),
  setSelectedMimeType: (type) => set({ selectedMimeType: type }),
  setSelectedFile: (file) => set({ selectedFile: file }),

  setDocId: (id) => set({ docId: id }),
  setDownloadOwnerId: (id) => set({ downloadOwnerId: id }),
  setDownloadRequesterGroup: (group) => set({ downloadRequesterGroup: group }),

  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) =>
    set((state) => ({
      documents: [...state.documents, doc],
    })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    })),

  setDownloadPreview: (preview) => set({ downloadPreview: preview }),
  setLoading: (loading) => set({ loading }),

  resetFileSelection: () =>
    set({
      selectedFileName: "",
      selectedMimeType: "application/octet-stream",
      selectedFile: null,
    }),

  resetDownloadForm: () =>
    set({
      docId: "",
      downloadOwnerId: "student-001",
      downloadRequesterGroup: "Recruiters",
      downloadPreview: "",
    }),
}));
