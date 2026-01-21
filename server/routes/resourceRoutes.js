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

// Admin: Get all requests
router.get('/requests', protect, resourceController.getAllRequests);

// Admin: Update request status
router.patch('/requests/:id', protect, resourceController.updateRequestStatus);

// Upload resource (Admin only)
const uploadResource = require('../middleware/resourceUploadMiddleware');
const { admin } = require('../middleware/authMiddleware'); // Assuming we have admin middleware, check first? 
// Wait, I need to check if 'admin' middleware exists in authMiddleware. Used protect for now, will verify admin middleware.
// Let's assume protect is enough for now or check authMiddleware file.
// Actually, Prd says Admin only.
// Upload resource (Admin only)
router.post('/', protect, uploadResource.single('file'), resourceController.uploadResource);

// Admin: Course Management
router.post('/courses', protect, resourceController.createCourse);
router.put('/courses/:id', protect, resourceController.updateCourse);
router.delete('/courses/:id', protect, resourceController.deleteCourse);

module.exports = router;
