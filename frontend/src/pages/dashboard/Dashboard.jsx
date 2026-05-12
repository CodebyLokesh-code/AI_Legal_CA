import { motion } from "framer-motion"
import {
  Users, Calculator, FileText, Scale,
  BookOpen, Receipt, TrendingUp, Clock
} from "lucide-react"
import useAuthStore from "../../store/authStore"
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

const chartData = [
  { month: "Jan", revenue: 40000 },
  { month: "Feb", revenue: 55000 },
  { month: "Mar", revenue: 45000 },
  { month: "Apr", revenue: 70000 },
  { month: "May", revenue: 65000 },
  { month: "Jun", revenue: 90000 },
]

const stats = [
  { label: "Total Clients", value: "24", icon: Users, color: "bg-blue-500/10 text-blue-500", roles: ["ca", "lawyer", "hybrid"] },
  { label: "Tax Records", value: "12", icon: Calculator, color: "bg-green-500/10 text-green-500", roles: ["ca", "hybrid"] },
  { label: "GST Filings", value: "8", icon: FileText, color: "bg-yellow-500/10 text-yellow-500", roles: ["ca", "hybrid"] },
  { label: "Active Cases", value: "6", icon: Scale, color: "bg-purple-500/10 text-purple-500", roles: ["lawyer", "hybrid"] },
  { label: "Drafts", value: "15", icon: BookOpen, color: "bg-pink-500/10 text-pink-500", roles: ["lawyer", "hybrid"] },
  { label: "Invoices", value: "32", icon: Receipt, color: "bg-orange-500/10 text-orange-500", roles: ["ca", "lawyer", "hybrid"] },
]

const recentActivity = [
  { text: "New client Rahul Sharma added", time: "2 min ago", icon: Users },
  { text: "GST filing completed for Q1", time: "1 hour ago", icon: FileText },
  { text: "Case hearing scheduled", time: "3 hours ago", icon: Scale },
  { text: "Invoice #INV-001 generated", time: "Yesterday", icon: Receipt },
  { text: "Tax record updated", time: "Yesterday", icon: Calculator },
]

export default function Dashboard() {
  const { user } = useAuthStore()

  const filteredStats = stats.filter(s => s.roles.includes(user?.role))

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">
          {user?.role} Dashboard — {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <TrendingUp className="w-3 h-3 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground text-sm">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-medium">
              +12.5%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6fcd" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c6fcd" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#7c6fcd" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-sm">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-foreground leading-snug">{item.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}