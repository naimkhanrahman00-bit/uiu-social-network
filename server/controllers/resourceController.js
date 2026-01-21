const db = require('../config/db');

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
