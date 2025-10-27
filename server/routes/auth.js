const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);           // Get current user
router.put('/profile', protect, updateProfile); // Update user profile

module.exports = router;
