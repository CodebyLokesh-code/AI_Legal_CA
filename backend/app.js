const express = require("express")
const connectDB = require("./config/db")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")
const commonRoutes = require("./routes/common/commonRoutes")

const app = express()
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api", commonRoutes)

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