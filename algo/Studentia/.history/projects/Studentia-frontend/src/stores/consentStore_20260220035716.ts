import { create } from "zustand";

export interface TransactionLog {
  status: "Granted" | "Revoked";
  receiver: string;
  data: string;
  txId: string;
}

export interface ConsentRecord {
  status: string;
  receiver: string;
  data: string;
  txId: string;
}

export interface OnChainStatus {
  status: string;
  receiver: string;
  data: string;
  boxKey: string;
}

interface ConsentState {
  // Form state
  studentId: string;
  dataGroup: string;
  dataGroupCustom: string;
  receiverGroup: string;
  receiverGroupCustom: string;
  loading: boolean;

  // Data state
  logs: TransactionLog[];
  records: ConsentRecord[];
  onChainStatuses: OnChainStatus[];

  // Actions
  setStudentId: (id: string) => void;
  setDataGroup: (group: string) => void;
  setDataGroupCustom: (custom: string) => void;
  setReceiverGroup: (group: string) => void;
  setReceiverGroupCustom: (custom: string) => void;
  setLoading: (loading: boolean) => void;

  addTransactionLog: (log: TransactionLog) => void;
  setRecords: (records: ConsentRecord[]) => void;
  setOnChainStatuses: (statuses: OnChainStatus[]) => void;

  resetForm: () => void;
}

const initialState = {
  studentId: "student-001",
  dataGroup: "Academic",
  dataGroupCustom: "",
  receiverGroup: "College",
  receiverGroupCustom: "",
  loading: false,
  logs: [],
  records: [],
  onChainStatuses: [],
};

export const useConsentStore = create<ConsentState>((set) => ({
  ...initialState,

  setStudentId: (id) => set({ studentId: id }),
  setDataGroup: (group) => set({ dataGroup: group }),
  setDataGroupCustom: (custom) => set({ dataGroupCustom: custom }),
  setReceiverGroup: (group) => set({ receiverGroup: group }),
  setReceiverGroupCustom: (custom) => set({ receiverGroupCustom: custom }),
  setLoading: (loading) => set({ loading }),

  addTransactionLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs],
    })),

  setRecords: (records) => set({ records }),
  setOnChainStatuses: (statuses) => set({ onChainStatuses: statuses }),

  resetForm: () => set(initialState),
}));
