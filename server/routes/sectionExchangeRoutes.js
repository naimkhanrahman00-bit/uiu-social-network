const express = require('express');
const router = express.Router();
const sectionExchangeController = require('../controllers/sectionExchangeController');
const { protect, moderator } = require('../middleware/authMiddleware');

router.post('/exchange', protect, sectionExchangeController.createExchangeRequest);
router.get('/exchange', protect, sectionExchangeController.getExchangeRequests);
router.post('/new-section', protect, sectionExchangeController.createNewSectionRequest);
router.get('/new-section', protect, sectionExchangeController.getSectionRequests);
router.post('/new-section/:id/support', protect, sectionExchangeController.toggleSupport);

// Moderation
router.get('/pending', protect, moderator, sectionExchangeController.getPendingPosts);
router.patch('/:type/:id/status', protect, moderator, sectionExchangeController.updatePostStatus);

module.exports = router;
