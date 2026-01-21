const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        const email = `test_req_${Date.now()}@cse.uiu.ac.bd`;
        const password = 'password123';
        console.log(`Registering user: ${email}`);

        try {
            await axios.post(`${API_URL}/auth/register`, {
                full_name: 'Test Student',
                student_id: `011${Date.now()}`,
                email: email,
                password: password,
                department_id: 1,
                batch: '231',
                contact_info: '01700000000'
            });
        } catch (e) {
            // Ignore if already exists (unlikely with timestamp)
            console.log('Registration error (might exist):', e.response?.data || e.message);
        }

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: email,
            password: password
        });
        const token = loginRes.data.token;
        console.log('Login successful, token obtained.');

        // 3. Get Courses to find a valid course_id
        console.log('Fetching courses...');
        const coursesRes = await axios.get(`${API_URL}/resources/courses`); // Public endpoint
        if (coursesRes.data.length === 0) {
            console.error('No courses found to request resource for.');
            return;
        }
        const courseId = coursesRes.data[0].id;
        console.log(`Using course ID: ${courseId}`);

        // 4. Create Request
        console.log('Creating resource request...');
        const reqRes = await axios.post(
            `${API_URL}/resources/requests`,
            {
                course_id: courseId,
                resource_name: 'Final Exam 2024 Solution',
                description: 'Please upload the solution for last trimester.'
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Request creation response:', reqRes.data);

        // 5. Get My Requests
        console.log('Fetching my requests...');
        const myReqsRes = await axios.get(
            `${API_URL}/resources/requests/my-requests`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('My Requests:', myReqsRes.data);

        if (myReqsRes.data.length > 0 && myReqsRes.data[0].resource_name === 'Final Exam 2024 Solution') {
            console.log('SUCCESS: Verification Passed!');
        } else {
            console.error('FAILURE: Request not found in list.');
        }

    } catch (error) {
        console.error('Verification Failed:', error.response?.data || error.message);
    }
}

verify();
