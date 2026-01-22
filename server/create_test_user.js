const db = require('./config/db');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        const email = 'msgtest_script@cse.uiu.ac.bd';
        const password = 'password123';

        // Check if exists
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('User already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.execute(
            'INSERT INTO users (full_name, email, password_hash, student_id, department_id, batch, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['Msg Test Script', email, hashedPassword, '99999999', 1, '233', 'student', 1]
        );

        console.log('User created with ID:', result.insertId);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

createTestUser();
