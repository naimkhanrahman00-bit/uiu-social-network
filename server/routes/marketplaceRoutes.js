const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Marketplace
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/marketplace/';
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `mp-${Date.now()}-${file.originalname}`);
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

// Get all listings
router.get('/', marketplaceController.getListings);

// Create a new listing
router.post('/', protect, upload.array('images', 5), marketplaceController.createListing);

// Get all categories
router.get('/categories', marketplaceController.getCategories);

module.exports = router;
