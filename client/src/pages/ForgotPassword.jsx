import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [debugLink, setDebugLink] = useState('');
    const [error, setError] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        setDebugLink('');

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMsg(res.data.message);
            if (res.data.debug_link) {
                setDebugLink(res.data.debug_link);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Forgot Password</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
                    Enter your email to receive a reset link.
                </p>

                {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
                {msg && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{msg}</div>}

                {debugLink && (
                    <div style={{ background: '#fff7ed', border: '1px solid #fdba74', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', overflowWrap: 'break-word' }}>
                        <strong>Debug Link (Dev Only):</strong><br />
                        <a href={debugLink}>{debugLink}</a>
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Send Link</button>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
