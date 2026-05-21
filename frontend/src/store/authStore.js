import { create } from "zustand"
import { persist } from "zustand/middleware"
import useChatStore from "./chatStore"

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user, token) => set({ user, token }),

      logout: () => {
        useChatStore.getState().clearChat()

        set({
          user: null,
          token: null,
        })
      },
    }),
    {
      name: "auth-storage",
    }
  )
)

export default useAuthStore