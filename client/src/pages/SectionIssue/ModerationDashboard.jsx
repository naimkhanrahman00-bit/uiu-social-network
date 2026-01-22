import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ModerationDashboard = () => {
    const [exchangePosts, setExchangePosts] = useState([]);
    const [sectionRequests, setSectionRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await api.get('/section-issue/pending');
            setExchangePosts(res.data.exchangePosts);
            setSectionRequests(res.data.sectionRequests);
        } catch (err) {
            console.error("Failed to load pending posts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAction = async (type, id, status) => {
        setActionLoading(`${type}-${id}`);
        try {
            await api.patch(`/section-issue/${type}/${id}/status`, { status });
            // Remove from list locally
            if (type === 'exchange') {
                setExchangePosts(prev => prev.filter(p => p.id !== id));
            } else {
                setSectionRequests(prev => prev.filter(p => p.id !== id));
            }
        } catch (err) {
            console.error(`Failed to ${status} post`, err);
            alert(`Failed to ${status} post`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading pending posts...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Moderation Dashboard</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Pending Exchange Requests ({exchangePosts.length})</h2>
                {exchangePosts.length === 0 ? (
                    <p className="text-gray-500">No pending exchange requests.</p>
                ) : (
                    <div className="grid gap-4">
                        {exchangePosts.map(post => (
                            <div key={post.id} className="bg-white p-4 rounded shadow border flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{post.course_code} - {post.course_name}</h3>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-mono">{post.current_section}</span> &rarr; <span className="font-mono">{post.desired_section}</span>
                                    </p>
                                    <p className="text-sm italic text-gray-500">"{post.note}"</p>
                                    <p className="text-xs text-gray-400 mt-1">By {post.poster_name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction('exchange', post.id, 'rejected')}
                                        disabled={actionLoading === `exchange-${post.id}`}
                                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction('exchange', post.id, 'approved')}
                                        disabled={actionLoading === `exchange-${post.id}`}
                                        className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Pending New Section Requests ({sectionRequests.length})</h2>
                {sectionRequests.length === 0 ? (
                    <p className="text-gray-500">No pending new section requests.</p>
                ) : (
                    <div className="grid gap-4">
                        {sectionRequests.map(req => (
                            <div key={req.id} className="bg-white p-4 rounded shadow border flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{req.course_code} - {req.course_name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Desired: <span className="font-mono">{req.desired_section}</span>
                                    </p>
                                    <p className="text-sm italic text-gray-500">"{req.reason}"</p>
                                    <p className="text-xs text-gray-400 mt-1">By {req.user_name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction('new-section', req.id, 'rejected')}
                                        disabled={actionLoading === `new-section-${req.id}`}
                                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction('new-section', req.id, 'approved')}
                                        disabled={actionLoading === `new-section-${req.id}`}
                                        className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModerationDashboard;
