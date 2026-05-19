const Joi = require("joi")

const taxValidation = Joi.object({
    clientId: Joi.string().required(),
    financialYear: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
    itrType: Joi.string().valid("ITR-1","ITR-2","ITR-3","ITR-4","ITR-5","ITR-6").required(),
    income: Joi.object({
        salary: Joi.number().default(0),
        business: Joi.number().default(0),
        capitalGains: Joi.number().default(0),
        other: Joi.number().default(0)
    }).optional(),
    deductions: Joi.object({
        section80C: Joi.number().default(0),
        section80D: Joi.number().default(0),
        hra: Joi.number().default(0),
        other: Joi.number().default(0)
    }).optional(),
    status: Joi.string().valid("draft","review","filed","acknowledged").optional()
})

const gstValidation = Joi.object({
    clientId: Joi.string().required(),
    gstNumber: Joi.string().required(),
    returnType: Joi.string().valid("GSTR-1","GSTR-3B","GSTR-9","GSTR-9C").required(),
    period: Joi.string().required(),
    status: Joi.string().valid("draft","filed","nil").optional()
})

const auditValidation = Joi.object({
    clientId: Joi.string().required(),
    financialYear: Joi.string().required(),
    auditType: Joi.string().valid("internal","external","tax").required(),
    observations: Joi.string().optional(),
    status: Joi.string().valid("draft","inprogress","completed").optional()
})

module.exports = { taxValidation, gstValidation, auditValidation }