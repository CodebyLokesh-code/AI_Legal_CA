// PageIndex Document Routes
// Base: /api/v1/pi-documents
//
// Routes:
//   POST /upload  → PDF upload + process
//   POST /query   → Document se question
//   GET  /        → Documents list

const express = require("express")
const router = express.Router()
const authMiddleware = require("../../middlewares/authMiddleware")
const roleMiddleware = require("../../middlewares/roleMiddleware")
const {
    uploadMiddleware,
    uploadDocument,
    queryDocument,
    getDocuments
} = require("../../controllers/common/piDocumentController")

// ── Auth + Role ──
// Sirf logged in CA, Lawyer, Hybrid access kar sakte hain
router.use(authMiddleware)
router.use(roleMiddleware("ca", "lawyer", "hybrid"))

// ── Upload Route ──
// uploadMiddleware = multer (PDF receive karo)
// uploadDocument   = PageIndex process karo
router.post("/upload", uploadMiddleware, uploadDocument)

// ── Query Route ──
// Document se sawaal karo
router.post("/query", queryDocument)

// ── List Route ──
// Client/Case ke documents list karo
router.get("/", getDocuments)

module.exports = router