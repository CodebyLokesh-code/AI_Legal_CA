import { Menu, Sun, Moon, Bell } from "lucide-react"
import { motion } from "framer-motion"
import useThemeStore from "../../store/themeStore"
import useAuthStore from "../../store/authStore"

export default function Navbar({ setMobileOpen }) {
  const { theme, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
      
      {/* Left — Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-sm font-semibold text-foreground md:hidden">AI Legal CA</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 ml-auto">
        
        {/* Notification */}
        <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        {/* Theme Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {theme === "dark"
            ? <Sun className="w-4 h-4 text-muted-foreground" />
            : <Moon className="w-4 h-4 text-muted-foreground" />
          }
        </motion.button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
      </div>
    </header>
  )
}