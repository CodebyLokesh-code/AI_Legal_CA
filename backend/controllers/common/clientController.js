const Client = require("../../models/common/clientModel")
const asyncHandler = require("../../utils/asyncHandler")
const { paginate, buildMeta } = require("../../utils/paginate")
const { scopeFilter, scopeCreate } = require("../../utils/scopedQuery")
const { successResponse, errorResponse } = require("../../utils/responseHandler")

// LIST — paginated + searchable + lean
exports.getClients = asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = paginate(req)

    const filter = scopeFilter(req)

    // Optional filters
    if (req.query.type) filter.type = req.query.type
    if (req.query.search) {
        // Text search if 3+ chars, else regex
        const q = req.query.search.trim()
        if (q.length >= 3) {
            filter.$text = { $search: q }
        } else {
            filter.$or = [
                { name:  { $regex: q, $options: "i" } },
                { phone: q },
            ]
        }
    }

    // Parallel — list + count ek saath
    const [data, total] = await Promise.all([
        Client.find(filter)
            .select("name email phone type panNumber gstNumber address createdAt")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Client.countDocuments(filter),
    ])

    return successResponse(res, "Clients fetched successfully", {
        data,
        pagination: buildMeta({ page, limit, total }),
    }, 200)
})

// GET ONE
exports.getClient = asyncHandler(async (req, res) => {
    const client = await Client.findOne(scopeFilter(req, { _id: req.params.id })).lean()
    if (!client) return errorResponse(res, "Client not found", 404)
    return successResponse(res, "Client fetched successfully", client, 200)
})

// ADD
exports.addClient = asyncHandler(async (req, res) => {
    const { name, phone } = req.body
    if (!name || !phone) return errorResponse(res, "Name and Number required!", 400)

    const client = await Client.create(scopeCreate(req, req.body))
    return successResponse(res, "Client added successfully", client, 201)
})

// UPDATE
exports.updateClient = asyncHandler(async (req, res) => {
    const client = await Client.findOneAndUpdate(
        scopeFilter(req, { _id: req.params.id }),
        req.body,
        { new: true, runValidators: true }
    )
    if (!client) return errorResponse(res, "Client not found", 404)
    return successResponse(res, "Client updated successfully", client, 200)
})

// DELETE
exports.deleteClient = asyncHandler(async (req, res) => {
    const client = await Client.findOneAndDelete(scopeFilter(req, { _id: req.params.id }))
    if (!client) return errorResponse(res, "Client not found", 404)
    return successResponse(res, "Client deleted successfully", null, 200)
})