const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/conversations', protect, messageController.startConversation);
router.get('/conversations', protect, messageController.getConversations);
router.get('/:conversationId', protect, messageController.getMessages);
router.post('/:conversationId', protect, messageController.sendMessage);
router.patch('/:conversationId/read', protect, messageController.markAsRead);

module.exports = router;
