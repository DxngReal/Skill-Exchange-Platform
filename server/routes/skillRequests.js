const express = require('express');
const router = express.Router();
const {
  createRequest, getMyRequests, updateRequestStatus,
  completeRequest, cancelRequest
} = require('../controllers/skillRequestController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyRequests);
router.post('/', protect, createRequest);
router.put('/:id/status', protect, updateRequestStatus);
router.put('/:id/complete', protect, completeRequest);
router.put('/:id/cancel', protect, cancelRequest);

module.exports = router;
