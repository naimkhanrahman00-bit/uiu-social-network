const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

// Get all resources
router.get('/', resourceController.getAllResources);

// Get filters (departments, courses) - legacy/combined
router.get('/filters', resourceController.getFilterOptions);

// Get departments
router.get('/departments', resourceController.getDepartments);

// Get courses
router.get('/courses', resourceController.getCourses);

// Download resource
router.get('/:id/download', protect, resourceController.downloadResource);

// Create request
router.post('/requests', protect, resourceController.createRequest);

// Get my requests
router.get('/requests/my-requests', protect, resourceController.getMyRequests);

module.exports = router;
