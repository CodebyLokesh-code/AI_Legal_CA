const otpModel = new mongoose.Schema({
    email:     { type: String, required: true },
    otp:       { type: String, required: true },
    expiresAt: { type: Date,   required: true },
    isUsed:    { type: Boolean, default: false },
}, { timestamps: true })

// TTL index — Mongo apne aap expired OTP delete kar dega
otpModel.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
otpModel.index({ email: 1, otp: 1 })

module.exports = mongoose.model("otp", otpModel)