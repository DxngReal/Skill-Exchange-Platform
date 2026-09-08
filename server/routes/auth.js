const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, logout, getMe, updateProfile, uploadAvatar, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], resetPassword);

module.exports = router;
