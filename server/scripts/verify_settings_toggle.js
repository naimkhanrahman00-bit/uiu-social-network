const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const API_URL = 'http://localhost:5000/api';

async function verify() {
    let connection;
    try {
        console.log('--- Verification: System Settings Toggle ---');

        // 1. Create Admin User
        const email = `admin_settings_${Date.now()}@cse.uiu.ac.bd`;
        const password = 'password123';

        console.log(`Registering user: ${email}`);
        await axios.post(`${API_URL}/auth/register`, {
            full_name: 'Settings Tester',
            student_id: `999${Date.now()}`,
            email: email,
            password: password,
            department_id: 1, // Assuming exists
            batch: '99',
            contact_info: '00000',
            role: 'student' // default
        });

        // 2. Promote to Admin
        console.log('Promoting to admin...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'uiu_social_network'
        });
        await connection.execute('UPDATE users SET role = "admin" WHERE email = ?', [email]);

        // 3. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email, password
        });
        const token = loginRes.data.token;
        console.log('Logged in.');

        // 4. Get Initial Settings
        console.log('Fetching initial settings...');
        const res1 = await axios.get(`${API_URL}/settings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Initial settings:', res1.data);
        const initialVal = res1.data.section_issue_enabled === 'true';

        // 5. Toggle Setting
        const newVal = !initialVal;
        console.log(`Toggling setting to ${newVal}...`);
        await axios.patch(`${API_URL}/settings/section_issue_enabled`, {
            value: newVal
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 6. Verify Change
        console.log('Verifying change...');
        const res2 = await axios.get(`${API_URL}/settings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('New settings:', res2.data);

        if (res2.data.section_issue_enabled === String(newVal)) {
            console.log('SUCCESS: Setting updated correctly.');
        } else {
            console.error('FAILURE: Setting did not update.');
        }

    } catch (error) {
        console.error('Verification Failed:', error.response?.data || error.message);
    } finally {
        if (connection) await connection.end();
    }
}

verify();
