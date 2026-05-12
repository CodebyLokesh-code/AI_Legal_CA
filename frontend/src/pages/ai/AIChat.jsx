import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Sparkles, FileText, Calculator, Scale } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PageHeader from "../../components/shared/PageHeader"
import { chatApi } from "../../api-calls/aiApi"

const suggestions = [
  { icon: Calculator, text: "Tax saving ke liye suggestions do", color: "text-green-500" },
  { icon: FileText, text: "Legal notice draft karo property dispute ke liye", color: "text-blue-500" },
  { icon: Scale, text: "GST filing process explain karo", color: "text-purple-500" },
  { icon: Sparkles, text: "ITR-1 vs ITR-2 mein kya difference hai?", color: "text-orange-500" },
]

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! Main aapka AI Legal & Tax Assistant hun. Tax, GST, legal drafts, ya koi bhi sawaal — main help karunga! 🙏"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg) return

    setMessages(prev => [...prev, { role: "user", content: msg }])
    setInput("")
    setLoading(true)

    try {
      const res = await chatApi(msg)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data?.reply || res.data || "Koi response nahi mila!"
      }])
    } catch (err) {
      toast.error("AI se response nahi mila!")
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, abhi response nahi de pa raha. Thodi der baad try karein!"
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="AI Assistant"
        subtitle="Tax, GST, Legal — sab ke liye AI help"
      />

      <div className="flex flex-col flex-1 bg-card border border-border rounded-xl overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Suggestions — sirf shuru mein dikhenge */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-colors text-left"
                >
                  <s.icon className={`w-4 h-4 flex-shrink-0 ${s.color}`} />
                  <span className="text-sm text-muted-foreground">{s.text}</span>
                </motion.button>
              ))}
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "assistant"
                    ? "bg-primary/10"
                    : "bg-muted"
                }`}>
                  {msg.role === "assistant"
                    ? <Bot className="w-4 h-4 text-primary" />
                    : <User className="w-4 h-4 text-muted-foreground" />
                  }
                </div>

                {/* Message */}
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Koi bhi sawaal puchein..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={loading}
              className="flex-1 h-11"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-11 w-11"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI galti kar sakta hai — important decisions mein expert se salah lein
          </p>
        </div>
      </div>
    </div>
  )
}