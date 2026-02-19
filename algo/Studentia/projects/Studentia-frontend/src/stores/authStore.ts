import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  activeAddress: string | null;
  isConnected: boolean;
  currentUserId: string;
  walletBalance: string;

  // Actions
  setActiveAddress: (address: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setCurrentUserId: (userId: string) => void;
  setWalletBalance: (balance: string) => void;
  reset: () => void;
}

const initialState = {
  activeAddress: null,
  isConnected: false,
  currentUserId: "student-001",
  walletBalance: "0",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setActiveAddress: (address) =>
        set({
          activeAddress: address,
          isConnected: address !== null && address !== undefined,
        }),

      setIsConnected: (connected) => set({ isConnected: connected }),

      setCurrentUserId: (userId) => set({ currentUserId: userId }),

      setWalletBalance: (balance) => set({ walletBalance: balance }),

      reset: () => set(initialState),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        activeAddress: state.activeAddress,
        currentUserId: state.currentUserId,
      }),
    }
  )
);
