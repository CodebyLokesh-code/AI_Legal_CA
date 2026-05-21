import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Sparkles, FileText, Calculator, Scale, Paperclip, Camera, Trash2, Copy, Check } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PageHeader from "../../components/shared/PageHeader"
import { chatApi } from "../../api-calls/aiApi"
import useChatStore from "../../store/chatStore"
import ReactMarkdown from "react-markdown"

const suggestions = [
  { icon: Calculator, text: "Tax saving ke liye suggestions do", color: "text-emerald-500" },
  { icon: FileText, text: "Legal notice draft karo property dispute ke liye", color: "text-blue-500" },
  { icon: Scale, text: "GST filing process explain karo", color: "text-indigo-500" },
  { icon: Sparkles, text: "ITR-1 vs ITR-2 mein kya difference hai?", color: "text-amber-500" },
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

  useEffect(() => {
  bottomRef.current?.scrollIntoView({
    behavior: "auto",
  })
}, [messages, loading])

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
      fileName: selectedFile?.name || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    addMessage(userMessage)
    setInput("")
    setSelectedFile(null)
    setLoading(true)
    

    try {
  const res = await chatApi(
    msg || `File uploaded: ${selectedFile?.name}`,
    sessionId
  )

  console.log("AI RESPONSE:", res)

  addMessage({
    role: "assistant",
    content: res?.data?.reply || "Koi response nahi mila!",
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  })

} catch (err) {
  console.error("AI ERROR:", err)

  toast.error("AI se response nahi mila!")

  addMessage({
    role: "assistant",
    content: "Sorry, abhi response nahi de pa raha. Thodi der baad try karein!",
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  })

} finally {
  setLoading(false)
}
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto w-full">
      <PageHeader
        title="AI Assistant"
        subtitle="Tax, GST, Legal — AI Legal help"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-full px-4"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </Button>
        }
      />

      <div className="flex flex-col flex-1 bg-card/50 border border-border/60 rounded-2xl overflow-hidden shadow-sm">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 mt-4">
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-card hover:bg-muted/50 hover:border-border transition-all duration-200 text-left group shadow-sm"
                >
                  <div className={`p-2 rounded-full bg-muted group-hover:scale-110 transition-transform ${s.color}`}>
                    <s.icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <span className="text-[15px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{s.text}</span>
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
                className={`flex gap-4 group ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Modern Avatars */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1 ${
                  msg.role === "assistant" 
                    ? "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground" 
                    : "bg-muted border border-border text-muted-foreground"
                }`}>
                  {msg.role === "assistant"
                    ? <Sparkles className="w-4 h-4" />
                    : <User className="w-4 h-4" />
                  }
                </div>

                <div className="flex flex-col gap-1.5 max-w-[80%] md:max-w-[70%]">
                  <div className={`px-5 py-4 text-[15px] leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-3xl rounded-tr-sm"
                      : "bg-muted/40 border border-border/50 text-foreground rounded-3xl rounded-tl-sm"
                  }`}>
                    {msg.fileName && (
                      <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-background/20 rounded-lg w-fit border border-border/10">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm font-medium">{msg.fileName}</span>
                      </div>
                    )}
                    
                    <div className="space-y-3 break-words text-opacity-90">
                      <ReactMarkdown 
                        components={{
                          ul: ({node, ...props}) => <ul className="list-disc ml-5 space-y-1.5 my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-5 space-y-1.5 my-2" {...props} />,
                          li: ({node, ...props}) => <li className="pl-1" {...props} />,
                          p: ({node, ...props}) => <p className="m-0" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-foreground/90" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    <div className={`text-[11px] mt-3 flex items-center gap-1.5 font-medium ${
                      msg.role === "user" ? "justify-end text-primary-foreground/70" : "justify-start text-muted-foreground"
                    }`}>
                      {msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(msg.content, i)}
                      className="self-start flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all px-2 py-1 rounded-md hover:bg-muted"
                    >
                      {copiedIndex === i
                        ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</>
                        : <><Copy className="w-3.5 h-3.5" /> Copy</>
                      }
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground flex items-center justify-center shadow-sm mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-muted/40 border border-border/50 px-5 py-4 rounded-3xl rounded-tl-sm flex gap-1.5 items-center h-12 shadow-sm">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 bg-primary/60 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3 border-t border-border/50 bg-muted/30 flex items-center gap-3">
            <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground flex-1 truncate">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Modern Pill-style Input */}
        <div className="p-4 bg-background/50 backdrop-blur-sm border-t border-border/50">
  <div className="max-w-5xl mx-auto flex gap-2 items-center bg-muted/40 backdrop-blur-xl border border-border/60 p-1.5 h-[68px] rounded-[2rem] shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all duration-200">
    
    <input
      ref={fileInputRef}
      type="file"
      className="hidden"
      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
      onChange={handleFileSelect}
    />

    <button
      onClick={() => fileInputRef.current?.click()}
      className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground ml-1"
      title="Attach file"
    >
      <Paperclip className="w-5 h-5" />
    </button>

    <input
      ref={cameraInputRef}
      type="file"
      className="hidden"
      accept="image/*"
      capture="environment"
      onChange={handleFileSelect}
    />

    <button
      onClick={() => cameraInputRef.current?.click()}
      className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title="Take photo"
    >
      <Camera className="w-5 h-5" />
    </button>

    <Input
      placeholder="Ask anything"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) =>
        e.key === "Enter" && !e.shiftKey && sendMessage()
      }
      disabled={loading}
      className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 h-full text-[15px] placeholder:text-muted-foreground/70"
    />

    <Button
      onClick={() => sendMessage()}
      disabled={loading || (!input.trim() && !selectedFile)}
      size="icon"
      className="h-12 w-12 rounded-full flex-shrink-0 shadow-md"
    >
      <Send className="w-4 h-4 ml-0.5" />
    </Button>
  </div>

  <p className="text-[11px] font-medium text-muted-foreground mt-3 text-center opacity-70">
    AI galti kar sakta hai — important decisions mein expert se salah lein
  </p>
</div>
      </div>
    </div>
  )
}