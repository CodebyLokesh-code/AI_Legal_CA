const auditModel = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    firmId:        { type: mongoose.Schema.Types.ObjectId, ref: "Firm", default: null },
    clientId:      { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    financialYear: { type: String, required: true },
    auditType:     { type: String, enum: ["internal", "external", "tax"] },
    observations:  { type: String },
    status:        { type: String, enum: ["draft","inprogress","completed"], default: "draft" },
    completedAt:   { type: Date },
}, { timestamps: true })

auditModel.index({ userId: 1, financialYear: 1 })
auditModel.index({ userId: 1, status: 1, createdAt: -1 })
auditModel.index({ userId: 1, clientId: 1 })

module.exports = mongoose.model("Audit", auditModel)