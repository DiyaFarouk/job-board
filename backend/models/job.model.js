const mongoose = require("mongoose")
const jobSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "Job description is required"],
        },

        requirements: {
            type: String,
        },

        responsibilities: {
            type: String,
        },

        // ✅ mongoose.Schema.Types.ObjectId instead of Schema.Types.ObjectId
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },

        location: {
            type: String,
            trim: true,
        },

        type: {
            type: String,
            enum: ["full-time", "part-time", "remote", "contract", "internship"],
            required: [true, "Job type is required"],
        },

        category: {
            type: String,
            trim: true,
        },

        experienceLevel: {
            type: String,
            enum: ["entry", "mid", "senior", "lead"],
        },

        skills: {
            type: [String],
            default: [],
        },

        salary: {
            min: {
                type: Number,
                default: 0,
            },
            max: {
                type: Number,
                default: 0,
            },
            currency: {
                type: String,
                default: "NGN",
            },
            isNegotiable: {
                type: Boolean,
                default: false,
            },
        },

        isOpen: {
            type: Boolean,
            default: true,
        },

        deadline: {
            type: Date,
        },

        applicationCount: {
            type: Number,
            default: 0,
        },

        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

const Job = mongoose.model("Job", jobSchema)

module.exports = Job