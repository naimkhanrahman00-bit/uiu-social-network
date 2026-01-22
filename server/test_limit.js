const db = require('./config/db');

async function testLimitOffset() {
    try {
        console.log('Testing LIMIT/OFFSET with execute()...\n');

        // Try execute with LIMIT/OFFSET
        try {
            const sql1 = 'SELECT * FROM users LIMIT ? OFFSET ?';
            console.log('SQL:', sql1);
            console.log('Params:', [20, 0]);
            const [rows1] = await db.execute(sql1, [20, 0]);
            console.log('Success with execute()! Found:', rows1.length);
        } catch (err) {
            console.log('execute() failed:', err.message);
        }

        console.log('\n---\n');

        // Try query with LIMIT/OFFSET (no prepared statement)
        try {
            const sql2 = 'SELECT * FROM users LIMIT 20 OFFSET 0';
            console.log('SQL:', sql2);
            const [rows2] = await db.query(sql2);
            console.log('Success with query()! Found:', rows2.length);
        } catch (err) {
            console.log('query() failed:', err.message);
        }

        process.exit(0);
    } catch (error) {
        console.error('Unexpected error:', error.message);
        process.exit(1);
    }
}

testLimitOffset();
