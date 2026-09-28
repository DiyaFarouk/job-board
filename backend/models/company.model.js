//Company.model.js
const mongoose = require("mongoose")
const companySchema = mongoose.Schema({
owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
name: { type: String, required: true },
description: String,
logo: String,
website: String,
location: String,
industry: String,
isVerified: { type: Boolean, default: false },
}, { timestamps: true })

const Company = mongoose.model("Company",companySchema)
module.exports = Company