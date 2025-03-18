import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  auth: {
    isLoggedIn: boolean;
    token: string | null;
  };
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: {
        isLoggedIn: false,
        token: null,
      },
      login: (token) =>
        set({ auth: { isLoggedIn: true, token } }),
      logout: () =>
        set({ auth: { isLoggedIn: false, token: null } }),
    }),
    {
      name: "auth-storage",
    }
  )
);
