const express = require('express');
const router = express.Router();
const {
  getConversations, createConversation, getMessages,
  sendMessage, getUnreadCount
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/unread', protect, getUnreadCount);
router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, createConversation);
router.get('/conversations/:conversationId', protect, getMessages);
router.post('/conversations/:conversationId', protect, sendMessage);

module.exports = router;
