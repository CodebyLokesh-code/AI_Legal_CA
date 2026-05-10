const Invoice = require("../../models/common/invoiceModel")
const { successResponse, errorResponse } = require("../../utils/responseHandler")


exports.addInvoice =async (req,res) => {
    try {
        const {clientId , items , dueDate} = req.body
        if(!clientId || !items || !dueDate){
            return errorResponse(res,"ClientId, items and dueDate required!",400)
        }
        // Total calculate
        const subtotal = items.reduce((sum,item) => sum + item.amount,0)
        const gst = req.body.gst || 0
        const total = subtotal + gst

        const invoice = await Invoice.create({
            ...req.body,
            subtotal,
            total,
            userId:req.user.id
        })
        return successResponse(res,"Invoice created successfully",invoice,201)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

exports.getInvoices = async (req,res) => {
    try {
        const invoices = await Invoice.find({ userId: req.user.id })
        return successResponse(res,"Invoices fetched successfully",invoices,200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getInvoice = async (req,res) => {
    try {
        const invoice = await Invoice.findOne({
            _id:req.params.id,
            userId:req.user.id
        })
        if(!invoice) return errorResponse(res, "Invoice not found", 404)
            return successResponse(res,"Invoice fetched successfully",invoice,200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.updateInvoice = async (req,res) => {
    try {
        const invoice = await Invoice.findOneAndUpdate({
            _id:req.params.id,
            userId:req.user.id},
            req.body,
            {new:true}
        )
        if(!invoice) return errorResponse(res,"Invoice not found",404)
            return successResponse(res,"Invoice update successfully",invoice,200)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}
exports.deleteInvoice = async (req,res) => {
    try {
        const invoice = await Invoice.findOneAndDelete({
            _id:req.params.id,
            userId:req.user.id
        })
        if(!invoice) return errorResponse(res,"Invoice not found ",404)
            return successResponse(res, "Invoice deleted successfully", null, 200)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}