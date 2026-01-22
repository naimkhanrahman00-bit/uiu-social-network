const db = require('./config/db');

async function testUserQuery() {
    try {
        console.log('Testing User.getAll query...\n');

        const search = '';
        const role = '';
        const status = '';
        const limit = 20;
        const offset = 0;

        // Build WHERE clause
        let whereClause = 'WHERE 1=1';
        const params = [];

        // Search filter
        if (search) {
            whereClause += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.student_id LIKE ?)`;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        // Role filter
        if (role) {
            whereClause += ` AND u.role = ?`;
            params.push(role);
        }

        // Status filter (active/suspended)
        if (status === 'active') {
            whereClause += ` AND u.is_suspended = 0`;
        } else if (status === 'suspended') {
            whereClause += ` AND u.is_suspended = 1`;
        }

        console.log('===== WHERE CLAUSE =====');
        console.log(whereClause);
        console.log('========================\n');

        console.log('===== COUNT QUERY =====');
        console.log('Params count:', params.length);

        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM users u LEFT JOIN departments d ON u.department_id = d.id ${whereClause}`;

        console.log('SQL:', countSql);
        console.log('Params:', params);

        const [countResult] = await db.execute(countSql, params);
        const total = countResult[0].total;

        console.log('Total users:', total);
        console.log('========================\n');

        console.log('===== MAIN QUERY =====');
        // Get users with pagination
        const sql = `SELECT u.id, u.email, u.student_id, u.full_name, u.role, u.is_suspended, u.is_verified, u.batch, u.contact_info, u.created_at, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id ${whereClause} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;

        const mainParams = [...params, parseInt(limit), parseInt(offset)];
        console.log('Params count:', mainParams.length);
        console.log('SQL:', sql);
        console.log('Params:', mainParams);

        const [rows] = await db.execute(sql, mainParams);

        console.log(`\nFound ${rows.length} users`);
        console.log('========================\n');
        if (rows.length > 0) {
            console.log('First user:', rows[0]);
        }

        process.exit(0);
    } catch (error) {
        console.error('\n===== ERROR =====');
        console.error('Message:', error.message);
        console.error('SQL State:', error.sqlState);
        console.error('SQL Message:', error.sqlMessage);
        process.exit(1);
    }
}

testUserQuery();
