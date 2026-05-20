require("dotenv").config()
const express  = require("express")
const cors     = require("cors")
const helmet   = require("helmet")
const morgan   = require("morgan")
const rateLimit = require("express-rate-limit")
const winston  = require("winston")

const connectDB     = require("./config/db")
const aiRoutes      = require("./routes/ai/aiRoutes")
const authRoutes    = require("./routes/authRoutes")
const commonRoutes  = require("./routes/common/commonRoutes")
const caRoutes      = require("./routes/ca/caRoutes")
const lawyerRoutes  = require("./routes/lawyer/lawyerRoutes")

// ── Logger ────────────────────────────────────────
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  ]
})
global.logger = logger

// ── Limiters ──────────────────────────────────────
const limiter = (max, windowMs = 15 * 60 * 1000, msg) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false,
    message: { success: false, message: msg } })

const globalLimiter = limiter(100, undefined, "Too many requests. Try again in 15 min.")
const authLimiter   = limiter(10,  undefined, "Too many login attempts. Try again in 15 min.")
const aiLimiter     = limiter(20, 60 * 1000,  "AI limit reached. Try again in 1 min.")

// ── App setup ─────────────────────────────────────
const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(globalLimiter)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(morgan("combined", { stream: { write: (m) => logger.info(m.trim()) } }))
app.use((req, res, next) => {
  console.log(">>", req.method, req.originalUrl)
  next()
})

// ── Routes ────────────────────────────────────────
app.get("/health", (req, res) =>
  res.json({ success: true, env: process.env.NODE_ENV, ts: new Date() })
)
app.use("/api/v1/auth",   authLimiter, authRoutes)
app.use("/api/v1",       commonRoutes)
app.use("/api/v1/ca",    caRoutes)
app.use("/api/v1/lawyer", lawyerRoutes)
app.use("/api/v1/ai",    aiLimiter, aiRoutes)

// ── 404 ───────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` })
)

// ── Error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack, url: req.originalUrl })

  const errs = {
    ValidationError:   [400, Object.values(err.errors || {}).map(e => e.message).join(", ")],
    JsonWebTokenError: [401, "Invalid token. Please login again."],
    TokenExpiredError: [401, "Session expired. Please login again."],
  }

  if (errs[err.name])
    return res.status(errs[err.name][0]).json({ success: false, message: errs[err.name][1] })

  if (err.code === 11000)
    return res.status(400).json({ success: false, message: `${Object.keys(err.keyValue)[0]} already exists.` })

  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ success: false, message: "File too large. Max 10MB." })

  res.status(500).json({ success: false, message: "Internal server error." })
})

// ── Process guards ────────────────────────────────
process.on("unhandledRejection", (r) => logger.error("Unhandled rejection:", r))
process.on("uncaughtException",  (e) => { logger.error("Uncaught exception:", e); process.exit(1) })

// ── Start ─────────────────────────────────────────
const start = async () => {
  await connectDB()
  const PORT = process.env.PORT || 8000
  app.listen(PORT, () => logger.info(`Server on port ${PORT}`))
}

start().catch((e) => { logger.error(e); process.exit(1) })