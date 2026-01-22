const express = require('express');
const router = express.Router();
const sectionExchangeController = require('../controllers/sectionExchangeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/exchange', protect, sectionExchangeController.createExchangeRequest);
router.get('/exchange', protect, sectionExchangeController.getExchangeRequests);
router.post('/new-section', protect, sectionExchangeController.createNewSectionRequest);

module.exports = router;
