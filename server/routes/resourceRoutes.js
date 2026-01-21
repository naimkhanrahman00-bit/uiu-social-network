const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// Get all resources
router.get('/', resourceController.getAllResources);

// Get filters (departments, courses) - legacy/combined
router.get('/filters', resourceController.getFilterOptions);

// Get departments
router.get('/departments', resourceController.getDepartments);

// Get courses
router.get('/courses', resourceController.getCourses);

module.exports = router;
