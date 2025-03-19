import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  auth: {
    isLoggedIn: boolean;
    userId: string | null;
    token: string | null;
  };
  login: (token: string, userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: {
        userId: null,
        isLoggedIn: false,
        token: null,
      },
      login: (token, userId) =>
        set({ auth: { isLoggedIn: true, token, userId } }),
      logout: () =>
        set({ auth: { isLoggedIn: false, token: null, userId: null } }),
    }),
    {
      name: "auth-storage",
    }
  )
);
