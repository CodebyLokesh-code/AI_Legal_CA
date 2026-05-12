import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useThemeStore from "../../store/themeStore"
import { verifyOtpApi } from "../../api-calls/authApi"

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useThemeStore()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const email = location.state?.email || ""

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!otp) {
      toast.error("OTP required hai!")
      return
    }
    setLoading(true)
    try {
      await verifyOtpApi({ email, otp })
      toast.success("Email verified! Ab login karein")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP galat hai!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-lg"
        >
          <div className="mb-6 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-foreground">OTP Verify karein</h2>
            <p className="text-muted-foreground text-sm mt-2">
              <span className="text-primary font-medium">{email}</span> pe OTP bheja gaya hai
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>OTP Code</Label>
              <Input
                placeholder="6 digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-11 text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : "Verify OTP"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}