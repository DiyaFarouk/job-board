const express = require('express');
const router = express.Router();
const {getAllJobs, getJobsByCategory, getJobsById} = require('../controllers/job.controller');
const {protectRoute} =require('../middleware/auth.middleware');

//static route
router.get('/job/get', protectRoute, getAllJobs);

//Dynamic route
router.get("/job/get/category/:id", protectRoute, getJobsByCategory);
router.get("/job/get/:id", protectRoute, getJobsById);

module.exports = router