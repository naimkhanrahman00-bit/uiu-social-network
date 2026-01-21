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
