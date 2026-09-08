const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/avatar', protect, updateAvatar);

module.exports = router;
