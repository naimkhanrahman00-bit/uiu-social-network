import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const LostFoundFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // 'all', 'lost', 'found'
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPosts = async () => {
        setLoading(true);
        try {
            let query = '/lost-found?';
            if (filterType !== 'all') query += `type=${filterType}&`;
            if (searchTerm) query += `search=${searchTerm}&`;

            const res = await api.get(query);
            setPosts(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [filterType]); // Fetch when filter changes

    // Debounce search slightly or just use a button. For now, effect.
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPosts();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <div className="container" style={{ margin: '2rem auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Lost & Found Feed</h2>
                <Link to="/lost-found/new" className="btn btn-primary">Post Item</Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${filterType === 'all' ? 'btn-primary' : ''}`}
                        onClick={() => setFilterType('all')}
                    >All</button>
                    <button
                        className={`btn ${filterType === 'lost' ? 'btn-primary' : ''}`}
                        onClick={() => setFilterType('lost')}
                    >Lost Items</button>
                    <button
                        className={`btn ${filterType === 'found' ? 'btn-primary' : ''}`}
                        onClick={() => setFilterType('found')}
                    >Found Items</button>
                </div>
                <input
                    type="text"
                    placeholder="Search items..."
                    className="form-input"
                    style={{ flex: 1, minWidth: '200px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <p>Loading posts...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {posts.length === 0 ? (
                        <p>No posts found.</p>
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
                                        <span style={{ fontSize: '0.875rem', color: '#666' }}>
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{post.title}</h3>
                                    <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                        {post.location}
                                    </p>
                                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        <strong>Category:</strong> {post.category_name}
                                    </p>
                                    <Link to={`/lost-found/${post.id}`} className="btn btn-outline" style={{ width: '100%', display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>View Details</Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default LostFoundFeed;
