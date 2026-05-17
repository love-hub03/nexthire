const express = require('express');
const router = express.Router();
const { getMyProfile, updateProfile } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateProfile);

module.exports = router;