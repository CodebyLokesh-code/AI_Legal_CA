import { create } from "zustand"
import { persist } from "zustand/middleware"

const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [
        {
          role: "assistant",
          content: "Namaste! Main aapka AI Legal & Tax Assistant hun. Tax, GST, legal drafts, ya koi bhi sawaal — main help karunga! 🙏"
        }
      ],
      sessionId: `sess_${Date.now()}`,

      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),

      clearChat: () => set({
        messages: [
          {
            role: "assistant",
            content: "Namaste! Main aapka AI Legal & Tax Assistant hun. Tax, GST, legal drafts, ya koi bhi sawaal — main help karunga! 🙏"
          }
        ],
        sessionId: `sess_${Date.now()}`
      }),
    }),
    {
      name: "chat-storage",
    }
  )
)

export default useChatStore