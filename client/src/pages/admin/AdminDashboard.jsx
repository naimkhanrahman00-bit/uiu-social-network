import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/dashboard');
            setStats(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'user_registered': return '👤';
            case 'lost_found_post': return '🔍';
            case 'marketplace_listing': return '🛒';
            case 'feedback_post': return '💬';
            default: return '📌';
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-spinner">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error-message">{error}</div>
                <button onClick={fetchDashboardStats} className="btn btn-primary">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <button onClick={fetchDashboardStats} className="btn btn-secondary">
                    🔄 Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{stats.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <h3>{stats.totalPosts}</h3>
                        <p>Total Posts</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📥</div>
                    <div className="stat-content">
                        <h3>{stats.totalDownloads}</h3>
                        <p>Total Downloads</p>
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <h3>{stats.pendingApprovals.total}</h3>
                        <p>Pending Approvals</p>
                    </div>
                    {stats.pendingApprovals.total > 0 && (
                        <div className="pending-breakdown">
                            <small>
                                Feedback: {stats.pendingApprovals.feedback} |
                                Section Exchange: {stats.pendingApprovals.sectionExchange} |
                                Section Requests: {stats.pendingApprovals.sectionRequests}
                            </small>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-content">
                {/* Recent Activity */}
                <div className="card activity-feed">
                    <h2>Recent Activity</h2>
                    {stats.recentActivity.length === 0 ? (
                        <p className="no-activity">No recent activity</p>
                    ) : (
                        <div className="activity-list">
                            {stats.recentActivity.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="activity-details">
                                        <p className="activity-description">
                                            {activity.description}
                                        </p>
                                        <span className="activity-time">
                                            {formatTimestamp(activity.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="card quick-links">
                    <h2>Quick Links</h2>
                    <div className="links-grid">
                        <Link to="/admin/resources/upload" className="quick-link-card">
                            <div className="link-icon">📤</div>
                            <h3>Upload Resource</h3>
                            <p>Add new study materials</p>
                        </Link>

                        <Link to="/admin/users" className="quick-link-card">
                            <div className="link-icon">👥</div>
                            <h3>Manage Users</h3>
                            <p>View and manage users</p>
                        </Link>

                        <Link to="/admin/resources/requests" className="quick-link-card">
                            <div className="link-icon">📋</div>
                            <h3>Manage Requests</h3>
                            <p>Review resource requests</p>
                        </Link>

                        <Link to="/admin/courses" className="quick-link-card">
                            <div className="link-icon">📚</div>
                            <h3>Manage Courses</h3>
                            <p>Add/edit courses</p>
                        </Link>

                        <Link to="/feedback/moderation" className="quick-link-card">
                            <div className="link-icon">🛡️</div>
                            <h3>Moderate Feedback</h3>
                            <p>Review pending feedback</p>
                        </Link>

                        <Link to="/admin/marketplace-categories" className="quick-link-card">
                            <div className="link-icon">🏷️</div>
                            <h3>Marketplace Categories</h3>
                            <p>Manage categories</p>
                        </Link>

                        <Link to="/admin/settings" className="quick-link-card">
                            <div className="link-icon">⚙️</div>
                            <h3>System Settings</h3>
                            <p>Configure platform</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
