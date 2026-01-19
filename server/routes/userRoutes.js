const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Need to create this
const upload = require('../middleware/uploadMiddleware');

router.route('/profile')
    .get(protect, getProfile)
    .put(protect, upload.single('profile_picture'), updateProfile);

module.exports = router;
