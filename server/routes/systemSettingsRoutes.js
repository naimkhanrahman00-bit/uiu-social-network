const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

// Public/Auth: Get settings (allowing public for things like login page configuration if needed, but for now maybe auth)
// Making it public so Navbar and unauthenticated parts can theoretically see feature flags, 
// though for this specific feature (Section Issue) it's for logged in users mostly.
// Let's keep it open or just auth?
// The PRD says "So that it's only available during relevant periods", implies visibility control.
// Let's make it accessible to everyone so the UI can adapt even on login screen if needed, 
// but primarily for authenticated users.
router.get('/', settingsController.getSettings);

// Admin only: Update setting
router.patch('/admin/:key', protect, roleCheck(['admin']), settingsController.updateSetting);

module.exports = router;
