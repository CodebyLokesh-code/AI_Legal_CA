// PageIndex Document Model
// Kaam: PDF documents ka schema — PageIndex ke liye
//
// Ye model store karta hai:
//   - Original PDF ka reference (GridFS)
//   - Extracted text pages
//   - PageIndex tree (LLM generated)
//   - Document metadata
//
// Note: Ye colleague ke documentModel.js se ALAG hai
//       Wo file metadata ke liye, ye PageIndex ke liye

const mongoose = require("mongoose")

// ── Page Schema ──
// Har PDF page ka extracted text
// Nested schema — piDocument ke andar array hoga
const pageSchema = new mongoose.Schema({

    pageNo: {
        type: Number,
        required: true
    },

    content: {
        type: String,
        required: true    // extracted plain text
    }

}, { _id: false })       // _id nahi chahiye har page ke liye

// ── Tree Node Schema ──
// PageIndex tree ka ek node
// Recursive structure — nodes ke andar nodes ho sakte hain
const treeNodeSchema = new mongoose.Schema({

    nodeId: {
        type: String,
        required: true    // "0001", "0002" etc
    },

    title: {
        type: String,
        required: true    // "Party Details", "Fee Terms" etc
    },

    startPage: {
        type: Number,
        required: true    // kahan se shuru
    },

    endPage: {
        type: Number,
        required: true    // kahan khatam
    },

    summary: {
        type: String      // LLM generated short summary
    },

    // Child nodes — recursive
    // Python mein: List[TreeNode]
    nodes: {
        type: Array,
        default: []       // leaf node mein empty array
    }

}, { _id: false })

// ── Main Document Schema ──
const piDocumentSchema = new mongoose.Schema({

    // ── Security & Linking ──
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true      // fast query ke liye
    },

    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true,
        index: true
    },

    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: true,
        index: true
    },

    // ── File Info ──
    fileName: {
        type: String,
        required: true    // "vakalatnama.pdf"
    },

    // GridFS ID — original PDF yahan se milegi
    // GridFS = MongoDB ka built-in file storage
    gridFsId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    fileSize: {
        type: Number      // bytes mein
    },

    totalPages: {
        type: Number      // PDF mein kitne pages hain
    },

    // ── Document Classification ──
    documentType: {
        type: String,
        enum: [
            "vakalatnama",
            "court_order",
            "fir",
            "contract",
            "property_docs",
            "balance_sheet",
            "gst_certificate",
            "audit_report",
            "other"
        ],
        default: "other"
    },

    // ── PageIndex Data ──

    // Extracted text — har page ka content
    // pdf-parse ne nikala
    pages: {
        type: [pageSchema],
        default: []
    },

    // PageIndex tree — LLM ne banaya
    // {
    //   title: "Vakalatnama",
    //   nodes: [
    //     { nodeId: "0001", title: "Party Details", startPage: 1, endPage: 2, nodes: [] },
    //     { nodeId: "0002", title: "Fee Terms", startPage: 3, endPage: 5, nodes: [] }
    //   ]
    // }
    tree: {
        type: Object,
        default: null
    },

    // ── Processing Status ──
    // uploading → processing → ready
    //                        ↘ failed
    status: {
        type: String,
        enum: ["uploading", "processing", "ready", "failed"],
        default: "uploading"
    },

    // Agar failed ho to reason
    errorMessage: {
        type: String,
        default: null
    }

}, { timestamps: true })

// ── Indexes ──
// Composite index — ek user ke ek client ke documents fast dhundho
piDocumentSchema.index({ userId: 1, clientId: 1 })
piDocumentSchema.index({ userId: 1, caseId: 1 })

const PiDocument = mongoose.model("PiDocument", piDocumentSchema)
module.exports = PiDocument