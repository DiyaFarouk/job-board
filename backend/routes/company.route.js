const express = require("express")
const router = express.Router()
const {getAllCompanies,getCompanyById,getCompanyJobs,createCompany,updateCompany,deleteCompany,getMyCompany,verifyCompany,getUnverifiedCompanies} = require("../controllers/company.controller.js")
const {protectRoute} = require("../middleware/auth.middleware.js")
const {authorise,adminOnly,candidateOnly,companyOnly} = require("../middleware/role.middleware.js")

// public
router.get("/", getAllCompanies)
router.get("/:id", getCompanyById)
router.get("/:id/jobs", getCompanyJobs)

// company only
router.get("/me", protectRoute, companyOnly, getMyCompany)
router.post("/", protectRoute, companyOnly, createCompany)
router.put("/:id", protectRoute, companyOnly, updateCompany)
router.delete("/:id", protectRoute, authorise("company", "admin"), deleteCompany)

// admin only
router.patch("/:id/verify", protectRoute, adminOnly, verifyCompany)
router.get("/admin/unverified", protectRoute, adminOnly, getUnverifiedCompanies)

module.exports = router;