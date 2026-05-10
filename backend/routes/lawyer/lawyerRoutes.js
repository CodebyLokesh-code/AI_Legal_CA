const express = require("express")
const router = express.Router()
const authMiddleware = require("../../middlewares/authMiddleware")
const roleMiddleware = require("../../middlewares/roleMiddleware")

const { addCase, getCases, getCase,
        updateCase, deleteCase, addHearing } = require("../../controllers/lawyer/caseController")
const { addDraft, getDrafts, getDraft,
        updateDraft, deleteDraft } = require("../../controllers/lawyer/draftController")

router.use(authMiddleware)
router.use(roleMiddleware("lawyer", "hybrid"))

// Case routes
router.post("/cases", addCase)
router.get("/cases", getCases)
router.get("/cases/:id", getCase)
router.patch("/cases/:id", updateCase)
router.delete("/cases/:id", deleteCase)
router.post("/cases/:id/hearing", addHearing) // Hearing add karna

// Draft routes
router.post("/drafts", addDraft)
router.get("/drafts", getDrafts)
router.get("/drafts/:id", getDraft)
router.patch("/drafts/:id", updateDraft)
router.delete("/drafts/:id", deleteDraft)

module.exports = router