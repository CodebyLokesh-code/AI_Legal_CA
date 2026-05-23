const subscriptionModel = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    plan:          { type: String, enum: ["free", "basic", "pro"], required: true },
    startDate:     { type: Date, required: true },
    endDate:       { type: Date, required: true },
    isActive:      { type: Boolean, default: true },
    amount:        { type: Number, required: true },
    paymentStatus: { type: String, enum: ["paid", "pending", "failed"], default: "pending" },
}, { timestamps: true })

subscriptionModel.index({ userId: 1, isActive: 1 })
subscriptionModel.index({ endDate: 1 })

module.exports = mongoose.model("Subscription", subscriptionModel)