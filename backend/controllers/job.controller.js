// Assumes these models exist:
//   job.model.js          -> Job
//   company.model.js      -> Company      (has owner, isVerified)
//   application.model.js  -> Application  (has job, candidate, coverLetter, status)
const Job = require("../models/job.model.js")
const Company = require("../models/company.model.js")
const Application = require("../models/application.model.js")

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

// one place that turns errors into sensible responses
const handleError = (res, err) => {
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message)
        return res.status(400).json({ message: messages.join(", ") })
    }
    if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid id" })
    }
    if (err.code === 11000) {
        return res.status(400).json({ message: "You have already applied to this job" })
    }
    return res.status(500).json({ message: err.message })
}

// stops characters like ( or * in a search from breaking the regex
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// is the logged in user the one who posted this job?
const isOwner = (job, user) => job.postedBy.toString() === user.id

// ─────────────────────────────────────────
// PUBLIC FUNCTIONS — no login needed
// ─────────────────────────────────────────

const getAllJobs = async (req, res) => {
    try {
        const { category, location, search, type, experienceLevel } = req.query
        const filter = { isOpen: true }

        if (category)        filter.category = category
        if (location)        filter.location = location
        if (type)            filter.type = type
        if (experienceLevel) filter.experienceLevel = experienceLevel
        if (search)          filter.title = { $regex: escapeRegex(String(search)), $options: "i" }

        const jobs = await Job.find(filter)
            .populate("postedBy", "name email")
            .populate("company", "name logo location")
            .sort({ createdAt: -1 })

        return res.status(200).json({ jobs })
    } catch (err) {
        return handleError(res, err)
    }
}

// also handles incrementViewCount — the view is counted and the job fetched in one query
const getJobsById = async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true, timestamps: false }   // new: true returns the updated job
        )
            .populate("postedBy", "name email")
            .populate("company", "name logo location website")

        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }

        return res.status(200).json({ job })
    } catch (err) {
        return handleError(res, err)
    }
}

const getJobsByCategory = async (req, res) => {
    try {
        const { category } = req.params

        // exact match but case insensitive, so /category/tech finds "Tech"
        const jobs = await Job.find({
            category: { $regex: `^${escapeRegex(category)}$`, $options: "i" },
            isOpen: true
        })
            .populate("postedBy", "name email")
            .populate("company", "name logo")
            .sort({ createdAt: -1 })

        // an empty array is fine — the category just has no jobs yet
        return res.status(200).json({ jobs })
    } catch (err) {
        return handleError(res, err)
    }
}

const searchJobs = async (req, res) => {
    try {
        const { keyword } = req.query

        if (typeof keyword !== "string" || !keyword.trim()) {
            return res.status(400).json({ message: "Search keyword is required" })
        }

        const pattern = escapeRegex(keyword.trim())

        const jobs = await Job.find({
            isOpen: true,
            $or: [
                { title: { $regex: pattern, $options: "i" } },
                { description: { $regex: pattern, $options: "i" } },
                { skills: { $regex: pattern, $options: "i" } }
            ]
        })
            .populate("postedBy", "name email")
            .populate("company", "name logo")
            .sort({ createdAt: -1 })

        return res.status(200).json({ jobs })
    } catch (err) {
        return handleError(res, err)
    }
}

// ─────────────────────────────────────────
// COMPANY FUNCTIONS — login + company role
// ─────────────────────────────────────────

const createJob = async (req, res) => {
    try {
        const {
            title, description, requirements, responsibilities, location,
            type, category, experienceLevel, skills, salary, deadline
        } = req.body

        // a user is linked to a company through Company.owner
        const company = await Company.findOne({ owner: req.user.id })
        if (!company) {
            return res.status(400).json({ message: "Create a company profile before posting jobs" })
        }
        // comment this check out while testing if you have no admin account yet
        if (!company.isVerified) {
            return res.status(403).json({ message: "Your company is awaiting admin verification" })
        }

        if (salary?.max && salary.min > salary.max) {
            return res.status(400).json({ message: "Minimum salary cannot be greater than maximum salary" })
        }
        if (deadline && new Date(deadline) < new Date()) {
            return res.status(400).json({ message: "Deadline must be in the future" })
        }

        const job = await Job.create({
            title, description, requirements, responsibilities, location,
            type, category, experienceLevel, skills, salary, deadline,
            postedBy: req.user.id,
            company: company._id
        })

        return res.status(201).json({ message: "Job created successfully", job })
    } catch (err) {
        return handleError(res, err)
    }
}

const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }
        if (!isOwner(job, req.user)) {
            return res.status(403).json({ message: "You are not authorized to update this job" })
        }

        // only these fields can change — stops someone overwriting postedBy, views, etc.
        const allowedFields = [
            "title", "description", "requirements", "responsibilities", "location",
            "type", "category", "experienceLevel", "skills", "salary", "deadline"
        ]
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) job[field] = req.body[field]
        })

        await job.save()   // save() runs the schema validators (enums, required)

        return res.status(200).json({ message: "Job updated successfully", job })
    } catch (err) {
        return handleError(res, err)
    }
}

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }
        if (!isOwner(job, req.user)) {
            return res.status(403).json({ message: "You are not authorized to delete this job" })
        }

        await Application.deleteMany({ job: job._id })   // no orphaned applications
        await job.deleteOne()

        return res.status(200).json({ message: "Job deleted successfully" })
    } catch (err) {
        return handleError(res, err)
    }
}

