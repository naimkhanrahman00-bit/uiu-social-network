const db = require('./config/db');
const bcrypt = require('bcrypt');

async function createAdminUser() {
    try {
        const email = 'admin@cse.uiu.ac.bd';
        const password = 'admin123';

        // Check if exists
        const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('Admin user already exists with email:', email);
            console.log('You can login with:');
            console.log('Email:', email);
            console.log('Password: admin123');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.execute(
            'INSERT INTO users (full_name, email, password_hash, student_id, department_id, batch, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['Admin User', email, hashedPassword, '00000000', 1, 'Admin', 'admin', 1]
        );

        console.log('✓ Admin user created successfully!');
        console.log('Email:', email);
        console.log('Password: admin123');
        console.log('User ID:', result.insertId);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
