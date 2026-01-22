const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Feedback
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/feedback/';
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `fb-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Images only!'));
        }
    }
});

router.post('/general', protect, feedbackController.createGeneralFeedback);
router.post('/canteen', protect, upload.array('images', 3), feedbackController.createCanteenFeedback);
router.get('/', feedbackController.getFeedbacks);

// Moderation Routes
router.get('/pending', protect, feedbackController.getPendingFeedbacks); // Add admin check if middleware exists
router.patch('/:id/status', protect, feedbackController.updateFeedbackStatus); // Add admin check
router.post('/:id/respond', protect, feedbackController.respondToFeedback); // Add admin check

module.exports = router;
