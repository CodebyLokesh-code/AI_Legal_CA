// Scoped query helper — multi-tenancy ke liye foundation
// New file: backend/utils/scopedQuery.js
//
// PROBLEM: Har controller mein {userId: req.user.id} repeat hota hai
// Aage firmId bhi aayega — har jagah change karna padega
//
// SOLUTION: Ek jagah scope build karo
//
// Usage:
//   const filter = scopeFilter(req)  → { userId: "..." }
//   await Model.find(filter)
//
// Phase 2 mein jab firmId aayega, sirf is file mein change karna padega:
//   return req.user.firmId ? { firmId: ... } : { userId: ... }

const scopeFilter = (req, extra = {}) => ({
    userId: req.user._id || req.user.id,
    ...extra,
})

// Document banate time scope add karo
const scopeCreate = (req, data) => ({
    ...data,
    userId: req.user._id || req.user.id,
})

module.exports = { scopeFilter, scopeCreate }
