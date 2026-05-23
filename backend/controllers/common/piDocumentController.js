// PageIndex Document Controller
// Kaam: HTTP requests handle karna — upload, query, list
//
// Routes:
//   POST /api/v1/pi-documents/upload  → PDF upload + process
//   POST /api/v1/pi-documents/query   → Document se question
//   GET  /api/v1/pi-documents         → Documents list

const multer = require("multer")
const pageIndex = require("../../services/pageindex")
const { successResponse, errorResponse } = require("../../utils/responseHandler")

// ── Multer Setup ──
// memory storage = file disk pe save nahi hoti
// upload.any() = koi bhi field name se file accept karo
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true)
        } else {
            cb(new Error("Sirf PDF files allowed hain"), false)
        }
    }
})

// ── Upload Middleware ──
// upload.any() — koi bhi field name se file aaye, accept karo
const uploadMiddleware = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: err.message
            })
        }
        next()
    })
}

// ── Upload Document ──
const uploadDocument = async (req, res) => {
    console.log("FILES:", req.files)
    console.log("BODY:", req.body)
    try {

        // req.files[0] — pehli file lo (koi bhi field name se aayi ho)
        const file = req.files?.[0]

        if (!file) {
            return errorResponse(res, "PDF file required hai", 400)
        }

        const { clientId, caseId, documentType } = req.body

        if (!clientId) {
            return errorResponse(res, "clientId required hai", 400)
        }

        if (!caseId) {
            return errorResponse(res, "caseId required hai", 400)
        }

        const userId = req.user?._id

        console.log(`[piDocController] Upload: ${file.originalname} by ${userId}`)

        // PageIndex module ko bhejo
        const result = await pageIndex.processDocument({
            buffer: file.buffer,
            fileName: file.originalname,
            userId: userId.toString(),
            clientId,
            caseId,
            documentType: documentType || "other"
        })

        if (!result.success) {
            return errorResponse(res, result.error, 422)
        }

        return successResponse(res, "Document upload ho gaya!", {
            documentId: result.documentId,
            totalPages: result.totalPages,
            treeNodes: result.treeNodes
        }, 201)

    } catch (err) {
        console.error("[piDocController] Upload error:", err.message)
        return errorResponse(res, err.message, 500)
    }
}

// ── Query Document ──
const queryDocument = async (req, res) => {
    try {

        const { documentId, query } = req.body
        const userId = req.user?._id

        if (!documentId) {
            return errorResponse(res, "documentId required hai", 400)
        }

        if (!query || !query.trim()) {
            return errorResponse(res, "Query required hai", 400)
        }

        const result = await pageIndex.query({
            documentId,
            query: query.trim(),
            userId: userId.toString()
        })

        if (!result.success) {
            return errorResponse(res, result.answer, 422)
        }

        return successResponse(res, "Answer ready", {
            answer: result.answer,
            nodesUsed: result.nodesUsed || []
        }, 200)

    } catch (err) {
        console.error("[piDocController] Query error:", err.message)
        return errorResponse(res, err.message, 500)
    }
}

// ── Get Documents ──
const getDocuments = async (req, res) => {
    try {

        const userId = req.user?._id
        const { clientId, caseId } = req.query

        const result = await pageIndex.getDocuments({
            userId: userId.toString(),
            clientId,
            caseId
        })

        return successResponse(res, "Documents fetched", result.documents, 200)

    } catch (err) {
        console.error("[piDocController] Get error:", err.message)
        return errorResponse(res, err.message, 500)
    }
}

module.exports = {
    uploadMiddleware,
    uploadDocument,
    queryDocument,
    getDocuments
}