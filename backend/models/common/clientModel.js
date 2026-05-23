const clientModel = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firmId:    { type: mongoose.Schema.Types.ObjectId, ref: "Firm", default: null },
    name:      { type: String, required: true, trim: true },
    email:     { type: String, lowercase: true },
    phone:     { type: Number, required: true },
    address:   { type: String },
    panNumber: { type: String, trim: true, uppercase: true },
    type:      { type: String, enum: ["individual", "company", "trust"], default: "individual" },
    gstNumber: { type: String, trim: true, uppercase: true },
    notes:     { type: String, trim: true },
}, { timestamps: true })

clientModel.index({ userId: 1, createdAt: -1 })
clientModel.index({ userId: 1, phone: 1 })
clientModel.index({ userId: 1, panNumber: 1 }, { sparse: true })
clientModel.index({ userId: 1, gstNumber: 1 }, { sparse: true })
clientModel.index({ name: "text", panNumber: "text", gstNumber: "text" })  // search
clientModel.index({ firmId: 1 }, { sparse: true })

module.exports = mongoose.model("Client", clientModel)