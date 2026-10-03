// Public Functions — no login needed
// getAllJobs — get all open jobs with optional filters (category, location, type, search, experienceLevel)
// getJobById — get a single job by id and increase its view count
// getJobsByCategory — get all jobs in a specific category
// searchJobs — search jobs by keyword in title or description
// Company Functions — login + company role
// createJob — create a new job listing
// updateJob — update an existing job
// deleteJob — delete a job and its applications
// closeJob — set isOpen to false without deleting
// reopenJob — set isOpen back to true
// getMyJobs — get all jobs posted by the logged in company
// getJobApplicants — get all candidates who applied to a specific job
// Candidate Functions — login + candidate role
// applyToJob — apply to a job with optional cover letter
// getMyApplications — get all jobs the logged in candidate applied to
// withdrawApplication — cancel an application
// Admin Functions — admin role only
// getAllJobsAdmin — get ALL jobs including closed ones
// deleteJobAdmin — admin force deletes any job
// closeJobAdmin — admin closes any job regardless of owner
// Utility Functions — called internally not from routes
// closeExpiredJobs — finds all jobs past their deadline and sets isOpen to false — run this on a schedule or call it inside getAllJobs
// incrementViewCount — increases the views field by 1 — called inside getJobById
// The order to write them:
// Public first    → getAllJobs, getJobById
// Company next    → createJob, updateJob, deleteJob
// Candidate next  → applyToJob, getMyApplications
// Admin last      → getAllJobsAdmin, deleteJobAdmin

const Job = require("../models/job.model.js")

const getAllJobs = async (req, res) => {
    try {
        const { category, location, search, type, experienceLevel } = req.query
        const filter = { isOpen: true }

        if (category)        filter.category = category
        if (location)        filter.location = location
        if (type)            filter.type = type
        if (experienceLevel) filter.experienceLevel = experienceLevel
        if (search)          filter.title = { $regex: search, $options: "i" }

        const jobs = await Job.find(filter)
            .populate("postedBy", "name email")
            .populate("company", "name logo location")
            .sort({ createdAt: -1 })

        return res.status(200).json({ jobs })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}