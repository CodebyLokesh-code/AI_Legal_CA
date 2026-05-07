const mongoose = require("mongoose");
const gstModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    gstNumber: {
      type: String,
      required: true,
    },
    returnType: {
      type: String,
      required: true,
      enum: ["GSTR-1", "GSTR-3B", "GSTR-9", "GSTR-9C"],
    },
    period:{
        type:String,
        required:true
    },
    totalTaxableValue:{
        type:Number,
        default:0
    },
    cgst:{
        type:Number,
        default:0
    },
    sgst:{
        type:Number,
        default:0
    },
    igst:{
        type:Number,
        default:0
    },
    totalTax:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:["draft", "filed", "nil"],
        default:"draft"
    },
    filedAt:{
        type:Date
    }
  },
  { timestamps: true },
);

const Gst = mongoose.model("Gst", gstModel);
module.exports = Gst;
