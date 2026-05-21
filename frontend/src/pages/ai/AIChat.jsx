import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Sparkles, FileText, Calculator, Scale, Paperclip, Camera, Trash2, Copy, Check } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PageHeader from "../../components/shared/PageHeader"
import { chatApi } from "../../api-calls/aiApi"
import useChatStore from "../../store/chatStore"

const suggestions = [
  { icon: Calculator, text: "Tax saving ke liye suggestions do", color: "text-green-500" },
  { icon: FileText, text: "Legal notice draft karo property dispute ke liye", color: "text-blue-500" },
  { icon: Scale, text: "GST filing process explain karo", color: "text-purple-500" },
  { icon: Sparkles, text: "ITR-1 vs ITR-2 mein kya difference hai?", color: "text-orange-500" },
]

export default function AIChat() {
  const { messages, sessionId, addMessage, clearChat } = useChatStore()
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success("Copied!")
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size 10MB se zyada nahi honi chahiye!")
      return
    }
    setSelectedFile(file)
    toast.success(`${file.name} selected!`)
  }

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg && !selectedFile) return
    if (!sessionId) return

    const userMessage = {
      role: "user",
      content: msg || `📎 ${selectedFile?.name}`,
      fileName: selectedFile?.name || null
    }

    addMessage(userMessage)
    setInput("")
    setSelectedFile(null)
    setLoading(true)
    scrollToBottom()

    try {
      const res = await chatApi(msg || `File uploaded: ${selectedFile?.name}`, sessionId)
      addMessage({
        role: "assistant",
        content: res.data?.reply || "Koi response nahi mila!"
      })
      scrollToBottom()
    } catch (err) {
      toast.error("AI se response nahi mila!")
      addMessage({
        role: "assistant",
        content: "Sorry, abhi response nahi de pa raha. Thodi der baad try karein!"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="AI Assistant"
        subtitle="Tax, GST, Legal — sab ke liye AI help"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </Button>
        }
      />

      <div className="flex flex-col flex-1 bg-card border border-border rounded-xl overflow-hidden">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Suggestions */}
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
                className={`flex gap-3 group ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "assistant" ? "bg-primary/10" : "bg-muted"
                }`}>
                  {msg.role === "assistant"
                    ? <Bot className="w-4 h-4 text-primary" />
                    : <User className="w-4 h-4 text-muted-foreground" />
                  }
                </div>

                <div className="flex flex-col gap-1 max-w-[75%]">
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}>
                    {msg.fileName && (
                      <div className="flex items-center gap-2 mb-2 opacity-70">
                        <Paperclip className="w-3 h-3" />
                        <span className="text-xs">{msg.fileName}</span>
                      </div>
                    )}
                    {msg.content}
                  </div>

                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(msg.content, i)}
                      className="self-start flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all px-1"
                    >
                      {copiedIndex === i
                        ? <><Check className="w-3 h-3" /> Copied</>
                        : <><Copy className="w-3 h-3" /> Copy</>
                      }
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

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

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="px-4 py-2 border-t border-border bg-muted/50 flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground flex-1 truncate">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2 items-center">
            <input ref={fileInputRef} type="file" className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
            />
            <button onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-lg hover:bg-muted transition-colors"
              title="File attach karo"
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            </button>

            <input ref={cameraInputRef} type="file" className="hidden"
              accept="image/*" capture="environment"
              onChange={handleFileSelect}
            />
            <button onClick={() => cameraInputRef.current?.click()}
              className="p-2.5 rounded-lg hover:bg-muted transition-colors"
              title="Photo khincho"
            >
              <Camera className="w-4 h-4 text-muted-foreground" />
            </button>

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
              disabled={loading || (!input.trim() && !selectedFile)}
              size="icon"
              className="h-11 w-11 flex-shrink-0"
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