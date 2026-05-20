const express = require("express")
const router = express.Router()
const authMiddleware = require("../../middlewares/authMiddleware")
const { chat } = require("../../controllers/ai/aiController")
const roleMiddleware = require("../../middlewares/roleMiddleware")

router.use(authMiddleware)
// router.use(roleMiddleware("ca", "lawyer", "hybrid"))

router.post("/chat", chat)

module.exports = router