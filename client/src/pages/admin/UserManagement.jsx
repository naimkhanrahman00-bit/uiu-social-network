import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(20);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modals
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [userActivity, setUserActivity] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const offset = (currentPage - 1) * limit;
            const params = {
                limit,
                offset,
                search: searchTerm,
                role: roleFilter,
                status: statusFilter
            };

            const response = await api.get('/admin/users', { params });
            setUsers(response.data.data.users);
            setTotal(response.data.data.total);
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async () => {
        try {
            await api.patch(`/admin/users/${selectedUser.id}/role`, { role: newRole });
            setShowRoleModal(false);
            setSelectedUser(null);
            setNewRole('');
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update role');
        }
    };

    const handleSuspend = async () => {
        try {
            await api.patch(`/admin/users/${selectedUser.id}/suspend`);
            setShowSuspendModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update suspension status');
        }
    };

    const handleViewActivity = async (user) => {
        try {
            const response = await api.get(`/admin/users/${user.id}/activity`);
            setUserActivity(response.data.data);
            setSelectedUser(user);
            setShowActivityModal(true);
        } catch (err) {
            alert('Failed to load user activity');
        }
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowRoleModal(true);
    };

    const openSuspendModal = (user) => {
        setSelectedUser(user);
        setShowSuspendModal(true);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(total / limit);

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return 'role-badge admin';
            case 'moderator': return 'role-badge moderator';
            default: return 'role-badge student';
        }
    };

    if (loading && users.length === 0) {
        return <div className="container"><div className="loading-spinner">Loading users...</div></div>;
    }

    return (
        <div className="container user-management">
            <h1>User Management</h1>

            {/* Search and Filters */}
            <div className="filters-section">
                <input
                    type="text"
                    placeholder="Search by name, email, or student ID..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />

                <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                    className="filter-select"
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="student">Student</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="filter-select"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>

                {(searchTerm || roleFilter || statusFilter) && (
                    <button onClick={clearFilters} className="btn btn-secondary">
                        Clear Filters
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Users Table */}
            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Student ID</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.full_name}</td>
                                <td>{user.email}</td>
                                <td>{user.student_id}</td>
                                <td>{user.department_name || 'N/A'}</td>
                                <td>
                                    <span className={getRoleBadgeClass(user.role)}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.is_suspended ? 'suspended' : 'active'}`}>
                                        {user.is_suspended ? 'Suspended' : 'Active'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => openRoleModal(user)}
                                                className="btn-action btn-role"
                                                title="Change Role"
                                            >
                                                👤
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openSuspendModal(user)}
                                            className={`btn-action ${user.is_suspended ? 'btn-unsuspend' : 'btn-suspend'}`}
                                            title={user.is_suspended ? 'Unsuspend' : 'Suspend'}
                                        >
                                            {user.is_suspended ? '✓' : '🚫'}
                                        </button>
                                        <button
                                            onClick={() => handleViewActivity(user)}
                                            className="btn-action btn-activity"
                                            title="View Activity"
                                        >
                                            📊
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && !loading && (
                    <div className="no-results">No users found</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-secondary"
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {currentPage} of {totalPages} ({total} users)
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-secondary"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Role Change Modal */}
            {showRoleModal && (
                <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Change User Role</h2>
                        <p>Change role for <strong>{selectedUser.full_name}</strong></p>
                        <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="form-input">
                            <option value="student">Student</option>
                            <option value="moderator">Moderator</option>
                            {/* Admins can only be set via database */}
                        </select>
                        <div className="modal-buttons">
                            <button onClick={handleRoleChange} className="btn btn-primary">Confirm</button>
                            <button onClick={() => setShowRoleModal(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Confirmation Modal */}
            {showSuspendModal && (
                <div className="modal-overlay" onClick={() => setShowSuspendModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedUser.is_suspended ? 'Unsuspend' : 'Suspend'} User</h2>
                        <p>
                            Are you sure you want to {selectedUser.is_suspended ? 'unsuspend' : 'suspend'} <strong>{selectedUser.full_name}</strong>?
                        </p>
                        <div className="modal-buttons">
                            <button onClick={handleSuspend} className="btn btn-primary">Confirm</button>
                            <button onClick={() => setShowSuspendModal(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Activity Modal */}
            {showActivityModal && userActivity && (
                <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>User Activity</h2>
                        <p><strong>{userActivity.user.full_name}</strong> ({userActivity.user.email})</p>
                        <div className="activity-stats">
                            <div className="stat-item">
                                <span className="stat-label">Lost & Found Posts:</span>
                                <span className="stat-value">{userActivity.activity.lostFoundPosts}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Marketplace Listings:</span>
                                <span className="stat-value">{userActivity.activity.marketplaceListings}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Feedback Posts:</span>
                                <span className="stat-value">{userActivity.activity.feedbackPosts}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Section Exchange Posts:</span>
                                <span className="stat-value">{userActivity.activity.sectionExchangePosts}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Resource Downloads:</span>
                                <span className="stat-value">{userActivity.activity.resourceDownloads}</span>
                            </div>
                            <div className="stat-item total">
                                <span className="stat-label">Total Posts:</span>
                                <span className="stat-value">{userActivity.activity.totalPosts}</span>
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={() => setShowActivityModal(false)} className="btn btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
