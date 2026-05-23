const draftModel = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    firmId:        { type: mongoose.Schema.Types.ObjectId, ref: "Firm", default: null },
    clientId:      { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    caseId:        { type: mongoose.Schema.Types.ObjectId, ref: "Case" },
    title:         { type: String, required: true },
    type:          { type: String, enum: ["notice","agreement","petition","affidavit","contract","other"] },
    content:       { type: String },
    isAIGenerated: { type: Boolean, default: false },
    status:        { type: String, enum: ["draft","final","sent"], default: "draft" },
}, { timestamps: true })

draftModel.index({ userId: 1, status: 1, createdAt: -1 })
draftModel.index({ userId: 1, caseId: 1 })
draftModel.index({ userId: 1, clientId: 1 })

module.exports = mongoose.model("Draft", draftModel)
