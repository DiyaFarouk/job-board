// import Job from "../models/Job.model.js"

// // 1 — check job exists
// export const jobExists = async (req, res, next) => {
//     try {
//         const job = await Job.findById(req.params.id)

//         if (!job) {
//             return res.status(404).json({ message: "Job not found" })
//         }

//         req.job = job   // attach job to request so controller can use it
//         next()

//     } catch (error) {
//         return res.status(500).json({ message: error.message })
//     }
// }

// // 2 — check job is still open (before applying)
// export const jobIsOpen = (req, res, next) => {
//     if (!req.job.isOpen) {
//         return res.status(400).json({
//             message: "This job is no longer accepting applications"
//         })
//     }
//     next()
// }

// // 3 — check deadline not passed
// export const jobDeadlineValid = (req, res, next) => {
//     if (req.job.deadline && new Date() > new Date(req.job.deadline)) {
//         return res.status(400).json({
//             message: "Application deadline has passed"
//         })
//     }
//     next()
// }

// // 4 — check user owns the job (before edit or delete)
// export const jobOwner = (req, res, next) => {
//     if (req.job.postedBy.toString() !== req.user.id.toString()) {
//         return res.status(403).json({
//             message: "Forbidden - You did not post this job"
//         })
//     }
//     next()
// }
