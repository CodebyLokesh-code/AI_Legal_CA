const mongoose = require("mongoose")
const caseModel = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    clientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client"
    },
    caseNumber:{
        type:String,
        required:true  
    },
    caseTitle:{
        type:String,
        required:true
    },
    court:{
        type:String,
        required:true
    },
    caseType:{
        type:String,
        enum:["civil" , "criminal" , "family" , "corporate" , "tax" , "other"]
    },
    status:{
        type:String,
        enum:["active" , "closed" , "adjourned" , "won" , "lost" , "settled"],
        default:"active"
    },
    hearings:[{
        date:Date,
        notes:String,
        nextDate:Date
    }],
    opposingParty:{
        type:String,   
    },
    opposingLawyer:{
        type:String
    },
    fillingDate:{
        type:Date
    }
},{timestamps:true})

const Case = mongoose.model("Case" , caseModel)
module.exports = Case