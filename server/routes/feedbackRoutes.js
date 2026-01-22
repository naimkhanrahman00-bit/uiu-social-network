const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/general', protect, feedbackController.createGeneralFeedback);

module.exports = router;
