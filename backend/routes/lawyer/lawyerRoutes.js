const express = require("express")
const router = express.Router()
const authMiddleware = require("../../middlewares/authMiddleware")
const roleMiddleware = require("../../middlewares/roleMiddleware")
const validate = require("../../middlewares/validate")
const { caseValidation, hearingValidation, draftValidation } = require("../../validations/lawyerValidation")

const { addCase, getCases, getCase,
        updateCase, deleteCase, addHearing } = require("../../controllers/lawyer/caseController")
const { addDraft, getDrafts, getDraft,
        updateDraft, deleteDraft } = require("../../controllers/lawyer/draftController")

router.use(authMiddleware)
router.use(roleMiddleware("lawyer", "hybrid"))

// Case routes
router.post("/cases", validate(caseValidation), addCase)
router.get("/cases", getCases)
router.get("/cases/:id", getCase)
router.patch("/cases/:id", updateCase)
router.delete("/cases/:id", deleteCase)
router.post("/cases/:id/hearing", validate(hearingValidation), addHearing)

// Draft routes
router.post("/drafts", validate(draftValidation), addDraft)
router.get("/drafts", getDrafts)
router.get("/drafts/:id", getDraft)
router.patch("/drafts/:id", updateDraft)
router.delete("/drafts/:id", deleteDraft)

module.exports = router