import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { useEffect } from "react"
import useThemeStore from "./store/themeStore"
import useAuthStore from "./store/authStore"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import VerifyOtp from "./pages/auth/VerifyOtp"
import Layout from "./components/layout/Layout"
import Dashboard from "./pages/dashboard/Dashboard"
import Clients from "./pages/clients/Clients"
import Tax from "./pages/ca/Tax"
import GST from "./pages/ca/GST"
import Audit from "./pages/ca/Audit"
import Cases from "./pages/lawyer/Cases"
import Drafts from "./pages/lawyer/Drafts"
import Invoices from "./pages/common/Invoices"
import Documents from "./pages/common/Documents"
import AIChat from "./pages/ai/AIChat"

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#1c1c1c" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="ca/tax" element={<Tax />} />
          <Route path="ca/gst" element={<GST />} />
          <Route path="ca/audit" element={<Audit />} />
          <Route path="lawyer/cases" element={<Cases />} />
          <Route path="lawyer/drafts" element={<Drafts />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="documents" element={<Documents />} />
          <Route path="ai-chat" element={<AIChat />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App