// closeJob — set isOpen to false without deleting
const closeJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }
        if (!isOwner(job, req.user)) {
            return res.status(403).json({ message: "You are not authorized to close this job" })
        }

        job.isOpen = false
        await job.save()

        return res.status(200).json({ message: "Job closed successfully", job })
    } catch (err) {
        return handleError(res, err)
    }
}

// reopenJob — set isOpen back to true
const reopenJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }
        if (!isOwner(job, req.user)) {
            return res.status(403).json({ message: "You are not authorized to reopen this job" })
        }
        // otherwise closeExpiredJobs would just close it again
        if (job.deadline && job.deadline < new Date()) {
            return res.status(400).json({ message: "Deadline has passed — update the deadline before reopening" })
        }

        job.isOpen = true
        await job.save()

        return res.status(200).json({ message: "Job reopened successfully", job })
    } catch (err) {
        return handleError(res, err)
    }
}

// getMyJobs — all jobs posted by the logged in company, open and closed
const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id })
            .populate("company", "name logo location")
            .sort({ createdAt: -1 })

        return res.status(200).json({ jobs })
    } catch (err) {
        return handleError(res, err)
    }
}

// getJobApplicants — everyone who applied to one of my jobs
const getJobApplicants = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }
        if (!isOwner(job, req.user)) {
            return res.status(403).json({ message: "You are not authorized to view applicants for this job" })
        }

        const applications = await Application.find({ job: job._id })
            .populate("candidate", "name email phone skills cv")
            .sort({ createdAt: -1 })

        return res.status(200).json({ applications })
    } catch (err) {
        return handleError(res, err)
    }
}

// ─────────────────────────────────────────
// CANDIDATE FUNCTIONS — login + candidate role
// ─────────────────────────────────────────

// applyToJob — apply with an optional cover letter
const applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }
        if (!job.isOpen) {
            return res.status(400).json({ message: "This job is no longer accepting applications" })
        }
        if (job.deadline && job.deadline < new Date()) {
            return res.status(400).json({ message: "The application deadline has passed" })
        }

        const alreadyApplied = await Application.findOne({
            job: job._id,
            candidate: req.user.id
        })
        if (alreadyApplied) {
            return res.status(400).json({ message: "You have already applied to this job" })
        }

        const application = await Application.create({
            job: job._id,
            candidate: req.user.id,
            coverLetter: req.body.coverLetter
        })

        await Job.findByIdAndUpdate(job._id, { $inc: { applicationCount: 1 } })

        return res.status(201).json({ message: "Application submitted successfully", application })
    } catch (err) {
        return handleError(res, err)
    }
}

// getMyApplications — every application the logged in candidate has made
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ candidate: req.user.id })
            .populate({
                path: "job",
                select: "title location type salary isOpen company",
                populate: { path: "company", select: "name logo" }
            })
            .sort({ createdAt: -1 })

        return res.status(200).json({ applications })
    } catch (err) {
        return handleError(res, err)
    }
}

// withdrawApplication — req.params.id is the JOB id
const withdrawApplication = async (req, res) => {
    try {
        // filtering by candidate means you can only ever delete your own application
        const application = await Application.findOneAndDelete({
            job: req.params.id,
            candidate: req.user.id
        })
        if (!application) {
            return res.status(404).json({ message: "You have not applied to this job" })
        }

        await Job.findByIdAndUpdate(req.params.id, { $inc: { applicationCount: -1 } })

        return res.status(200).json({ message: "Application withdrawn successfully" })
    } catch (err) {
        return handleError(res, err)
    }
}

// ─────────────────────────────────────────
// ADMIN FUNCTIONS — admin role only
// ─────────────────────────────────────────

// getAllJobsAdmin — every job, including closed ones
const getAllJobsAdmin = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate("postedBy", "name email")
            .populate("company", "name logo location")
            .sort({ createdAt: -1 })

        return res.status(200).json({ jobs })
    } catch (err) {
        return handleError(res, err)
    }
}

// deleteJobAdmin — force delete any job
const deleteJobAdmin = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }

        await Application.deleteMany({ job: job._id })
        await job.deleteOne()   // job.remove() no longer exists in Mongoose 7+

        return res.status(200).json({ message: "Job deleted successfully" })
    } catch (err) {
        return handleError(res, err)
    }
}

// closeJobAdmin — close any job regardless of owner
const closeJobAdmin = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) {
            return res.status(404).json({ message: "Job not found" })
        }

        job.isOpen = false
        await job.save()

        return res.status(200).json({ message: "Job closed successfully", job })
    } catch (err) {
        return handleError(res, err)
    }
}

// ─────────────────────────────────────────
// UTILITY — not a route handler, called on a schedule
// ─────────────────────────────────────────

// closeExpiredJobs — closes every open job whose deadline has passed
const closeExpiredJobs = async () => {
    try {
        const result = await Job.updateMany(
            { isOpen: true, deadline: { $lt: new Date() } },
            { isOpen: false }
        )
        if (result.modifiedCount > 0) {
            console.log(`Closed ${result.modifiedCount} expired job(s)`)
        }
    } catch (err) {
        console.log("Error closing expired jobs:", err.message)
    }
}

module.exports = {
    // public
    getAllJobs,
    getJobsById,
    getJobsByCategory,
    searchJobs,
    // company
    createJob,
    updateJob,
    deleteJob,
    closeJob,
    reopenJob,
    getMyJobs,
    getJobApplicants,
    // candidate
    applyToJob,
    getMyApplications,
    withdrawApplication,
    // admin
    getAllJobsAdmin,
    deleteJobAdmin,
    closeJobAdmin,
    // utility
    closeExpiredJobs
}

