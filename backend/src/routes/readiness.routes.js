const express = require('express');
const router = express.Router();
const { checkReadiness } = require('../controllers/readiness.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/check', protect, checkReadiness);

module.exports = router;