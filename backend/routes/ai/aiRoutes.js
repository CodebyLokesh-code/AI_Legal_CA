const express = require("express")
const router = express.Router()
const authMiddleware = require("../../middlewares/authMiddleware")
const { chat } = require("../../controllers/ai/aiController")

router.use(authMiddleware)

router.post("/chat", chat)

module.exports = router