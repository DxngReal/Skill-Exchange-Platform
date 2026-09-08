const express = require('express');
const router = express.Router();
const { getMatches } = require('../controllers/matchingController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMatches);

module.exports = router;
