const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'uiu_social_network',
};

async function setupResourcesDB() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Create departments table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        code VARCHAR(10) NOT NULL UNIQUE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('departments table checked/created.');

        // 2. Create courses table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        department_id INT NOT NULL,
        trimester VARCHAR(20) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id)
      )
    `);
        console.log('courses table checked/created.');

        // 3. Create resources table
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS resources (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        file_path VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL,
        download_count INT NOT NULL DEFAULT 0,
        uploaded_by INT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id),
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )
    `);
        console.log('resources table checked/created.');

        // Seed Departments
        const departments = [
            { name: 'Computer Science & Engineering', code: 'CSE' },
            { name: 'Electrical & Electronic Engineering', code: 'EEE' },
            { name: 'Business Administration', code: 'BBA' },
        ];

        for (const dept of departments) {
            await connection.execute(
                `INSERT IGNORE INTO departments (name, code) VALUES (?, ?)`,
                [dept.name, dept.code]
            );
        }
        console.log('Departments seeded.');

        // Get Department IDs
        const [deptRows] = await connection.execute('SELECT id, code FROM departments');
        const deptMap = {};
        deptRows.forEach(row => {
            deptMap[row.code] = row.id;
        });

        // Seed Courses
        const courses = [
            { code: 'CSE 1111', name: 'Structured Programming Language', dept: 'CSE', trimester: '1st' },
            { code: 'CSE 1112', name: 'Structured Programming Language Lab', dept: 'CSE', trimester: '1st' },
            { code: 'CSE 2213', name: 'Discrete Mathematics', dept: 'CSE', trimester: '2nd' },
            { code: 'CSE 2215', name: 'Data Structures and Algorithms I', dept: 'CSE', trimester: '3rd' },
            { code: 'EEE 1101', name: 'Electrical Circuits I', dept: 'EEE', trimester: '1st' },
            { code: 'ACT 1101', name: 'Financial Accounting', dept: 'BBA', trimester: '1st' },
        ];

        for (const course of courses) {
            if (deptMap[course.dept]) {
                await connection.execute(
                    `INSERT IGNORE INTO courses (code, name, department_id, trimester) VALUES (?, ?, ?, ?)`,
                    [course.code, course.name, deptMap[course.dept], course.trimester]
                );
            }
        }
        console.log('Courses seeded.');

        // Check if we need to seed resources (fake data for now)
        // We need a valid user ID for uploaded_by. Let's pick the first user.
        const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
        const uploaderId = users.length > 0 ? users[0].id : null;

        if (uploaderId) {
            // Get some course IDs
            const [courseRows] = await connection.execute('SELECT id FROM courses LIMIT 2');

            if (courseRows.length > 0) {
                const sampleResources = [
                    {
                        course_id: courseRows[0].id,
                        title: 'SPL Lecture 1 Slides',
                        description: 'Introduction to C Programming',
                        file_path: '/uploads/resources/sample1.pdf', // Dummy path
                        file_size: 1024 * 1024 * 2 // 2MB
                    },
                    {
                        course_id: courseRows[0].id,
                        title: 'SPL Midterm Question 2024',
                        description: 'Previous year question paper',
                        file_path: '/uploads/resources/sample2.pdf', // Dummy path
                        file_size: 1024 * 500 // 500KB
                    }
                ];

                for (const res of sampleResources) {
                    // Check if exists to avoid duplicates on re-run
                    const [existing] = await connection.execute('SELECT id FROM resources WHERE title = ?', [res.title]);
                    if (existing.length === 0) {
                        await connection.execute(
                            `INSERT INTO resources (course_id, title, description, file_path, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)`,
                            [res.course_id, res.title, res.description, res.file_path, res.file_size, uploaderId]
                        );
                    }
                }
                console.log('Sample resources seeded.');
            }
        } else {
            console.log('No users found, skipping resource seeding.');
        }


    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        if (connection) await connection.end();
    }
}

setupResourcesDB();
