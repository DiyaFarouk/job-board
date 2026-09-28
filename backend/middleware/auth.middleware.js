// import jwt from "jsonwebtoken"
// import User from "../models/user.model.js"
const jwt = require("jsonwebtoken")
const User = require("../models/user.model.js")

// 1 — protect route (verify token + attach user)
const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.access_token

        if (!accessToken) {
            return res.status(401).json({
                message: "Unauthorized - No access token provided"
            })
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
            const user = await User.findById(decoded.id).select("-password")

            if (!user) {
                return res.status(401).json({
                    message: "Unauthorized - User not found"
                })
            }

            req.user = user
            next()

        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Unauthorized - Access token expired"
                })
            }
            throw error
        }

    } catch (error) {
        console.log("Error in protectRoute:", error)
        res.status(401).json({ message: "Unauthorized - Invalid access token" })
    }
}

// 2 — role based access (candidate / company / admin)
// const authorise = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({
//                 message: `Access denied — ${req.user.role} cannot perform this action`
//             })
//         }
//         next()
//     }
// }

// 3 — admin only shortcut
const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next()
    } else {
        res.status(403).json({ message: "Forbidden - Admins only" })
    }
}

module.exports = {protectRoute,adminRoute}