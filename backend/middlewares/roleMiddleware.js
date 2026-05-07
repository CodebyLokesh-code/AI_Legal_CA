const { errorResponse } = require("../utils/responseHandler")

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return errorResponse(res, "Access denied: insufficient role", 403)
        }
        next()
    }
}

module.exports = roleMiddleware