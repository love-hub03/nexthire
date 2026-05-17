const express = require('express');
const router = express.Router();
const { getJobs } = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getJobs);

module.exports = router;