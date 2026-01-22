const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', protect, admin, adminController.getDashboardStats);

// @route   GET /api/admin/users
// @desc    Get all users with search and filters
// @access  Private/Admin
router.get('/users', protect, admin, adminController.getUsers);

// @route   PATCH /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.patch('/users/:id/role', protect, admin, adminController.updateUserRole);

// @route   PATCH /api/admin/users/:id/suspend
// @desc    Suspend or unsuspend a user
// @access  Private/Admin
router.patch('/users/:id/suspend', protect, admin, adminController.suspendUser);

// @route   GET /api/admin/users/:id/activity
// @desc    Get user activity statistics
// @access  Private/Admin
router.get('/users/:id/activity', protect, admin, adminController.getUserActivity);

module.exports = router;
