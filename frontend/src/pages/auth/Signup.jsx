import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, EyeOff, Scale, Calculator } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useThemeStore from "../../store/themeStore"
import { signupApi } from "../../api-calls/authApi"

export default function Signup() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "ca"
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.phoneNumber) {
      toast.error("Sab fields required hain!")
      return
    }
    setLoading(true)
    try {
      await signupApi(form)
      toast.success("OTP bheja gaya email pe!")
      navigate("/verify-otp", { state: { email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">

      {/* Theme Toggle */}
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
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Legal CA</h1>
            <p className="text-xs text-muted-foreground">Smart Legal & Tax Management</p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-lg"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Create acount</h2>
            <p className="text-muted-foreground text-sm mt-1">Select role</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                name="name"
                placeholder="Aapka naam"
                value={form.name}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="aap@example.com"
                value={form.email}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                name="phoneNumber"
                placeholder="9876543210"
                value={form.phoneNumber}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-3 gap-2">
                {["ca", "lawyer", "hybrid"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`h-11 rounded-lg border text-sm font-medium capitalize transition-all ${
                      form.role === r
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {r === "ca" ? "CA" : r === "lawyer" ? "Lawyer" : "Hybrid"}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Aready have acount?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline font-medium"
            >
              Login 
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}