const express = require("express")
const connectDB = require("./config/db")
require("dotenv").config()
const aiRoutes = require("./routes/ai/aiRoutes")
const authRoutes = require("./routes/authRoutes")
const commonRoutes = require("./routes/common/commonRoutes")
const caRoutes = require("./routes/ca/caRoutes")
const lawyerRoutes = require("./routes/lawyer/lawyerRoutes")

const app = express()
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api", commonRoutes)
app.use("/api/ca", caRoutes)
app.use("/api/lawyer", lawyerRoutes)
app.use("/api/ai",aiRoutes)

const startServer = async () => {
    try {
        await connectDB()
        const PORT = process.env.PORT || 8000
        app.listen(PORT, () => {
            console.log(`Server Running On ${PORT}`)
        })
    } catch (error) {
        console.log("Server Start Failed!", error)
        process.exit(1)
    }
}

startServer()