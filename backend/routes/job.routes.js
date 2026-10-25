const express = require("express")
const router = express.Router()
const {getAllJobs,getJobsByCategory,getJobsById,searchJobs,closeJob,reopenJob,getMyJobs,getJobApplicants,createJob,updateJob,deleteJob,applyToJob,getMyApplications,withdrawApplication,getAllJobsAdmin,deleteJobAdmin,closeJobAdmin} = require ("../controllers/job.controller.js")
const {protectRoute} = require("../middleware/auth.middleware.js")
const {candidateOnly,companyOnly,adminOnly} = require("../middleware/role.middleware.js")
//public
router.get("/", getAllJobs)
router.get("/category/:category", getJobsByCategory)
router.get("/:id", getJobsById)
router.get("/search", searchJobs)

//company only
router.post("/",protectRoute, companyOnly,createJob)
router.put("/:id",protectRoute,companyOnly, updateJob)
router.delete("/:id",protectRoute,companyOnly, deleteJob)
router.patch("/:id/close",protectRoute,companyOnly, closeJob)
router.patch("/:id/reopen",protectRoute,companyOnly, reopenJob)
router.get("/me", protectRoute, companyOnly,getMyJobs)
router.get("/:id/applicants", protectRoute,companyOnly,getJobApplicants)

//candidate only
router.post("/:id/apply", protectRoute,candidateOnly, applyToJob)
router.get("/applications/me", protectRoute,candidateOnly,getMyApplications)
router.delete("/applications/:id/withdraw", protectRoute,candidateOnly, withdrawApplication)

//admin only
router.get("/admin", protectRoute,adminOnly, getAllJobsAdmin)
router.delete("/admin/:id", protectRoute,adminOnly, deleteJobAdmin)
router.patch("/admin/:id/close", protectRoute,adminOnly, closeJobAdmin)

module.exports = router;