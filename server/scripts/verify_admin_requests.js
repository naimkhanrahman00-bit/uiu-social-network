const axios = require('axios');
const db = require('../config/db'); // Adjust path as needed

const API_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        console.log('--- Starting Verification for Admin - Manage Requests ---');

        // 1. Register Student
        const studentEmail = `student_req_${Date.now()}@cse.uiu.ac.bd`;
        console.log(`Registering student: ${studentEmail}`);
        const studentRes = await axios.post(`${API_URL}/auth/register`, {
            full_name: 'Student Requestor',
            student_id: `011${Date.now()}`,
            email: studentEmail,
            password: 'password123',
            department_id: 1,
            batch: '231',
            contact_info: '01700000000'
        });

        // Login Student
        console.log('Logging in as student...');
        const studentLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: studentEmail,
            password: 'password123'
        });
        const studentToken = studentLoginRes.data.token;
        console.log('Student logged in.');

        // 2. Submit Request
        console.log('Student submitting request...');
        await axios.post(`${API_URL}/resources/requests`, {
            course_id: 1, // Assuming course 1 exists
            resource_name: 'Final Exam 2023',
            description: 'Need final exam question'
        }, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log('Request submitted.');

        // 3. Register Admin
        const adminEmail = `admin_req_${Date.now()}@cse.uiu.ac.bd`;
        console.log(`Registering admin: ${adminEmail}`);
        const adminRes = await axios.post(`${API_URL}/auth/register`, {
            full_name: 'Admin Manager',
            student_id: `011${Date.now() + 1}`,
            email: adminEmail,
            password: 'password123',
            department_id: 1,
            batch: '231',
            contact_info: '01700000000'
        });

        // Promote to Admin
        const connection = await require('mysql2/promise').createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'uiu_social_db'
        });
        await connection.execute('UPDATE users SET role = "admin" WHERE email = ?', [adminEmail]);
        await connection.end();

        // Login Admin
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: adminEmail,
            password: 'password123'
        });
        const adminToken = loginRes.data.token;

        // 4. Fetch Requests
        console.log('Fetching all requests...');
        const requestsRes = await axios.get(`${API_URL}/resources/requests`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const newRequest = requestsRes.data.find(r => r.resource_name === 'Final Exam 2023' && r.user_name === 'Student Requestor');
        if (!newRequest) throw new Error('New request not found in admin list');
        console.log(`Found request ID: ${newRequest.id}`);

        // 5. Approve Request
        console.log('Approving request...');
        await axios.patch(`${API_URL}/resources/requests/${newRequest.id}`, {
            status: 'approved',
            admin_note: 'Will upload soon'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        // 6. Verify Update
        console.log('Verifying status update...');
        const updatedRequestsRes = await axios.get(`${API_URL}/resources/requests`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const updatedRequest = updatedRequestsRes.data.find(r => r.id === newRequest.id);

        if (updatedRequest.status === 'approved' && updatedRequest.admin_note === 'Will upload soon') {
            console.log('SUCCESS: Request status updated correctly!');
            process.exit(0);
        } else {
            console.error('FAILURE: Request status mismatch', updatedRequest);
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

verify();
