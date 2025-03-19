import api from "@/utils/AxiosInstance";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  auth: {
    isLoggedIn: boolean;
    userId: string | null;
    token: string | null;
  };
  hydrated: boolean;
  login: (token: string, userId: string) => void;
  logout: () => void;
  setHydrated: (state: boolean) => void;
  checkStat: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: {
        userId: null,
        isLoggedIn: false,
        token: null,
      },
      hydrated: false,
      login: (token, userId) =>
        set({ auth: { isLoggedIn: true, token, userId } }),
      logout: () =>
        set({ auth: { isLoggedIn: false, token: null, userId: null } }),
      setHydrated: (state) => set({ hydrated: state }),
      checkStat: async () => {
        api.post("/check");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // When storage is rehydrated, update the hydrated flag
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
