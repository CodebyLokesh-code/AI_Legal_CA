
const mongoose = require("mongoose")

const UserModel = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    },
    phoneNumber:{
        type:Number,
        required:true
        
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        select:false

    },
    role:{
        type:String,
        required:true,
        enum:["ca" , "lawyer" , "hybrid"]

    },
    firmName:{
        type:String,
        trim:true
    },
    address:{
        type: String,
    trim: true
    },
    icaiNumber:{
        type: String,
    trim: true
    },
    barNumber:{
        type: String,
    trim: true
    },
    isVerified:{
        type: Boolean,
    default: false
    },
    isActive:{
        type: Boolean,
    default: true
    },
    plan:{
        type:String,
        enum:["free" , "basic" , "pro"],
        default:"free"
    }


},{timestamps:true})

const User = mongoose.model("User",UserModel)
module.exports = User