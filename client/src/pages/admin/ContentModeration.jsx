import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './ContentModeration.css';

const ContentModeration = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        search: '',
        sortBy: 'newest'
    });
    const [pagination, setPagination] = useState({
        limit: 20,
        offset: 0,
        total: 0
    });
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        contentType: '',
        contentId: null,
        contentTitle: ''
    });

    useEffect(() => {
        fetchContent();
    }, [filters, pagination.offset]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                type: filters.type,
                status: filters.status,
                search: filters.search,
                sortBy: filters.sortBy,
                limit: pagination.limit,
                offset: pagination.offset
            });

            const response = await api.get(`/admin/content?${params}`);
            if (response.data.success) {
                setContent(response.data.data.content);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.data.total
                }));
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            alert('Failed to fetch content. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, search: value }));
        setPagination(prev => ({ ...prev, offset: 0 }));
    };

    const handleDelete = async () => {
        try {
            const { contentType, contentId } = deleteModal;
            const response = await api.delete(`/admin/content/${contentType}/${contentId}`);

            if (response.data.success) {
                alert(`Content deleted successfully (${response.data.data.deletionType} delete)`);
                setDeleteModal({ show: false, contentType: '', contentId: null, contentTitle: '' });
                fetchContent(); // Refresh the list
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Failed to delete content. Please try again.');
        }
    };

    const openDeleteModal = (item) => {
        setDeleteModal({
            show: true,
            contentType: item.content_type,
            contentId: item.id,
            contentTitle: item.title
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, contentType: '', contentId: null, contentTitle: '' });
    };

    const getTypeBadgeClass = (type) => {
        const typeMap = {
            lost_found: 'badge-lost-found',
            marketplace: 'badge-marketplace',
            feedback: 'badge-feedback',
            section_exchange: 'badge-section-exchange',
            section_request: 'badge-section-request'
        };
        return typeMap[type] || 'badge-default';
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            active: 'status-active',
            pending: 'status-pending',
            approved: 'status-approved',
            rejected: 'status-rejected',
            deleted: 'status-deleted',
            lost: 'status-lost',
            found: 'status-found',
            claimed: 'status-claimed',
            sold: 'status-sold',
            exchanged: 'status-exchanged'
        };
        return statusMap[status] || 'status-default';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePreviousPage = () => {
        setPagination(prev => ({
            ...prev,
            offset: Math.max(0, prev.offset - prev.limit)
        }));
    };

    const handleNextPage = () => {
        setPagination(prev => ({
            ...prev,
            offset: prev.offset + prev.limit
        }));
    };

    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <div className="content-moderation-container">
            <div className="moderation-header">
                <h1>Content Moderation</h1>
                <p>Manage all content across the platform</p>
            </div>

            {/* Filters */}
            <div className="moderation-filters">
                <div className="filter-group">
                    <label>Content Type:</label>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="lost_found">Lost & Found</option>
                        <option value="marketplace">Marketplace</option>
                        <option value="feedback">Feedback</option>
                        <option value="section_exchange">Section Exchange</option>
                        <option value="section_request">Section Requests</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Status:</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="deleted">Deleted</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Sort By:</label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>

                <div className="filter-group search-group">
                    <label>Search:</label>
                    <input
                        type="text"
                        placeholder="Search by title or content..."
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {/* Content Table */}
            {loading ? (
                <div className="loading-state">Loading content...</div>
            ) : content.length === 0 ? (
                <div className="empty-state">No content found with the selected filters.</div>
            ) : (
                <div className="content-table-container">
                    <table className="content-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {content.map((item) => (
                                <tr key={`${item.content_type}-${item.id}`}>
                                    <td>
                                        <span className={`type-badge ${getTypeBadgeClass(item.content_type)}`}>
                                            {item.content_type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="content-title">
                                        <div className="title-wrapper">
                                            <strong>{item.title}</strong>
                                            {item.content && (
                                                <p className="content-preview">
                                                    {item.content.substring(0, 100)}
                                                    {item.content.length > 100 ? '...' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td>{item.author_name}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(item.created_at)}</td>
                                    <td>
                                        <button
                                            className="delete-btn"
                                            onClick={() => openDeleteModal(item)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && content.length > 0 && (
                <div className="pagination-controls">
                    <div className="pagination-info">
                        Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} items
                    </div>
                    <div className="pagination-buttons">
                        <button
                            onClick={handlePreviousPage}
                            disabled={pagination.offset === 0}
                        >
                            Previous
                        </button>
                        <span className="page-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={pagination.offset + pagination.limit >= pagination.total}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="modal-overlay" onClick={closeDeleteModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this content?</p>
                        <p className="modal-content-title"><strong>{deleteModal.contentTitle}</strong></p>
                        <p className="modal-warning">
                            ⚠️ This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeDeleteModal}>
                                Cancel
                            </button>
                            <button className="btn-confirm-delete" onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentModeration;
