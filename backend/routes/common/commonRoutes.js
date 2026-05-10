const express = require("express")
const router = express.Router()
const upload = require("../../middlewares/uploadMiddleware")
const authMiddleware = require("../../middlewares/authMiddleware")
const roleMiddleware = require("../../middlewares/roleMiddleware")
const { addClient, getClients, getClient,  updateClient, deleteClient } = require("../../controllers/common/clientController")
const { addInvoice, getInvoices, getInvoice, updateInvoice, deleteInvoice } = require("../../controllers/common/invoiceController")
const { uploadDocument, getDocuments, getDocument, deleteDocument } = require("../../controllers/common/documentController")


router.use(authMiddleware)
router.use(roleMiddleware("ca", "lawyer", "hybrid"))



router.post("/clients", addClient)
router.get("/clients", getClients)
router.get("/clients/:id", getClient)
router.patch("/clients/:id", updateClient)
router.delete("/clients/:id", deleteClient)

// Invoice Routes
router.post("/invoices", addInvoice)
router.get("/invoices", getInvoices)
router.get("/invoices/:id", getInvoice)
router.patch("/invoices/:id", updateInvoice)
router.delete("/invoices/:id", deleteInvoice)

// Document Routes
router.post("/documents/upload", 
    upload.single("file"),  //  Multer middleware
    uploadDocument
)
router.get("/documents", getDocuments)
router.get("/documents/:id", getDocument)
router.delete("/documents/:id", deleteDocument)
module.exports = router