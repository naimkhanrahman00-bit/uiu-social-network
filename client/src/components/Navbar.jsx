import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { settings } = useSettings();
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
                            <Link to="/lost-found" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                Lost & Found
                            </Link>
                            <Link to="/marketplace" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                Marketplace
                            </Link>
                            <Link to="/resources" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                Resources
                            </Link>
                            <Link to="/marketplace/create" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                Sell Item
                            </Link>
                            {settings?.section_issue_enabled === 'true' && (
                                <Link to="/section-issue" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                    Section Exchange
                                </Link>
                            )}
                            <Link to="/feedback" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                Feedback
                            </Link>
                            <Link to="/messages" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                Messages
                            </Link>
                            {(user.role === 'admin' || user.role === 'moderator') && (
                                <Link to="/feedback/moderation" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                    Moderation
                                </Link>
                            )}
                            {user.role === 'admin' && (
                                <>
                                    <Link to="/admin/dashboard" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                        Dashboard
                                    </Link>
                                    <Link to="/admin/users" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                        Manage Users
                                    </Link>
                                    <Link to="/admin/marketplace-categories" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                        Manage Categories
                                    </Link>
                                    <Link to="/admin/resources/upload" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                        Upload Resource
                                    </Link>
                                    <Link to="/admin/resources/requests" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                        Manage Requests
                                    </Link>
                                    <Link to="/admin/courses" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                        Manage Courses
                                    </Link>
                                    <Link to="/admin/settings" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                        Settings
                                    </Link>
                                </>
                            )}
                            <Link to="/profile" style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', marginRight: '1rem' }}>
                                Hello, {user.full_name}
                            </Link>
                            <NotificationDropdown />
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
