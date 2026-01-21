const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const db = require('../config/db'); // Adjust path as needed

const API_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        console.log('--- Starting Verification for Admin Resource Upload ---');

        // 1. Create/Get Admin User
        const email = `admin_test_${Date.now()}@cse.uiu.ac.bd`;
        const password = 'password123';

        console.log(`Registering user: ${email}`);
        await axios.post(`${API_URL}/auth/register`, {
            full_name: 'Admin Test',
            student_id: `011${Date.now()}`,
            email: email,
            password: password,
            department_id: 1,
            batch: '231',
            contact_info: '01700000000'
        });

        // 2. Promote to Admin (Direct DB access needed)
        console.log('Promoting user to admin...');
        const connection = await require('mysql2/promise').createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'uiu_social_db'
        });

        await connection.execute('UPDATE users SET role = "admin" WHERE email = ?', [email]);
        await connection.end();

        // 3. Login
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: email,
            password: password
        });
        const token = loginRes.data.token;
        console.log('Login successful.');

        // 4. Create Dummy PDF
        const pdfPath = 'dummy_resource.pdf';
        fs.writeFileSync(pdfPath, '%PDF-1.4\n%...\nCurrently just a dummy file content pretending to be PDF.');

        // 5. Upload Resource
        console.log('Uploading resource...');
        const form = new FormData();
        form.append('course_id', 11); // Assuming course ID 11 exists from previous steps
        form.append('title', 'Test Uploaded Resource');
        form.append('description', 'This is a test upload from verification script.');
        form.append('file', fs.createReadStream(pdfPath), {
            filename: 'dummy_resource.pdf',
            contentType: 'application/pdf'
        });

        const uploadRes = await axios.post(`${API_URL}/resources`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Upload response:', uploadRes.data);

        if (uploadRes.status === 201) {
            console.log('SUCCESS: Resource uploaded successfully!');
        } else {
            console.error('FAILURE: Unexpected status code', uploadRes.status);
        }

        // Cleanup
        fs.unlinkSync(pdfPath);

    } catch (error) {
        console.error('Verification Failed:', error.response?.data || error.message);
    }
}

verify();
