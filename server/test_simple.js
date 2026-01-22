const db = require('./config/db');

async function testSimpleQuery() {
    try {
        console.log('Testing simple query...\n');

        // Test 1: Simple count
        const countSql = 'SELECT COUNT(*) as total FROM users';
        console.log('Count SQL:', countSql);
        const [countResult] = await db.execute(countSql, []);
        console.log('Total users:', countResult[0].total);

        // Test 2: Simple select with LIMIT
        const sql = 'SELECT * FROM users LIMIT ? OFFSET ?';
        console.log('\nMain SQL:', sql);
        console.log('Params:', [20, 0]);
        const [rows] = await db.execute(sql, [20, 0]);
        console.log('Found:', rows.length, 'users');

        if (rows.length > 0) {
            console.log('\nFirst user:', rows[0].full_name);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error('SQL State:', error.sqlState);
        process.exit(1);
    }
}

testSimpleQuery();
