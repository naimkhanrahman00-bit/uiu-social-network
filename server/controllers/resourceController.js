const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Get all resources with filters
exports.getAllResources = async (req, res) => {
    try {
        const { department_id, course_id, trimester, search } = req.query;

        let query = `
            SELECT 
                r.id, 
                r.title, 
                r.description, 
                r.file_path, 
                r.file_size, 
                r.download_count, 
                r.created_at,
                c.code as course_code,
                c.name as course_name,
                c.trimester,
                d.name as department_name,
                d.code as department_code,
                u.full_name as uploader_name
            FROM resources r
            JOIN courses c ON r.course_id = c.id
            JOIN departments d ON c.department_id = d.id
            JOIN users u ON r.uploaded_by = u.id
            WHERE 1=1
        `;

        const params = [];

        if (department_id) {
            query += ` AND d.id = ?`;
            params.push(department_id);
        }

        if (course_id) {
            query += ` AND c.id = ?`;
            params.push(course_id);
        }

        if (trimester) {
            query += ` AND c.trimester = ?`;
            params.push(trimester);
        }

        if (search) {
            query += ` AND (r.title LIKE ? OR c.name LIKE ? OR c.code LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY r.created_at DESC`;

        const [rows] = await db.query(query, params);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Server error fetching resources' });
    }
};


// Get all departments
exports.getDepartments = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM departments ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Server error fetching departments' });
    }
};

// Get courses (optional filter by department)
exports.getCourses = async (req, res) => {
    try {
        const { department_id, trimester } = req.query;
        let query = 'SELECT * FROM courses WHERE 1=1';
        const params = [];

        if (department_id) {
            query += ' AND department_id = ?';
            params.push(department_id);
        }

        if (trimester) {
            query += ' AND trimester = ?';
            params.push(trimester);
        }

        query += ' ORDER BY code';
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server error fetching courses' });
    }
};

// Get filters (departments, courses)
exports.getFilterOptions = async (req, res) => {
    try {
        const [departments] = await db.query('SELECT * FROM departments ORDER BY name');
        const [courses] = await db.query('SELECT * FROM courses ORDER BY code');

        // distinct trimesters from courses
        const [trimesters] = await db.query('SELECT DISTINCT trimester FROM courses ORDER BY trimester');

        res.json({
            departments,
            courses,
            trimesters: trimesters.map(t => t.trimester)
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ message: 'Server error fetching filter options' });
    }
};

// Download resource
exports.downloadResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user ? req.user.id : null; // From protect middleware

        // 1. Get resource details
        const [resources] = await db.query('SELECT * FROM resources WHERE id = ?', [resourceId]);

        if (resources.length === 0) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const resource = resources[0];

        // 2. Increment download count
        await db.query('UPDATE resources SET download_count = download_count + 1 WHERE id = ?', [resourceId]);

        // 3. Track download if user is logged in
        if (userId) {
            await db.query('INSERT INTO resource_downloads (resource_id, user_id) VALUES (?, ?)', [resourceId, userId]);
        }

        // 4. Serve file
        // Assuming file_path is stored relative to root/uploads, e.g., 'uploads/resources/file.pdf'
        // or just 'resources/file.pdf' if we prepend uploads.
        // Let's assume the DB stores the path relative to server root or 'uploads/'
        // We need to resolve it correctly. 
        // Based on typical multer usage it might be 'uploads/filename' or 'uploads/resources/filename'.

        let filePath = resource.file_path;
        // Remove leading slash or backslash if present to ensure it's treated as relative
        if (filePath.startsWith('/') || filePath.startsWith('\\')) {
            filePath = filePath.substring(1);
        }

        // Construct absolute path
        // process.cwd() is e:\db\server
        const absolutePath = path.join(process.cwd(), filePath);

        if (fs.existsSync(absolutePath)) {
            res.download(absolutePath, resource.title + path.extname(filePath), (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    if (!res.headersSent) {
                        res.status(500).json({ message: 'Error downloading file' });
                    }
                }
            });
        } else {
            console.error('File not found at path:', absolutePath);
            return res.status(404).json({ message: 'File not found on server' });
        }

    } catch (error) {
        console.error('Error in downloadResource:', error);
        res.status(500).json({ message: 'Server error processing download' });
    }
};

