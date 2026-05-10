const Tax = require("../../models/ca/taxModel")
const {successResponse , errorResponse} = require("../../utils/responseHandler")

exports.addTax = async (req,res) => {
    try {
        const {clientId,financialYear,itrType,income,deductions} = req.body
        if(!clientId || !financialYear || !itrType){
            return errorResponse(res,"ClientId , Financial Year itrType required!",400)
        }
        const tax = await Tax.create({
            ...req.body,
            userId:req.user.id
        })

        return successResponse(res,"Tax record create successfully ",tax,201)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

exports.getTaxes = async (req,res) => {
    try {
        const taxes = await Tax.find({userId:req.user.id})
        return successResponse(res,"Taxes records fetched successfully" , taxes,200)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

exports.getTax = async (req,res) => {
    try {
        const tax = await Tax.findOne({
            _id:req.params.id,
            userId:req.user.id
        })
        if(!tax)return errorResponse(res,"Tax record not found",tax,404)
    return successResponse(res, "Tax record fetched successfully", tax, 200)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

exports.updateTax = async (req,res) => {
    try {
        const tax = await Tax.findOneAndUpdate(
        {_id:req.params.id, userId:req.user.id},
        req.body,
        {new:true}
    )
    if(!tax) return errorResponse(res,"Tax record not found",404)
        return successResponse(res,"Tax record update successfully",tax,200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.deleteTax = async (req, res) => {
    try {
        const tax = await Tax.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        })
        if (!tax) return errorResponse(res, "Tax record not found", 404)
        return successResponse(res, "Tax record deleted successfully", null, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}