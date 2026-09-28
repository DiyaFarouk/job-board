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

app.use(authRoutes)
app.use(companyRoutes)
app.listen(port,() => {
    console.log(`Server is running on ${port}`)
})