const Case = require("../../models/lawyer/caseModel")
const { successResponse, errorResponse } = require("../../utils/responseHandler")

exports.addCase = async (req, res) => {
    try {
        const { clientId, caseNumber, caseTitle, court } = req.body
        if (!clientId || !caseNumber || !caseTitle || !court) {
            return errorResponse(res, "clientId, caseNumber, caseTitle, court required!", 400)
        }
        const existingCase = await Case.findOne({ caseNumber, userId: req.user.id })
        if (existingCase) {
            return errorResponse(res, "Case with this number already exists", 400)
        }
        const newCase = await Case.create({ ...req.body, userId: req.user.id })
        return successResponse(res, "Case created successfully", newCase, 201)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getCases = async (req, res) => {
    try {
        const cases = await Case.find({ userId: req.user.id })
        return successResponse(res, "Cases fetched successfully", cases, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getCase = async (req, res) => {
    try {
        const singleCase = await Case.findOne({ _id: req.params.id, userId: req.user.id })
        if (!singleCase) return errorResponse(res, "Case not found", 404)
        return successResponse(res, "Case fetched successfully", singleCase, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.updateCase = async (req, res) => {
    try {
        const updatedCase = await Case.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        )
        if (!updatedCase) return errorResponse(res, "Case not found", 404)
        return successResponse(res, "Case updated successfully", updatedCase, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.deleteCase = async (req, res) => {
    try {
        const deletedCase = await Case.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
        if (!deletedCase) return errorResponse(res, "Case not found", 404)
        return successResponse(res, "Case deleted successfully", null, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

// Hearing 
exports.addHearing = async (req, res) => {
    try {
        const { date, notes, nextDate } = req.body
        if (!date) return errorResponse(res, "date required!", 400)
        const updatedCase = await Case.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { $push: { hearings: { date, notes, nextDate } } },
            { new: true }
        )
        if (!updatedCase) return errorResponse(res, "Case not found", 404)
        return successResponse(res, "Hearing added successfully", updatedCase, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}