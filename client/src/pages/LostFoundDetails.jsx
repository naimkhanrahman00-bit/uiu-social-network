import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const LostFoundDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/lost-found/${id}`);
                setPost(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
                setMsg('Post not found or error loading details.');
            }
        };
        fetchPost();
    }, [id]);

    const onDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/lost-found/${id}`);
            setMsg('Post deleted successfully.');
            setTimeout(() => navigate('/lost-found'), 2000);
        } catch (err) {
            console.error(err);
            setMsg('Error deleting post.');
        }
    };

    const onStatusUpdate = async (newStatus) => {
        try {
            await api.patch(`/lost-found/${id}/status`, { status: newStatus });
            setPost({ ...post, status: newStatus });
            setMsg(`Status updated to ${newStatus}`);
            // Clear message after 3 seconds
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setMsg('Error updating status.');
        }
    };

    const onRenew = async () => {
        try {
            await api.patch(`/lost-found/${id}/renew`);
            // Update local state to reflect new expiration (add 30 days roughly)
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 30);
            setPost({ ...post, expires_at: newDate.toISOString() }); // Simple client-side update
            setMsg('Post renewed successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setMsg('Error renewing post.');
        }
    };

    if (loading) return <div className="container">Loading details...</div>;
    if (!post) return <div className="container">{msg}</div>;

    // Check for id (new) or _id (legacy/mongo)
    const userId = user ? (user.id || user._id) : null;
    const isOwner = user && post && (String(userId) === String(post.user_id));
    const isExpired = post.expires_at && new Date(post.expires_at) < new Date();

    return (
        <div className="container" style={{ margin: '2rem auto', maxWidth: '800px' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>&larr; Back</button>

            {msg && <div style={{ padding: '1rem', background: '#f0f9ff', color: '#0369a1', marginBottom: '1rem', borderRadius: '4px' }}>{msg}</div>}

            <div className="card">
                {isExpired && (
                    <div style={{ background: '#000', color: '#fff', padding: '1rem', marginBottom: '1rem', borderRadius: '4px', textAlign: 'center' }}>
                        <strong>This post has expired and is checking hidden from the public feed.</strong>
                        {isOwner && <div style={{ marginTop: '0.5rem' }}><button onClick={onRenew} className="btn btn-primary" style={{ border: '1px solid white' }}>Renew for 30 Days</button></div>}
                    </div>
                )}
                {post.image_path && (
                    <img
                        src={`http://localhost:5000${post.image_path}`}
                        alt={post.title}
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#f9f9f9', marginBottom: '1.5rem', borderRadius: '4px' }}
                    />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{ margin: '0 0 0.5rem 0' }}>{post.title}</h1>
                        <span
                            style={{
                                textTransform: 'uppercase',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                color: post.type === 'lost' ? '#ef4444' : '#166534',
                                background: post.type === 'lost' ? '#fee2e2' : '#dcfce7',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                marginRight: '1rem'
                            }}
                        >
                            {post.type}
                        </span>
                        <span
                            style={{
                                textTransform: 'uppercase',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                color: '#fff',
                                background: post.status === 'claimed' || post.status === 'returned' ? '#6b7280' : (post.status === 'lost' ? '#ef4444' : '#166534'),
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                marginRight: '1rem'
                            }}
                        >
                            {post.status}
                        </span>
                        <span style={{ color: '#666' }}>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Details</h4>
                        <p><strong>Category:</strong> {post.category_name}</p>
                        <p><strong>Date {post.type === 'found' ? 'Found' : 'Lost'}:</strong> {new Date(post.date_lost_found).toLocaleDateString()}</p>
                        <p><strong>Location:</strong> {post.location}</p>
                        {post.collection_location && (
                            <p style={{ background: '#fffbeb', padding: '0.5rem', border: '1px solid #fcd34d', borderRadius: '4px', color: '#b45309' }}>
                                <strong>Collection Point:</strong> {post.collection_location}
                            </p>
                        )}
                    </div>
                    <div>
                        <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Description</h4>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{post.description}</p>
                    </div>
                </div>

                {post.name_on_card && (
                    <div style={{ marginBottom: '2rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                        <h4>ID Card Information</h4>
                        <p><strong>Name on Card:</strong> {post.name_on_card}</p>
                        <p><strong>Student ID:</strong> {post.card_student_id}</p>
                        <p><strong>Department:</strong> {post.card_department}</p>
                    </div>
                )}

                <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <h3>Contact Information</h3>
                    <p><strong>Posted by:</strong> {post.full_name}</p>
                    {/* In a real app, we might check privacy settings before showing email */}
                    <p><strong>Email:</strong> <a href={`mailto:${post.email}`}>{post.email}</a></p>

                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {!isOwner && (
                            <a href={`mailto:${post.email}?subject=Regarding your ${post.type} item: ${post.title}`} className="btn btn-primary">
                                Contact via Email
                            </a>
                        )}
                        {isOwner && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <strong>Update Status:</strong>
                                    <select
                                        value={post.status}
                                        onChange={(e) => onStatusUpdate(e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: '4px' }}
                                    >
                                        <option value="lost">Lost</option>
                                        <option value="found">Found</option>
                                        <option value="claimed">Claimed</option>
                                        <option value="returned">Returned</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => navigate(`/lost-found/edit/${id}`)} className="btn btn-outline">Edit</button>
                                    <button onClick={onDelete} className="btn btn-danger" style={{ background: '#ef4444', color: 'white', border: 'none' }}>Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LostFoundDetails;
