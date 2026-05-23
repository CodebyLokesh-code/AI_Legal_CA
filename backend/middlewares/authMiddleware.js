const jwt = require("jsonwebtoken")
const { errorResponse } = require("../utils/responseHandler")

const authMiddleware = async (req, res, next) => {
    
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errorResponse(res, "Access denied! No token provided", 401)
        }
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        req.user._id = decoded.id  // ← dono available honge
        next()
    } catch (error) {
        return errorResponse(res, "Invalid or expired token", 401)
        
    }
}

module.exports = authMiddleware