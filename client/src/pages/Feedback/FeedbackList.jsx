import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import FeedbackCard from './FeedbackCard';

const FeedbackList = ({ type }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchFeedbacks = async (pageNum) => {
        try {
            setLoading(true);
            const response = await api.get(`/feedback?type=${type}&page=${pageNum}&limit=5`);
            setFeedbacks(response.data.feedbacks);
            setTotalPages(response.data.totalPages);
            setPage(response.data.page);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch feedbacks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks(1);
    }, [type]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchFeedbacks(newPage);
            window.scrollTo(0, 0); // Scroll to top
        }
    };

    if (loading && page === 1) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;

    return (
        <div className="feedback-list">
            {feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
                    <p>No feedback posts found in this category.</p>
                </div>
            ) : (
                <>
                    {feedbacks.map(feedback => (
                        <FeedbackCard key={feedback.id} feedback={feedback} />
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="btn-secondary"
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                Previous
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="btn-secondary"
                                style={{ padding: '0.5rem 1rem' }}
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

export default FeedbackList;
