const joi = require("joi")

const signupValidation = joi.object({
    name:joi.string().min(2).max(50).required(),
    email: joi.string().email().required(),
    password:joi.string().min(6).required(),
    phoneNumber:joi.number().required(),
    role:joi.string().valid("ca","lawyer","hybrid"),
    firmName:joi.string().optional(),
    address: joi.string().optional(),
    icaiNumber: joi.string().optional(),
    barNumber: joi.string().optional()
})

const loginValidation = joi.object({
    email:joi.string().email().required(),
    password: joi.string().required(),
})

const otpValidation = joi.object({
    email:joi.string().email().required(),
    otp:joi.string().length(6).required()
})

module.exports = { signupValidation, loginValidation, otpValidation }

