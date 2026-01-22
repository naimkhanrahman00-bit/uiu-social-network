import { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(20);
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        moderators: 0,
        suspended: 0
    });

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const offset = (currentPage - 1) * limit;
            const params = {
                limit,
                offset,
                ...(search && { search }),
                ...(roleFilter && { role: roleFilter }),
                ...(statusFilter && { status: statusFilter })
            };

            const response = await api.get('/admin/users', { params });
            setUsers(response.data.data.users);
            setTotal(response.data.data.total);

            // Calculate stats
            const allParams = { limit: 1000, offset: 0 };
            const allUsers = await api.get('/admin/users', { params: allParams });
            const allUsersData = allUsers.data.data.users;

            setStats({
                total: allUsersData.length,
                admins: allUsersData.filter(u => u.role === 'admin').length,
                moderators: allUsersData.filter(u => u.role === 'moderator').length,
                suspended: allUsersData.filter(u => u.is_suspended).length
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, search, roleFilter, statusFilter]);

    // Handle role change
    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            return;
        }

        try {
            const response = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            if (response.data.success) {
                alert(response.data.message);
                fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert(error.response?.data?.message || 'Failed to update user role');
        }
    };

    // Handle suspend toggle
    const handleSuspendToggle = async (userId, currentStatus) => {
        const action = currentStatus ? 'unsuspend' : 'suspend';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        try {
            const response = await api.patch(`/admin/users/${userId}/suspend`);
            if (response.data.success) {
                alert(response.data.message);
                fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error toggling suspension:', error);
            alert(error.response?.data?.message || 'Failed to update user status');
        }
    };

    // Pagination
    const totalPages = Math.ceil(total / limit);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Role badge styling
    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return 'role-badge admin';
            case 'moderator': return 'role-badge moderator';
            default: return 'role-badge student';
        }
    };

    return (
        <div className="users-container">
            <div className="users-header">
                <h1>User Management</h1>
                <p>Manage user accounts, roles, and permissions</p>
            </div>

            {/* Statistics Cards */}
            <div className="users-stats">
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.admins}</div>
                    <div className="stat-label">Admins</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.moderators}</div>
                    <div className="stat-label">Moderators</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.suspended}</div>
                    <div className="stat-label">Suspended</div>
                </div>
            </div>

            {/* Filters */}
            <div className="users-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name, email, or student ID..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="student">Student</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="loading">Loading users...</div>
            ) : (
                <>
                    <div className="users-table-wrapper">
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
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="no-data">No users found</td>
                                    </tr>
                                ) : (
                                    users.map(user => (
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
                                            <td className="actions-cell">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="role-select"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="moderator">Moderator</option>
                                                    <option value="admin">Admin</option>
                                                </select>

                                                <button
                                                    className={`btn-suspend ${user.is_suspended ? 'unsuspend' : 'suspend'}`}
                                                    onClick={() => handleSuspendToggle(user.id, user.is_suspended)}
                                                >
                                                    {user.is_suspended ? '✓ Unsuspend' : '✕ Suspend'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {currentPage} of {totalPages} ({total} total users)
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Users;
