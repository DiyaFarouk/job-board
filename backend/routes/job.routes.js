const express = require("express")
const router = express.Router()
const {getAllJobs,getJobsByCategory,getJobsById,searchJobs,closeJob,reopenJob,getMyJobs,getJobApplicants,createJob,updateJob,deleteJob} = require ("../controllers/job.controller.js")

//public
router.get("/", getAllJobs)
router.get("/category/:category", getJobsByCategory)
router.get("/:id", getJobsById)
router.get("/search", searchJobs)

//company only
router.post("/", createJob)
router.put("/:id", updateJob)
router.delete("/:id", deleteJob)
router.patch("/:id/close", closeJob)
router.patch("/:id/reopen", reopenJob)
router.get("/me", getMyJobs)
router.get("/:id/applicants", getJobApplicants)

module.exports = router;