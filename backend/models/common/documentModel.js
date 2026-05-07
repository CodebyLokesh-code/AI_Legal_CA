const mongoose = require("mongoose")
const documentModel = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    clientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client"
    },
    fileName:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    size:{
        type:Number
    },
    mimeType:{
        type:String
    },
    relatedTo:{
        type:String,
        enum:["tax" , "gst" , "case" , "draft" , "general"]
    },relatedId:{
    type: mongoose.Schema.Types.ObjectId
}

},{timestamps:true})

const Document = mongoose.model("Document" , documentModel)
module.exports = Document