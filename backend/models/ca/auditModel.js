const mongoose = require("mongoose")
const auditModel = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    clientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client"
    },
    financialYear:{
        type:String,
        required:true
    },
    auditType:{
        type:String,
        enum:["internal" , "external" , "tax"]
    },
    observations:{
        type:String
    },
    status:{
        type:String,
        enum:["draft" , "inprogress" , "completed"],
        default:"draft"
    },
    completedAt:{
        type:Date
    }
},{timestamps:true})

const Audit = mongoose.model("Audit" , auditModel)
module.exports = Audit