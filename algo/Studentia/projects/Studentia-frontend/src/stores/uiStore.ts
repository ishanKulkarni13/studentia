import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Modal states
  openWalletModal: boolean;
  openDemoModal: boolean;
  appCallsDemoModal: boolean;
  accessRequestsModal: boolean;
  documentsModal: boolean;

  // Navigation states
  sidebarOpen: boolean;
  activeTab: string;

  // Actions
  toggleWalletModal: () => void;
  toggleDemoModal: () => void;
  toggleAppCallsDemoModal: () => void;
  toggleAccessRequestsModal: () => void;
  toggleDocumentsModal: () => void;

  setWalletModal: (open: boolean) => void;
  setDemoModal: (open: boolean) => void;
  setAppCallsDemoModal: (open: boolean) => void;
  setAccessRequestsModal: (open: boolean) => void;
  setDocumentsModal: (open: boolean) => void;

  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;

  resetModals: () => void;
}

const initialState = {
  openWalletModal: false,
  openDemoModal: false,
  appCallsDemoModal: false,
  accessRequestsModal: false,
  documentsModal: false,
  sidebarOpen: true,
  activeTab: "home",
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...initialState,

      toggleWalletModal: () =>
        set((state) => ({
          openWalletModal: !state.openWalletModal,
        })),

      toggleDemoModal: () =>
        set((state) => ({
          openDemoModal: !state.openDemoModal,
        })),

      toggleAppCallsDemoModal: () =>
        set((state) => ({
          appCallsDemoModal: !state.appCallsDemoModal,
        })),

      toggleAccessRequestsModal: () =>
        set((state) => ({
          accessRequestsModal: !state.accessRequestsModal,
        })),

      toggleDocumentsModal: () =>
        set((state) => ({
          documentsModal: !state.documentsModal,
        })),

      setWalletModal: (open) => set({ openWalletModal: open }),
      setDemoModal: (open) => set({ openDemoModal: open }),
      setAppCallsDemoModal: (open) => set({ appCallsDemoModal: open }),
      setAccessRequestsModal: (open) => set({ accessRequestsModal: open }),
      setDocumentsModal: (open) => set({ documentsModal: open }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      resetModals: () =>
        set({
          openWalletModal: false,
          openDemoModal: false,
          appCallsDemoModal: false,
          accessRequestsModal: false,
          documentsModal: false,
        }),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        activeTab: state.activeTab,
      }),
    }
  )
);
