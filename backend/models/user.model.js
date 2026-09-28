const mongoose = require("mongoose")
const userSchema = mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed with bcrypt
    role: { type: String, enum: ['candidate', 'company', 'admin'],
    default: 'candidate' },
    avatar: String, // Cloudinary URL
    cv: String, // Cloudinary URL
    skills: [String],
    phone: String,
 
},{timestamps:true})

const User =mongoose.model("User",userSchema)

module.exports=User