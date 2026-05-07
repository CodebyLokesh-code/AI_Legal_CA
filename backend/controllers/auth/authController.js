const User = require("../../models/userModel")
const Otp = require("../../models/otpModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { successResponse, errorResponse } = require("../../utils/responseHandler")
const { sendOtpEmail } = require("../../services/email/emailService")
const generateOtp = require("../../utils/generateOtp")
// SIGNUP
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role, phoneNumber } = req.body

        // basic validation
        if (!name || !email || !password || !role) {
            return errorResponse(res, "All fields are required", 400)
        }

        // check user exists
        const existUser = await User.findOne({ email })
        if (existUser) {
            return errorResponse(res, "User already exists", 400)
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            phoneNumber
        })

        const otp = generateOtp()
        await Otp.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        })
        await sendOtpEmail(email,otp)
        // remove password from response
        user.password = undefined
        return successResponse(res, "Sent OTP", user, 201)

    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}


// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        // validation
        if (!email || !password) {
            return errorResponse(res, "Email and password are required", 400)
        }

        // find user + password
        const user = await User.findOne({ email }).select("+password")

        if (!user) {
            return errorResponse(res, "Invalid credentials", 400)
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return errorResponse(res, "Invalid credentials", 400)
        }

        if(!user.isVerified){
            return errorResponse(res, "Pehle email verify karo!", 400)
        }

        // generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        return successResponse(res, "Login successful", { token }, 200)

    } catch (error) {
        return errorResponse(res, error.message, 500)
    }
}

exports.verifyOtp = async (req,res) => {
    try {
        const {email , otp} = req.body

        const otpRecord = await Otp.findOne({email,otp})
        if(!otpRecord){
            return errorResponse(res,"Invlid OTP",400)
        }
        if(otpRecord.expiresAt < new Date()){
            return errorResponse(res,"OTP expired!",400)
        }

        await User.findOneAndUpdate(
            {email},
            {isVerified:true}
        )
        await Otp.deleteOne({email})
        return successResponse(res, "Email verified!",null,200)
    } catch (error) {
        return errorResponse(res,error.message,500)
    }
}