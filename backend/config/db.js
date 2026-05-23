const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // Connection pool — 10k users ke liye tuned
            maxPoolSize: 50,
            minPoolSize: 5,

            // Timeouts — production must
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 10000,

            //  manually karenge syncIndexes script se
            // Dev mein ON rakho  schema change hone par auto-create ho
            autoIndex: process.env.NODE_ENV !== "production",
        })

        // Connection events — debugging mein bahut help karte hain
        mongoose.connection.on("error", (err) => {
            const log = global.logger?.error || console.error  //Optional chaining
            log("MongoDB error:", err.message)
        })

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected — auto-reconnect attempting")
        })

        mongoose.connection.on("reconnected", () => {
            console.log("MongoDB reconnected")
        })

        console.log("MongoDB connected")
    } catch (error) {
        console.error("MongoDB connection failed:", error.message)
        process.exit(1)
    }
}

module.exports = connectDB
