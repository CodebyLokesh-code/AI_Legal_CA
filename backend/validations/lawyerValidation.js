const Joi = require("joi")

const caseValidation = Joi.object({
    clientId: Joi.string().required(),
    caseNumber: Joi.string().required(),
    caseTitle: Joi.string().required(),
    court: Joi.string().required(),
    caseType: Joi.string().valid(
        "civil","criminal","family",
        "corporate","tax","other"
    ).optional(),
    status: Joi.string().valid(
        "active","closed","adjourned",
        "won","lost","settled"
    ).optional(),
    opposingParty: Joi.string().optional(),
    opposingLawyer: Joi.string().optional(),
    filingDate: Joi.date().optional()
})

const hearingValidation = Joi.object({
    date: Joi.date().required(),
    notes: Joi.string().optional(),
    nextDate: Joi.date().optional()
})

const draftValidation = Joi.object({
    clientId: Joi.string().required(),
    caseId: Joi.string().optional(),
    title: Joi.string().required(),
    type: Joi.string().valid(
        "notice","agreement","petition",
        "affidavit","contract","other"
    ).required(),
    content: Joi.string().optional(),
    status: Joi.string().valid(
        "draft","final","sent"
    ).optional()
})

module.exports = { caseValidation, hearingValidation, draftValidation }