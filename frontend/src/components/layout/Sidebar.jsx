import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, Calculator, FileText,
  Scale, BookOpen, Receipt, FolderOpen, Bot,
  ChevronLeft, ChevronRight, LogOut, Menu, X
} from "lucide-react"
import useAuthStore from "../../store/authStore"

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["ca", "lawyer", "hybrid"] },
  { label: "Clients", icon: Users, path: "/clients", roles: ["ca", "lawyer", "hybrid"] },
  { label: "Tax", icon: Calculator, path: "/ca/tax", roles: ["ca", "hybrid"] },
  { label: "GST", icon: FileText, path: "/ca/gst", roles: ["ca", "hybrid"] },
  { label: "Audit", icon: BookOpen, path: "/ca/audit", roles: ["ca", "hybrid"] },
  { label: "Cases", icon: Scale, path: "/lawyer/cases", roles: ["lawyer", "hybrid"] },
  { label: "Drafts", icon: BookOpen, path: "/lawyer/drafts", roles: ["lawyer", "hybrid"] },
  { label: "Invoices", icon: Receipt, path: "/invoices", roles: ["ca", "lawyer", "hybrid"] },
  { label: "Documents", icon: FolderOpen, path: "/documents", roles: ["ca", "lawyer", "hybrid"] },
  { label: "AI Assistant", icon: Bot, path: "/ai-chat", roles: ["ca", "lawyer", "hybrid"] },
]

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const filtered = menuItems.filter(item => item.roles.includes(user?.role))

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-border ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Scale className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-foreground text-sm"
          >
            AI Legal CA
          </motion.span>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filtered.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <motion.button
              key={item.path}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { navigate(item.path); setMobileOpen?.(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-border space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 rounded-lg bg-muted mb-2">
            <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </motion.button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex flex-col h-screen bg-card border-r border-border relative flex-shrink-0"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed left-0 top-0 h-full w-60 bg-card border-r border-border z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}