const axios = require('axios');
const db = require('../config/db');

const API_URL = 'http://localhost:5000/api';

const runVerification = async () => {
    try {
        console.log('Starting Course Management Verification...');

        // 1. Create a temporary admin user
        const adminEmail = `admin_course_${Date.now()}@cse.uiu.ac.bd`;
        const adminPassword = 'password123';

        // Get a department ID first for registration and course creation
        const [depts] = await db.query('SELECT id FROM departments LIMIT 1');
        if (depts.length === 0) {
            console.error('No departments found. Need to seed departments first.');
            process.exit(1);
        }
        const deptId = depts[0].id;

        console.log(`Registering admin: ${adminEmail}`);
        await axios.post(`${API_URL}/auth/register`, {
            full_name: 'Admin User',
            email: adminEmail,
            password: adminPassword,
            student_id: `011${Date.now()}`,
            department_id: deptId,
            batch: '20'
        });

        // Manually promote to admin
        await db.query('UPDATE users SET role = "admin" WHERE email = ?', [adminEmail]);

        // Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: adminEmail,
            password: adminPassword
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Create a new course
        console.log('Creating a new course...');
        const newCourseCode = `TEST${Date.now()}`;

        // deptId is already available from above

        await axios.post(`${API_URL}/resources/courses`, {
            code: newCourseCode,
            name: 'Test Course',
            department_id: deptId,
            trimester: 'Test Trimester'
        }, config);
        console.log('Course created.');

        // 3. Verify course creation
        console.log('Fetching courses...');
        const coursesRes = await axios.get(`${API_URL}/resources/courses`, config);

        const createdCourse = coursesRes.data.find(c => c.code === newCourseCode);
        if (!createdCourse) {
            throw new Error('Course not found in list after creation');
        }
        console.log('Course verified in list.');

        // 4. Update the course
        console.log('Updating course...');
        const updatedName = 'Updated Test Course';
        await axios.put(`${API_URL}/resources/courses/${createdCourse.id}`, {
            code: newCourseCode, // Keep code same
            name: updatedName,
            department_id: deptId,
            trimester: 'Test Trimester'
        }, config);
        console.log('Course updated.');

        // Verify update
        const coursesRes2 = await axios.get(`${API_URL}/resources/courses`, config);
        const updatedCourse = coursesRes2.data.find(c => c.id === createdCourse.id);
        if (updatedCourse.name !== updatedName) {
            throw new Error('Course name update failed');
        }
        console.log('Course update verified.');

        // 5. Delete the course
        console.log('Deleting course...');
        await axios.delete(`${API_URL}/resources/courses/${createdCourse.id}`, config);
        console.log('Course deleted.');

        // Verify deletion
        const coursesRes3 = await axios.get(`${API_URL}/resources/courses`, config);
        if (coursesRes3.data.find(c => c.id === createdCourse.id)) {
            throw new Error('Course still exists after deletion');
        }
        console.log('Course deletion verified.');

        console.log('Verification Successful!');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error.response ? JSON.stringify(error.response.data) : error.message);
        process.exit(1);
    }
};

runVerification();
