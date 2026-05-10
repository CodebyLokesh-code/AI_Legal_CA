const GST = require("../../models/ca/gstModel")
const { successResponse, errorResponse } = require("../../utils/responseHandler")

exports.addGST = async (req , res) => {
    try {
        const {clientId,gstNumber,returnType,period} = req.body
        if(!clientId || !gstNumber || !returnType || !period){
            return errorResponse(res,"clientId, gstNumber, returnType, period required!",400)
        }
        const gst = await GST.create({...req.body,userId:req.user.id})
        return successResponse(res,"GST record created successfully", gst, 201)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getGSTs = async (req, res) => {
    try {
        const gsts = await GST.find({ userId: req.user.id })
        return successResponse(res, "GST records fetched successfully", gsts, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getGST = async (req, res) => {
    try {
        const gst = await GST.findOne({ _id: req.params.id, userId: req.user.id })
        if (!gst) return errorResponse(res, "GST record not found", 404)
        return successResponse(res, "GST record fetched successfully", gst, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.updateGST = async (req, res) => {
    try {
        const gst = await GST.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        )
        if (!gst) return errorResponse(res, "GST record not found", 404)
        return successResponse(res, "GST record updated successfully", gst, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.deleteGST = async (req, res) => {
    try {
        const gst = await GST.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
        if (!gst) return errorResponse(res, "GST record not found", 404)
        return successResponse(res, "GST record deleted successfully", null, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}