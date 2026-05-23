const caseModel = new mongoose.Schema({
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    firmId:         { type: mongoose.Schema.Types.ObjectId, ref: "Firm", default: null },
    clientId:       { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    caseNumber:     { type: String, required: true },
    caseTitle:      { type: String, required: true },
    court:          { type: String, required: true },
    caseType:       { type: String, enum: ["civil","criminal","family","corporate","tax","other"] },
    status:         { type: String, enum: ["active","closed","adjourned","won","lost","settled"], default: "active" },
    hearings: [{ date: Date, notes: String, nextDate: Date }],
    opposingParty:  { type: String },
    opposingLawyer: { type: String },
    fillingDate:    { type: Date },
}, { timestamps: true })

caseModel.index({ userId: 1, status: 1, createdAt: -1 })
caseModel.index({ userId: 1, clientId: 1 })
caseModel.index({ caseNumber: 1, userId: 1 }, { unique: true })
caseModel.index({ userId: 1, "hearings.nextDate": 1 })  // upcoming hearings query

module.exports = mongoose.model("Case", caseModel)