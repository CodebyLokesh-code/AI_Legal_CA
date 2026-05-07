const mongoose = require("mongoose")
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Mongodb Cannected")
    } catch (error) {
        console.log("MongoDB Connection Failed",error)
        process.exit(1)
    }
}

module.exports = connectDB