const Document = require("../../models/common/documentModel")
const cloudinary = require("../../config/cloudinary")
const { successResponse, errorResponse } = require("../../utils/responseHandler")

exports.uploadDocument = async (req,res) => {
    try {
        if(!req.file){
            return errorResponse(res,"File required!",400)
        }

        //Cloudinary

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder:"ai_legal_ca",
            resource_type: "auto"
        })
        //database me save 

        const document = await Document.create({
            userId: req.user.id,
            clientId: req.body.clientId,
            fileName: req.file.originalname,
            url: result.secure_url,
            size: req.file.size,
            mimeType: req.file.mimetype,
            relatedTo: req.body.relatedTo,
            relatedId: req.body.relatedId
        })
        return successResponse(res, "Document uploaded successfully", document, 201)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.user.id })
        return successResponse(res, "Documents fetched successfully", documents, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user.id
        })
        if (!document) return errorResponse(res, "Document not found", 404)
        return successResponse(res, "Document fetched successfully", document, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        })
        if (!document) return errorResponse(res, "Document not found", 404)
        return successResponse(res, "Document deleted successfully", null, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}