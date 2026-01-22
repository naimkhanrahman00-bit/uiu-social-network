const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function seed() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);

        // 1. Enable Section Issue
        console.log('Enabling Section Issue feature...');
        await connection.query(`
            INSERT INTO system_settings (setting_key, setting_value, updated_at) 
            VALUES ('section_issue_enabled', 'true', NOW()) 
            ON DUPLICATE KEY UPDATE setting_value = 'true', updated_at = NOW()
        `);

        // 2. Create Test Student
        console.log('Creating/Updating test student...');
        const email = 'student@uiu.ac.bd';
        const password = 'password123';
        // Check if user exists
        const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        let userId;
        const hashedPassword = await bcrypt.hash(password, 10);

        if (users.length > 0) {
            console.log('User already exists. Updating password and verification status...');
            await connection.query(`
                UPDATE users 
                SET password_hash = ?, is_verified = TRUE, role = 'student'
                WHERE email = ?
            `, [hashedPassword, email]);
            userId = users[0].id;
        } else {
            console.log('Creating new user...');
            const studentId = '011999000';
            const [result] = await connection.query(`
                INSERT INTO users (email, password_hash, student_id, full_name, department_id, batch, role, is_verified)
                VALUES (?, ?, ?, 'Test Student', 1, '2023', 'student', TRUE)
            `, [email, hashedPassword, studentId]);
            userId = result.insertId;
        }

        console.log(`Test user ready: ${email} / ${password} (ID: ${userId})`);

        // 3. Ensure a course exists for the dropdown
        console.log('Ensuring courses exist...');
        const [courses] = await connection.query('SELECT id FROM courses LIMIT 1');
        if (courses.length === 0) {
            const [dept] = await connection.query('SELECT id FROM departments LIMIT 1');
            const deptId = dept[0]?.id || 1;
            await connection.query(`
                INSERT INTO courses (code, name, department_id, trimester)
                VALUES ('CSE 123', 'Introduction to Programming', ?, 'Spring 2026')
             `, [deptId]);
            console.log('Created dummy course.');
        } else {
            console.log('Courses exist.');
        }

    } catch (error) {
        console.error('Error seeding:', error);
    } finally {
        if (connection) await connection.end();
    }
}

seed();
