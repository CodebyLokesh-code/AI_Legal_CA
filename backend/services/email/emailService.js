const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.MAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendOtpEmail = async (email, otp) => {
    const mailOption = {
        from: process.env.MAIL_USER,
        to: email,
        subject:"Your OTP - AI Legal CA",
        text:`Your OTP is ${otp}. Vaild for 10 minutes`
    }
    await transporter.sendMail(mailOption)
}











module.exports = {sendOtpEmail}