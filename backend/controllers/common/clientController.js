const Client = require("../../models/common/clientModel")
const { successResponse, errorResponse } = require("../../utils/responseHandler")

exports.addClient = async (req, res) => {
    try {
        const { name, phone } = req.body

        if (!name || !phone) {
            return errorResponse(res, "Name and Number required!", 400)
        }

        const client = await Client.create({
            ...req.body,
            userId: req.user.id
        })

        return successResponse(res, "Client added successfully", client, 201)

    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find({
            userId: req.user.id
        })

        return successResponse(res, "Clients fetched successfully!", clients, 200)

    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.getClient = async (req,res) => {
    try {
        const client = await Client.findOne({
            _id:req.params.id,
            userId: req.user.id
        })
        if(!client){
            return errorResponse(res,"Client not found",404)
        }
        return successResponse(res,"Client fetched successfully",client,200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.updateClient = async (req,res) => {
    try {
        const client = await Client.findOneAndUpdate(
            {_id: req.params.id,userId: req.user.id},
            req.body,
            {new:true}
        )
        if(!client){
            return errorResponse(res,"Client not found",404)
        }
        return successResponse(res, "Client updated successfully", client, 200)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}

exports.deleteClient = async (req,res) => {
    try {
        const client = await Client.findOneAndDelete({
            _id:req.params.id,
            userId:req.user.id
        })
        if(!client){
            return errorResponse(res, "Client not found", 404)
        }

        return successResponse(res, "Client deleted successfully", null, 200)
    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}