// AsyncHandler — try/catch boilerplate ko khatam karta hai
// New file: backend/utils/asyncHandler.js
//
// Pehle (har controller mein):
//   exports.getX = async (req, res) => {
//       try { ... } catch (error) { return errorResponse(...) }
//   }
//
// Ab:
//   exports.getX = asyncHandler(async (req, res) => { ... })
//   Error apne aap global error handler tak jayega

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler
