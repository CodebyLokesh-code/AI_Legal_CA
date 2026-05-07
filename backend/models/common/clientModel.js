const mongoose = require("mongoose");

const clientModel = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        lowercase:true 
    },
    phone:{
        type:Number,
        required:true
    },
    address:{
        type:String,

    },
    panNumber:{
        type:String,
        trim:true
    },
    type:{
        type:String,
        enum:["individual" , "company" , "trust"],
        default: "individual"
    },
    gstNumber:{
        type:String,
        trim:true
    },
    notes:{
        type:String,
        trim:true
    },
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
}
},{timestamps:true}) 

const Client = mongoose.model("Client" , clientModel)
module.exports = Client