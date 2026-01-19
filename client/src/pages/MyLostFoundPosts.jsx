import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const MyLostFoundPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/lost-found/my-posts');
            setPosts(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="container" style={{ margin: '2rem auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>My Lost & Found Posts</h2>
                <Link to="/lost-found/new" className="btn btn-primary">Post New Item</Link>
            </div>

            {loading ? (
                <p>Loading your posts...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {posts.length === 0 ? (
                        <p>You haven't posted any items yet.</p>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="card" style={{ padding: '0' }}>
                                {post.image_path ? (
                                    <img
                                        src={`http://localhost:5000${post.image_path}`}
                                        alt={post.title}
                                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '200px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                                        No Image
                                    </div>
                                )}
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div>
                                            <span
                                                style={{
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    color: post.type === 'lost' ? '#ef4444' : '#166534',
                                                    background: post.type === 'lost' ? '#fee2e2' : '#dcfce7',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {post.type}
                                            </span>
                                            <span
                                                style={{
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    color: '#fff',
                                                    background: post.status === 'claimed' || post.status === 'returned' ? '#6b7280' : (post.status === 'lost' ? '#ef4444' : '#166534'),
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    marginLeft: '0.5rem'
                                                }}
                                            >
                                                {post.status}
                                            </span>
                                            {new Date(post.expires_at) < new Date() && (
                                                <span
                                                    style={{
                                                        textTransform: 'uppercase',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        color: '#fff',
                                                        background: '#000',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        marginLeft: '0.5rem'
                                                    }}
                                                >
                                                    EXPIRED
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{post.title}</h3>
                                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        <strong>Category:</strong> {post.category_name}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link to={`/lost-found/${post.id}`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Manage</Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MyLostFoundPosts;
