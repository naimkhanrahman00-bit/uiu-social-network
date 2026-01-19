import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        student_id: '',
        department_id: '',
        batch: ''
    });
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const { full_name, email, password, student_id, department_id, batch } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setMsg('');

        // Basic validation
        const emailRegex = /^[^\s@]+@[a-zA-Z0-9]+\.uiu\.ac\.bd$/;
        if (!emailRegex.test(email)) {
            return setError('Email must follow the format (e.g., id@cse.uiu.ac.bd)');
        }

        try {
            const res = await api.post('/auth/register', formData);
            setMsg(res.data.message);
            // Optional: Clear form or redirect after delay
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
                {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
                {msg && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{msg}</div>}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" name="full_name" value={full_name} onChange={onChange} className="form-input" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">University Email</label>
                        <input type="email" name="email" value={email} onChange={onChange} className="form-input" placeholder="id@department.uiu.ac.bd" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Student ID</label>
                        <input type="text" name="student_id" value={student_id} onChange={onChange} className="form-input" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Department ID (e.g., 1 for CSE)</label>
                        <input type="number" name="department_id" value={department_id} onChange={onChange} className="form-input" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Batch</label>
                        <input type="text" name="batch" value={batch} onChange={onChange} className="form-input" placeholder="e.g. 211" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} className="form-input" minLength="6" required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
