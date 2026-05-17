const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../controllers/roadmap.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, generateRoadmap);

module.exports = router;