// applyToJob, withdrawApplication, getMyApplications and getJobApplicants
// live in job.controller.js because they are keyed by JOB id.
// This controller holds the functions keyed by APPLICATION id.
const Application = require("../models/application.model.js")

const allowedStatuses = ["pending", "reviewing", "accepted", "rejected"]

// one place that turns errors into sensible responses
const handleError = (res, err) => {
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message)
        return res.status(400).json({ message: messages.join(", ") })
    }
    if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid id" })
    }
    return res.status(500).json({ message: err.message })
}

// ─────────────────────────────────────────
// COMPANY FUNCTIONS — login + company role
// ─────────────────────────────────────────

// updateApplicationStatus — accept, reject or mark as reviewing
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${allowedStatuses.join(", ")}`
            })
        }

        // populate the job so we can see who posted it
        const application = await Application.findById(req.params.id)
            .populate("job", "postedBy title")

        if (!application || !application.job) {
            return res.status(404).json({ message: "Application not found" })
        }

        // only the company that posted the job can change its applications
        if (application.job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to update this application"
            })
        }

        application.status = status
        await application.save()

        return res.status(200).json({
            message: `Application ${status}`,
            application
        })
    } catch (err) {
        return handleError(res, err)
    }
}

// ─────────────────────────────────────────
// SHARED — candidate who applied, company that posted the job, or admin
// ─────────────────────────────────────────

// getApplicationById — one application in full
const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate("candidate", "name email phone skills cv")
            .populate({
                path: "job",
                select: "title postedBy company",
                populate: { path: "company", select: "name logo" }
            })

        if (!application || !application.job) {
            return res.status(404).json({ message: "Application not found" })
        }

        const isCandidate = application.candidate?.id === req.user.id
        const isJobOwner = application.job.postedBy.toString() === req.user.id
        const isAdmin = req.user.role === "admin"

        if (!isCandidate && !isJobOwner && !isAdmin) {
            return res.status(403).json({
                message: "You are not authorized to view this application"
            })
        }

        return res.status(200).json({ application })
    } catch (err) {
        return handleError(res, err)
    }
}

// ─────────────────────────────────────────
// ADMIN FUNCTIONS — admin role only
// ─────────────────────────────────────────

// getAllApplicationsAdmin — every application, optionally filtered by ?status=
const getAllApplicationsAdmin = async (req, res) => {
    try {
        const { status } = req.query
        const filter = {}

        if (status) filter.status = status

        const applications = await Application.find(filter)
            .populate("candidate", "name email")
            .populate("job", "title")
            .sort({ createdAt: -1 })

        return res.status(200).json({ applications })
    } catch (err) {
        return handleError(res, err)
    }
}

module.exports = {
    updateApplicationStatus,
    getApplicationById,
    getAllApplicationsAdmin
}