// Create a resource request
exports.createRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { course_id, resource_name, description } = req.body;

        if (!course_id || !resource_name) {
            return res.status(400).json({ message: 'Course and Resource Name are required' });
        }

        await db.query(
            'INSERT INTO resource_requests (user_id, course_id, resource_name, description) VALUES (?, ?, ?, ?)',
            [userId, course_id, resource_name, description]
        );

        res.status(201).json({ message: 'Request submitted successfully' });
    } catch (error) {
        console.error('Error creating resource request:', error);
        res.status(500).json({ message: 'Server error creating request' });
    }
};

// Get my requests
exports.getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT 
                rr.*,
                c.code as course_code,
                c.name as course_name
            FROM resource_requests rr
            JOIN courses c ON rr.course_id = c.id
            WHERE rr.user_id = ?
            ORDER BY rr.created_at DESC
        `;

        const [rows] = await db.query(query, [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching my requests:', error);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
};

// Upload resource
exports.uploadResource = async (req, res) => {
    try {
        const uploaderId = req.user.id;
        const { course_id, title, description } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!course_id || !title) {
            return res.status(400).json({ message: 'Course and Title are required' });
        }

        // Prepare file path relative to project root or accessible URL path
        // Middleware saves to ./uploads/resources/
        // We want to store just 'uploads/resources/filename' or similar
        // Let's store 'uploads/resources/filename' so it matches our download logic
        const filePath = `uploads/resources/${file.filename}`;

        await db.query(
            'INSERT INTO resources (course_id, title, description, file_path, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
            [course_id, title, description, filePath, file.size, uploaderId]
        );

        res.status(201).json({ message: 'Resource uploaded successfully' });

    } catch (error) {
        console.error('Error uploading resource:', error);
        res.status(500).json({ message: 'Server error uploading resource' });
    }
};

// Get all requests (Admin only)
exports.getAllRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT 
                rr.*,
                u.full_name as user_name,
                u.student_id,
                c.code as course_code,
                c.name as course_name
            FROM resource_requests rr
            JOIN users u ON rr.user_id = u.id
            JOIN courses c ON rr.course_id = c.id
        `;

        const params = [];
        if (status) {
            query += ' WHERE rr.status = ?';
            params.push(status);
        }

        query += ' ORDER BY rr.created_at DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
};

// Update request status (Admin only)
exports.updateRequestStatus = async (req, res) => {
    try {
        const requestId = req.params.id;
        const { status, admin_note, fulfilled_resource_id } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        await db.query(
            'UPDATE resource_requests SET status = ?, admin_note = ?, fulfilled_resource_id = ? WHERE id = ?',
            [status, admin_note || null, fulfilled_resource_id || null, requestId]
        );

        res.json({ message: 'Request updated successfully' });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'Server error updating request' });
    }
};

// Create Course (Admin only)
exports.createCourse = async (req, res) => {
    try {
        const { code, name, department_id, trimester } = req.body;

        if (!code || !name || !department_id || !trimester) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [existing] = await db.query('SELECT id FROM courses WHERE code = ?', [code]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Course with this code already exists' });
        }

        await db.query(
            'INSERT INTO courses (code, name, department_id, trimester) VALUES (?, ?, ?, ?)',
            [code, name, department_id, trimester]
        );

        res.status(201).json({ message: 'Course created successfully' });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Server error creating course' });
    }
};

// Update Course (Admin only)
exports.updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const { code, name, department_id, trimester } = req.body;

        await db.query(
            'UPDATE courses SET code = ?, name = ?, department_id = ?, trimester = ? WHERE id = ?',
            [code, name, department_id, trimester, courseId]
        );

        res.json({ message: 'Course updated successfully' });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Server error updating course' });
    }
};

// Delete Course (Admin only)
exports.deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Check dependencies
        const [resources] = await db.query('SELECT id FROM resources WHERE course_id = ?', [courseId]);
        if (resources.length > 0) {
            return res.status(400).json({ message: 'Cannot delete course with existing resources' });
        }

        const [requests] = await db.query('SELECT id FROM resource_requests WHERE course_id = ?', [courseId]);
        if (requests.length > 0) {
            return res.status(400).json({ message: 'Cannot delete course with existing requests' });
        }

        await db.query('DELETE FROM courses WHERE id = ?', [courseId]);

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Server error deleting course' });
    }
};
