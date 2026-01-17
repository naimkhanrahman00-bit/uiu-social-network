import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{
            background: 'white',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 0',
            marginBottom: '2rem'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    UIU Social
                </Link>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/login" className="btn" style={{ color: 'var(--text-main)' }}>Login</Link>
                    <Link to="/register" className="btn btn-primary">Register</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
