import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import FeedbackCard from './FeedbackCard';

const FeedbackModeration = () => {
    const [pendingFeedbacks, setPendingFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPendingFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/feedback/pending');
            setPendingFeedbacks(response.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to fetch pending feedbacks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingFeedbacks();
    }, []);

    const handleAction = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this feedback?`)) return;

        try {
            await api.patch(`/feedback/${id}/status`, { status });
            // Remove from list
            setPendingFeedbacks(prev => prev.filter(f => f.id !== id));
            alert(`Feedback ${status} successfully`);
        } catch (err) {
            console.error(err);
            alert(`Failed to ${status} feedback`);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading pending reviews...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Feedback Moderation Queue</h1>

            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            {pendingFeedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <p>No pending feedback to review.</p>
                </div>
            ) : (
                <div className="moderation-list">
                    {pendingFeedbacks.map(feedback => (
                        <div key={feedback.id} style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                zIndex: 10,
                                display: 'flex',
                                gap: '0.5rem'
                            }}>
                                <button
                                    onClick={() => handleAction(feedback.id, 'approved')}
                                    style={{
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleAction(feedback.id, 'rejected')}
                                    style={{
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Reject
                                </button>
                            </div>
                            <FeedbackCard feedback={feedback} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackModeration;
