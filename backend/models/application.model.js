const mongoose = require("mongoose")

const applicationSchema = mongoose.Schema(
    {
        // ─── Relationships ────────────────────────────
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // ─── Application Details ──────────────────────
        coverLetter: {
            type: String,
            trim: true,
            maxlength: [2000, "Cover letter cannot be more than 2000 characters"],
        },

        // ─── Status (company updates this) ────────────
        status: {
            type: String,
            enum: ["pending", "reviewing", "accepted", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true,   // adds createdAt and updatedAt automatically
    }
)

// one candidate can only apply to a job once
// this is what triggers the err.code === 11000 branch in handleError
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true })

const Application = mongoose.model("Application", applicationSchema)

module.exports = Application