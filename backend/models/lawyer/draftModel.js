const mongoose = require("mongoose")
const draftModel = new mongoose.Schema({
    userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
    },
    clientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client"
    },
    caseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Case"
    },
    title:{
        type:String,
        required:true
    },
    type:{
        type:String,
        enum:["notice" , "agreement" , "petition" , "affidavit" , "contract" , "other"]
    },
    content:{
        type:String
    },
    isAIGenerated:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:["draft" , "final" , "sent" , ],
        default:"draft"
    }
},{timestamps:true})

const Draft = mongoose.model("Draft" , draftModel)
module.exports = Draft