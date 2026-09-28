// src/controllers/company.controller.js

const Company = require("../models/company.model.js")
const Job = require("../models/job.model.js")
// const User = require("../models/user.model.js")
// ─────────────────────────────────────────
// PUBLIC FUNCTIONS — no login needed
// ─────────────────────────────────────────

// GET /api/companies — get all verified companies
const getAllCompanies = async (req, res) => {
    try {
        const { industry, location, search } = req.query
        const filter = { isVerified: true }

        if (industry) filter.industry = industry
        if (location) filter.location = location
        if (search)   filter.name = { $regex: search, $options: "i" }

        const companies = await Company.find(filter)
            .populate("owner", "name email")
            .sort({ createdAt: -1 })

        return res.status(200).json({ companies })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// GET /api/companies/:id — get single company
const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
            .populate("owner", "name email")

        if (!company) {
            return res.status(404).json({ message: "Company not found" })
        }

        return res.status(200).json({ company })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// GET /api/companies/:id/jobs — get all jobs posted by this company
const getCompanyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            company: req.params.id,
            isOpen: true
        }).sort({ createdAt: -1 })

        return res.status(200).json({ jobs })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ─────────────────────────────────────────
// COMPANY FUNCTIONS — login + company role
// ─────────────────────────────────────────

// POST /api/companies — create company profile
const createCompany = async (req, res) => {
    try {
        const { name, description, website, location, industry, logo } = req.body

        if (!name) {
            return res.status(400).json({ message: "Company name is required" })
        }

        // check if user already has a company
        const existing = await Company.findOne({ owner: req.user.id })
        if (existing) {
            return res.status(400).json({
                message: "You already have a company profile"
            })
        }

        const company = new Company({
            owner: req.user.id,
            name,
            description,
            website,
            location,
            industry,
            logo
        })

        await company.save()

        return res.status(201).json({
            message: "Company created successfully",
            company
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// PUT /api/companies/:id — update company profile
const updateCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)

        if (!company) {
            return res.status(404).json({ message: "Company not found" })
        }

        // make sure only the owner can update
        if (company.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "Forbidden - You do not own this company"
            })
        }

        const updated = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }  // returns the updated document
        )

        return res.status(200).json({
            message: "Company updated",
            company: updated
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// DELETE /api/companies/:id — delete company
const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)

        if (!company) {
            return res.status(404).json({ message: "Company not found" })
        }

        // only owner or admin can delete
        if (company.owner.toString() !== req.user.id.toString()
            && req.user.role !== "admin") {
            return res.status(403).json({
                message: "Forbidden - You cannot delete this company"
            })
        }

        // delete all jobs posted by this company too
        await Job.deleteMany({ company: req.params.id })
        await Company.findByIdAndDelete(req.params.id)

        return res.status(200).json({
            message: "Company and all its jobs deleted"
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// GET /api/companies/me — get my own company profile
const getMyCompany = async (req, res) => {
    try {
        const company = await Company.findOne({ owner: req.user.id })

        if (!company) {
            return res.status(404).json({
                message: "You have not created a company profile yet"
            })
        }

        return res.status(200).json({ company })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// ─────────────────────────────────────────
// ADMIN FUNCTIONS — admin role only
// ─────────────────────────────────────────

// PATCH /api/companies/:id/verify — admin verifies a company
const verifyCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        )

        if (!company) {
            return res.status(404).json({ message: "Company not found" })
        }

        return res.status(200).json({
            message: "Company verified successfully",
            company
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// GET /api/companies/unverified — admin sees all unverified companies
const getUnverifiedCompanies = async (req, res) => {
    try {
        const companies = await Company.find({ isVerified: false })
            .populate("owner", "name email")
            .sort({ createdAt: -1 })

        return res.status(200).json({ companies })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports={getAllCompanies,getCompanyById,getCompanyJobs,createCompany,updateCompany,deleteCompany,getMyCompany,verifyCompany,getUnverifiedCompanies}