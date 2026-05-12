import { create } from "zustand"
import { persist } from "zustand/middleware"

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "dark",
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
    }),
    {
      name: "theme-storage",
    }
  )
)

export default useThemeStore