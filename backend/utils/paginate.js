// Pagination helper — har list endpoint isi se chalega
// New file: backend/utils/paginate.js

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

const paginate = (req, defaults = {}) => {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1)
    const limit = Math.min(
        parseInt(req.query.limit) || defaults.limit || DEFAULT_LIMIT,
        MAX_LIMIT
    )
    const skip = (page - 1) * limit
    const sort = req.query.sort || defaults.sort || "-createdAt"

    return { page, limit, skip, sort }
}

// Pagination metadata banao — response mein bhejne ke liye
const buildMeta = ({ page, limit, total }) => ({
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
})

module.exports = { paginate, buildMeta }
