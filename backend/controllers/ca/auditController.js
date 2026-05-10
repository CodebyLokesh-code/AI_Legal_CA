const Audit = require("../../models/ca/auditModel")
const { successResponse, errorResponse } = require("../../utils/responseHandler")

exports.addAudit = async (req, res) => {
    try {
        const { clientId, financialYear, auditType } = req.body
        if (!clientId || !financialYear || !auditType) {
            return errorResponse(res, "clientId, financialYear, auditType required!", 400)
        }
        const audit = await Audit.create({ ...req.body, userId: req.user.id })
        return successResponse(res, "Audit record created successfully", audit, 201)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getAudits = async (req, res) => {
    try {
        const audits = await Audit.find({ userId: req.user.id })
        return successResponse(res, "Audit records fetched successfully", audits, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getAudit = async (req, res) => {
    try {
        const audit = await Audit.findOne({ _id: req.params.id, userId: req.user.id })
        if (!audit) return errorResponse(res, "Audit record not found", 404)
        return successResponse(res, "Audit record fetched successfully", audit, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.updateAudit = async (req, res) => {
    try {
        const audit = await Audit.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        )
        if (!audit) return errorResponse(res, "Audit record not found", 404)
        return successResponse(res, "Audit record updated successfully", audit, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}
exports.deleteAudit = async (req, res) => {
    try {
        const audit = await Audit.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
        if (!audit) return errorResponse(res, "Audit record not found", 404)
        return successResponse(res, "Audit record deleted successfully", null, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}