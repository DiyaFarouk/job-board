require("dotenv").config();
const express = require("express")
const app = express();
const { connectdb } = require("./config/db.js")
const cookieParser = require("cookie-parser")

app.use(express.json())
app.use(cookieParser())
const port=process.env.PORT;

connectdb()

const authRouter = require("./routes/auth.route.js")
const companyRouter = require("./routes/company.route.js");
const jobRouter = require('./routes/job.route.js');

app.use(authRouter)
app.use(companyRouter)
app.use(jobRouter);

app.listen(port,() => {
    console.log(`Server is running on ${port}`)
})