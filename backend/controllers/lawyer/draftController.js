const Draft = require("../../models/lawyer/draftModel")
const { successResponse, errorResponse } = require("../../utils/responseHandler")

exports.addDraft = async (req, res) => {
    try {
        const { clientId, title, type } = req.body
        if (!clientId || !title || !type) {
            return errorResponse(res, "clientId, title, type required!", 400)
        }
        const draft = await Draft.create({ ...req.body, userId: req.user.id })
        return successResponse(res, "Draft created successfully", draft, 201)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getDrafts = async (req, res) => {
    try {
        const drafts = await Draft.find({ userId: req.user.id })
        return successResponse(res, "Drafts fetched successfully", drafts, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getDraft = async (req, res) => {
    try {
        const draft = await Draft.findOne({ _id: req.params.id, userId: req.user.id })
        if (!draft) return errorResponse(res, "Draft not found", 404)
        return successResponse(res, "Draft fetched successfully", draft, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.updateDraft = async (req, res) => {
    try {
        const draft = await Draft.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        )
        if (!draft) return errorResponse(res, "Draft not found", 404)
        return successResponse(res, "Draft updated successfully", draft, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.deleteDraft = async (req, res) => {
    try {
        const draft = await Draft.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
        if (!draft) return errorResponse(res, "Draft not found", 404)
        return successResponse(res, "Draft deleted successfully", null, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}