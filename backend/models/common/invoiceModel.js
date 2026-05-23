const invoiceModel = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    firmId:        { type: mongoose.Schema.Types.ObjectId, ref: "Firm", default: null },
    clientId:      { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    invoiceNumber: { type: String, required: true },
    items: [{
        discription: { type: String, required: true },  // typo as-is (existing data compat)
        amount:      { type: Number, required: true },
    }],
    subTotal: { type: Number, required: true },
    gst:      { type: Number, default: 0 },
    total:    { type: Number, required: true },
    status:   { type: String, enum: ["unpaid", "paid", "overdue", "cancelled"], default: "unpaid" },
    dueDate:  { type: Date, required: true },
    paidAt:   { type: Date },
}, { timestamps: true })

invoiceModel.index({ userId: 1, status: 1, createdAt: -1 })
invoiceModel.index({ userId: 1, clientId: 1 })
invoiceModel.index({ userId: 1, dueDate: 1 })
invoiceModel.index({ invoiceNumber: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model("Invoice", invoiceModel)