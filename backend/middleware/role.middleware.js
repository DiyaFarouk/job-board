// src/middleware/role.middleware.js

// works for any number of roles
const authorise = (...roles) => {
    return (req, res, next) => {

        // make sure protectRoute ran first
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized - Please log in first"
            })
        }

        // check if user role is in the allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied — ${req.user.role}s cannot perform this action`
            })
        }

        next()
    }
}

// admin only shortcut
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized - Please log in first"
        })
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Forbidden - Admins only"
        })
    }

    next()
}

// candidate only shortcut
const candidateOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized - Please log in first"
        })
    }

    if (req.user.role !== "candidate") {
        return res.status(403).json({
            message: "Forbidden - Candidates only"
        })
    }

    next()
}

// company only shortcut
const companyOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized - Please log in first"
        })
    }

    if (req.user.role !== "company") {
        return res.status(403).json({
            message: "Forbidden - Companies only"
        })
    }

    next()
}

module.exports= {authorise,adminOnly,candidateOnly,companyOnly}