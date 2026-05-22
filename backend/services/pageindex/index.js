// PageIndex — Entry Point
// Kaam: Poore PageIndex module ka single entry point
//
// Baaki system sirf ye file import karta hai:
//   const pageIndex = require("./services/pageindex")
//
// 2 main functions:
//   processDocument() → PDF upload + tree build
//   query()           → question → answer

const mongoose = require("mongoose")
const { GridFSBucket } = require("mongodb")
const { extractPages } = require("./processor/pdfProcessor")
const { buildTree } = require("./builder/treeBuilder")
const { retrieveAnswer } = require("./retriever/treeRetriever")
const PiDocument = require("../../models/pageindex/piDocumentModel")

// ── Process Document ──
// Kaam: PDF → Extract → Tree → MongoDB + GridFS save
//
// Params:
//   buffer       → multer se aaya file buffer
//   fileName     → original file name
//   userId       → kaun upload kar raha hai
//   clientId     → kis client ka document
//   caseId       → kis case se linked
//   documentType → vakalatnama/court_order/fir etc
const processDocument = async ({
    buffer,
    fileName,
    userId,
    clientId,
    caseId,
    documentType = "other"
}) => {

    // Step 1: Document record banao — status "uploading"
    // Pehle record banao taaki user ko pata chale processing shuru hui
    const doc = await PiDocument.create({
        userId,
        clientId,
        caseId,
        fileName,
        gridFsId: new mongoose.Types.ObjectId(), // placeholder — baad mein update
        documentType,
        status: "uploading"
    })

    try {

        // Step 2: GridFS mein original PDF save karo
        console.log(`[pageIndex] Saving to GridFS: ${fileName}`)

        const bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: "documents"   // fs.files → documents.files
        })

        // Buffer ko GridFS mein upload karo
        // Promise banao kyunki GridFS stream-based hai
        const gridFsId = await new Promise((resolve, reject) => {

            // Upload stream open karo
            const uploadStream = bucket.openUploadStream(fileName, {
                metadata: { userId, clientId, caseId, documentType }
            })

            // Stream complete → GridFS ID return karo
            uploadStream.on("finish", () => resolve(uploadStream.id))
            uploadStream.on("error", reject)

            // Buffer likhke stream band karo
            uploadStream.end(buffer)
        })

        // GridFS ID update karo document mein
        await PiDocument.findByIdAndUpdate(doc._id, {
            gridFsId,
            status: "processing"
        })

        console.log(`[pageIndex] GridFS saved: ${gridFsId}`)

        // Step 3: PDF se pages extract karo
        console.log(`[pageIndex] Extracting pages...`)

        const extracted = await extractPages(buffer)

        if (!extracted.success) {
            // Extraction fail — status update karo
            await PiDocument.findByIdAndUpdate(doc._id, {
                status: "failed",
                errorMessage: extracted.error
            })

            return { success: false, error: extracted.error }
        }

        // Step 4: Tree build karo (LLM se)
        console.log(`[pageIndex] Building tree...`)

        const built = await buildTree(extracted.pages, documentType)

        if (!built.success) {
            await PiDocument.findByIdAndUpdate(doc._id, {
                status: "failed",
                errorMessage: built.error
            })

            return { success: false, error: built.error }
        }

        // Step 5: Sab MongoDB mein save karo
        await PiDocument.findByIdAndUpdate(doc._id, {
            pages: extracted.pages,
            tree: built.tree,
            totalPages: extracted.totalPages,
            fileSize: buffer.length,
            status: "ready"
        })

        console.log(`[pageIndex] Document ready: ${doc._id}`)

        return {
            success: true,
            documentId: doc._id,
            totalPages: extracted.totalPages,
            treeNodes: built.tree.nodes.length
        }

    } catch (err) {

        // Kuch bhi fail hua → status failed
        console.error("[pageIndex] processDocument failed:", err.message)

        await PiDocument.findByIdAndUpdate(doc._id, {
            status: "failed",
            errorMessage: err.message
        })

        return { success: false, error: err.message }
    }
}

// ── Query ──
// Kaam: User query → Answer from document
//
// Params:
//   documentId → kaunsa document
//   query      → user ka sawaal
//   userId     → security ke liye
const query = async ({ documentId, query, userId }) => {
    return await retrieveAnswer({ documentId, query, userId })
}

// ── Get Documents ──
// Kaam: Client/Case ke documents list karo
const getDocuments = async ({ userId, clientId, caseId }) => {

    const filter = { userId }

    if (clientId) filter.clientId = clientId
    if (caseId) filter.caseId = caseId

    const docs = await PiDocument.find(filter)
        .select("fileName documentType status totalPages createdAt")
        .lean()

    return { success: true, documents: docs }
}

module.exports = {
    processDocument,
    query,
    getDocuments
}