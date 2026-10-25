require("dotenv").config();
const express = require("express")
const app = express()
const { connectdb } = require("./config/db.js")
const cookieParser = require("cookie-parser")

app.use(express.json())
app.use(cookieParser())
const port=process.env.PORT;

connectdb()

const authRoutes = require("./routes/auth.route.js")
const companyRoutes = require("./routes/company.route.js")
const jobRoutes =  require("./routes/job.routes.js")

app.use("/api/auth",authRoutes)
app.use("/api/companies",companyRoutes)
app.use("/api/jobs",jobRoutes)
app.listen(port,() => {
    console.log(`Server is running on ${port}`)
})