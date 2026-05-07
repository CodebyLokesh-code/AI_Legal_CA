const mongoose = require("mongoose")

const invoiceModel = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    clientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client"
    },
    invoiceNumber:{
        type:String,
        required:true
    },
    items:[{
        discription:{
            type:String,
            required:true
        },
        amount:{
            type:Number,
            required:true
        }
    }],
    subTotal:{
        type:Number,
        required:true
    },
    gst:{
        type:Number,
        default:0
    },
    total:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["unpaid" , "paid" , "overdue" , "cancelled"],
        default:"unpaid"
    },
    dueDate:{
        type:Date,
        required:true
    },
    paidAt:{
        type:Date
    }

},{timestamps:true})

const Invoice = mongoose.model("Invoice" ,invoiceModel);
module.exports = Invoice