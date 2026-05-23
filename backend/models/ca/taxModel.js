const taxModel = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    firmId:        { type: mongoose.Schema.Types.ObjectId, ref: "Firm", default: null },
    clientId:      { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    financialYear: { type: String, required: true },
    itrType:       { type: String, required: true, enum: ["ITR-1","ITR-2","ITR-3","ITR-4","ITR-5","ITR-6"] },
    income:        { salary: {type: Number, default: 0}, business: {type: Number, default: 0},
                     capitalGains: {type: Number, default: 0}, other: {type: Number, default: 0} },
    deductions:    { section80C: {type: Number, default: 0}, section80D: {type: Number, default: 0},
                     hra: {type: Number, default: 0}, other: {type: Number, default: 0} },
    taxPayable:        { type: Number },
    taxPaid:           { type: Number },
    status:            { type: String, enum: ["draft","review","filed","acknowledged"], default: "draft" },
    acknowledgementNo: { type: String },
    filedAt:           { type: Date },
}, { timestamps: true })

taxModel.index({ userId: 1, financialYear: 1 })
taxModel.index({ userId: 1, clientId: 1, financialYear: 1 })
taxModel.index({ userId: 1, status: 1, createdAt: -1 })

module.exports = mongoose.model("Tax", taxModel)