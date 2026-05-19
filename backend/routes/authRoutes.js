const express = require("express")
const router = express.Router()
const { signup, login, verifyOtp } = require("../controllers/auth/authController")
const validate = require("../middlewares/validate")
const { signupValidation, loginValidation, otpValidation } = require("../validations/authValidation")

router.post("/signup", validate(signupValidation), signup)
router.post("/verify-otp", validate(otpValidation), verifyOtp)
router.post("/login", validate(loginValidation), login)

module.exports = router