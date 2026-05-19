const express = require("express")
const router = express.Router()
const authMiddleware = require("../../middlewares/authMiddleware")
const roleMiddleware = require("../../middlewares/roleMiddleware")
const validate = require("../../middlewares/validate")
const { taxValidation, gstValidation, auditValidation } = require("../../validations/caValidation")

const { addTax, getTaxes, getTax,
        updateTax, deleteTax } = require("../../controllers/ca/taxController")
const { addGST, getGSTs, getGST,
        updateGST, deleteGST } = require("../../controllers/ca/gstController")
const { addAudit, getAudits, getAudit,
        updateAudit, deleteAudit } = require("../../controllers/ca/auditController")

router.use(authMiddleware)
router.use(roleMiddleware("ca", "hybrid"))

// Tax
router.post("/tax", validate(taxValidation), addTax)
router.get("/tax", getTaxes)
router.get("/tax/:id", getTax)
router.patch("/tax/:id", updateTax)
router.delete("/tax/:id", deleteTax)

// GST
router.post("/gst", validate(gstValidation), addGST)
router.get("/gst", getGSTs)
router.get("/gst/:id", getGST)
router.patch("/gst/:id", updateGST)
router.delete("/gst/:id", deleteGST)

// Audit
router.post("/audit", validate(auditValidation), addAudit)
router.get("/audit", getAudits)
router.get("/audit/:id", getAudit)
router.patch("/audit/:id", updateAudit)
router.delete("/audit/:id", deleteAudit)

module.exports = router