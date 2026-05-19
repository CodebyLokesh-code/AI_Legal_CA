
const express = require("express")
const connectDB = require("./config/db")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const winston = require("winston")
require("dotenv").config()

const aiRoutes = require("./routes/ai/aiRoutes")
const authRoutes = require("./routes/authRoutes")
const commonRoutes = require("./routes/common/commonRoutes")
const caRoutes = require("./routes/ca/caRoutes")
const lawyerRoutes = require("./routes/lawyer/lawyerRoutes")

const app = express()

// Logger Setup 
// Winston saves all logs to files
// error.log → only errors
// combined.log → everything
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

// Export logger so other files can use it too
global.logger = logger

// ─── Security ────────────────────────────────────
// Helmet adds 11 security headers automatically
app.use(helmet())

// CORS — only allow our frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

// ─── Rate Limiting ───────────────────────────────
// Prevents abuse and DDoS attacks

// Global — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again after 15 minutes."
    }
})

// Auth — strict limit to prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    }
})

// AI — limit to control API costs
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "AI request limit reached. Please try again after 1 minute."
    }
})

app.use(globalLimiter)

// ─── Body Parser ─────────────────────────────────
// Limit request size to prevent large payload attacks
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// ─── HTTP Request Logger ─────────────────────────
// Logs every request: method, url, status, response time
app.use(morgan("combined", {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}))

// ─── Health Check ────────────────────────────────
// Used by deployment platforms to check if server is alive
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running!",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
    })
})

// ─── API Routes v1 ───────────────────────────────
app.use("/api/v1/auth", authLimiter, authRoutes)
app.use("/api/v1", commonRoutes)
app.use("/api/v1/ca", caRoutes)
app.use("/api/v1/lawyer", lawyerRoutes)
app.use("/api/v1/ai", aiLimiter, aiRoutes)

// ─── 404 Handler ─────────────────────────────────
// Catches all undefined routes
app.use( (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found.`
    })
})

// ─── Global Error Handler ────────────────────────
// Catches all unhandled errors from controllers
// Must have 4 parameters — (err, req, res, next)
app.use((err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    })

    // Mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: Object.values(err.errors).map(e => e.message).join(", ")
        })
    }

    // Invalid JWT token
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token. Please login again."
        })
    }

    // Expired JWT token
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Session expired. Please login again."
        })
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(400).json({
            success: false,
            message: `${field} already exists.`
        })
    }

    // Multer file size error
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File size too large. Maximum 10MB allowed."
        })
    }

    // Default server error
    res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later."
    })
})

// ─── Unhandled Rejections ────────────────────────
// Catches promises that were rejected but not caught
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection:", reason)
})

// Catches synchronous errors that were not caught
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error)
    process.exit(1)
})

// ─── Start Server ────────────────────────────────
const startServer = async () => {
    try {
        await connectDB()
        const PORT = process.env.PORT || 8000
        app.listen(PORT, () => {
            logger.info(`Server started on port ${PORT}`)
            console.log(`🚀 Server: http://localhost:${PORT}`)
            console.log(`📊 Health: http://localhost:${PORT}/health`)
            console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
        })
    } catch (error) {
        logger.error("Server failed to start", error)
        process.exit(1)
    }
}

startServer()