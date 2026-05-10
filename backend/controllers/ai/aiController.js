const { chatWithAI } = require("../../services/ai/aiService")
const Client = require("../../models/common/clientModel")
const Invoice = require("../../models/common/invoiceModel")
const Tax = require("../../models/ca/taxModel")
const Gst = require("../../models/ca/gstModel")
const Audit = require("../../models/ca/auditModel")
const Case = require("../../models/lawyer/caseModel")
const Draft = require("../../models/lawyer/draftModel")
const Document = require("../../models/common/documentModel")
const { successResponse, errorResponse } = require("../../utils/responseHandler")

exports.chat = async (req, res) => {
    try {
        const { message } = req.body
        if (!message) {
            return errorResponse(res, "Message required!", 400)
        }

        const role = req.user.role
        let contextData = { role }

        // CA ka data
        if (role === "ca" || role === "hybrid") {
            const [clients, taxes, gsts, audits, invoices] = await Promise.all([
                Client.find({ userId: req.user.id }),
                Tax.find({ userId: req.user.id }),
                Gst.find({ userId: req.user.id }),
                Audit.find({ userId: req.user.id }),
                Invoice.find({ userId: req.user.id })
            ])
            contextData = { role, clients, taxes, gsts, audits, invoices }
        }

        // Lawyer ka data
        if (role === "lawyer" || role === "hybrid") {
            const [clients, cases, drafts, invoices] = await Promise.all([
                Client.find({ userId: req.user.id }),
                Case.find({ userId: req.user.id }),
                Draft.find({ userId: req.user.id }),
                Invoice.find({ userId: req.user.id })
            ])
            contextData = { ...contextData, clients, cases, drafts, invoices }
        }

        const aiResponse = await chatWithAI(message, contextData)
        return successResponse(res, "AI response", { reply: aiResponse }, 200)

    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}