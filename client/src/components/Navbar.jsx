import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <Link to="/profile" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                Hello, {user.full_name}
                            </Link>
                            <button onClick={onLogout} className="btn" style={{ background: '#ef4444', color: 'white' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn" style={{ color: 'var(--text-main)' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
