const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { protect, admin } = require('../middleware/authMiddleware');
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

// Get current user's listings
router.get('/my-listings', protect, marketplaceController.getMyListings);

// Get all categories
router.get('/categories', marketplaceController.getCategories);

// Admin Category Management
router.post('/categories', protect, admin, marketplaceController.createCategory);
router.put('/categories/:id', protect, admin, marketplaceController.updateCategory);
router.delete('/categories/:id', protect, admin, marketplaceController.deleteCategory);

// Create a new listing
router.post('/', protect, upload.array('images', 5), marketplaceController.createListing);

// Get single listing details
router.get('/:id', marketplaceController.getListingById);

// Update listing (full update)
router.put('/:id', protect, upload.array('images', 5), marketplaceController.updateListing);

// Update listing status
router.patch('/:id/status', protect, marketplaceController.updateListingStatus);

// Delete listing
router.delete('/:id', protect, marketplaceController.deleteListing);

module.exports = router;
