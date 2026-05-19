const Joi = require("joi")

const addClientValidation = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().optional(),
    phone: Joi.number().required(),
    address: Joi.string().optional(),
    panNumber: Joi.string().length(10).optional(),
    type: Joi.string().valid("individual", "company", "trust").optional(),
    gstNumber: Joi.string().optional(),
    notes: Joi.string().optional()
})

const updateClientValidation = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.number().optional(),
    address: Joi.string().optional(),
    panNumber: Joi.string().length(10).optional(),
    type: Joi.string().valid("individual", "company", "trust").optional(),
    gstNumber: Joi.string().optional(),
    notes: Joi.string().optional()
})

module.exports = { addClientValidation, updateClientValidation }