const Invoice = require("../../models/common/invoiceModel")
const asyncHandler = require("../../utils/asyncHandler")
const { paginate, buildMeta } = require("../../utils/paginate")
const { scopeFilter, scopeCreate } = require("../../utils/scopedQuery")
const { successResponse, errorResponse } = require("../../utils/responseHandler")
exports.getInvoices = asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = paginate(req)
    const filter = scopeFilter(req)

    if (req.query.status)   filter.status   = req.query.status
    if (req.query.clientId) filter.clientId = req.query.clientId
    if (req.query.overdue === "true") {
        filter.status  = "unpaid"
        filter.dueDate = { $lt: new Date() }
    }

    const [data, total] = await Promise.all([
        // Aggregation use kar rahe — client name bhi same query mein milega
        require("../../models/common/invoiceModel").aggregate([
            { $match: filter },
            { $sort: sort.startsWith("-")
                ? { [sort.slice(1)]: -1 }
                : { [sort]: 1 }
            },
            { $skip: skip },
            { $limit: limit },
            { $lookup: {
                from: "clients",
                localField: "clientId",
                foreignField: "_id",
                as: "client",
                pipeline: [{ $project: { name: 1, phone: 1 } }],
            }},
            { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
        ]),
        require("../../models/common/invoiceModel").countDocuments(filter),
    ])

    return successResponse(res, "Invoices fetched successfully", {
        data,
        pagination: buildMeta({ page, limit, total }),
    }, 200)
})