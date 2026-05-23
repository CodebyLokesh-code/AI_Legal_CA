const documentModel = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    firmId:    { type: mongoose.Schema.Types.ObjectId, ref: "Firm", default: null },
    clientId:  { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    fileName:  { type: String, required: true },
    url:       { type: String, required: true },
    size:      { type: Number },
    mimeType:  { type: String },
    relatedTo: { type: String, enum: ["tax", "gst", "case", "draft", "general"] },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

documentModel.index({ userId: 1, createdAt: -1 })
documentModel.index({ userId: 1, clientId: 1 })
documentModel.index({ userId: 1, relatedTo: 1, relatedId: 1 })

module.exports = mongoose.model("Document", documentModel)