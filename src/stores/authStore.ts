import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthStoreState {
  isAuthenticated: boolean;
  authenticate: (password: string) => boolean;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      isAuthenticated: false,

      authenticate: (password) => {
        const expected = import.meta.env.VITE_APP_PASSWORD ?? "";
        const match = password === expected;
        if (match) {
          set({ isAuthenticated: true });
        }
        return match;
      },
    }),
    {
      name: "vault-keeper-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    },
  ),
);
