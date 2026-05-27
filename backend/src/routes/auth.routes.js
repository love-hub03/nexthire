const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { register, login, getMe, googleAuth } = require('../controllers/auth.controller');
router.post('/google', googleAuth);
// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route - must be logged in
router.get('/me', protect, getMe);

module.exports = router;