const mongoose = require("mongoose")

const UserModel = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true,
                   match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/ },
    phoneNumber: { type: Number, required: true },
    password:    { type: String, required: true, minlength: 6, select: false },
    role:        { type: String, required: true, enum: ["ca", "lawyer", "hybrid"] },
    firmName:    { type: String, trim: true },
    address:     { type: String, trim: true },
    icaiNumber:  { type: String, trim: true },
    barNumber:   { type: String, trim: true },
    isVerified:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    plan:        { type: String, enum: ["free", "basic", "pro"], default: "free" },

    // Phase 2 ready — multi-tenancy ke liye
    // firmId null = solo user (owner)
    // firmId set = team member of that firm
    firmId:      { type: mongoose.Schema.Types.ObjectId, ref: "Firm", default: null },
}, { timestamps: true })

// Indexes
UserModel.index({ email: 1 }, { unique: true })
UserModel.index({ role: 1, isActive: 1 })
UserModel.index({ firmId: 1 })

module.exports = mongoose.model("User", UserModel)