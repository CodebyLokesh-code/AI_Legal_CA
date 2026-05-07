const mongoose = require("mongoose");

const otpModel = new mongoose.Schema({

    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true
    },
    isUsed:{
        type:Boolean,
        default: false
    }
},{timestamps:true})

const otp = mongoose.model("otp",otpModel)
module.exports = otp 