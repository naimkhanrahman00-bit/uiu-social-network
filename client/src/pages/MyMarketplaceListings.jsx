import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyMarketplaceListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        fetchMyListings();
    }, []);

    const fetchMyListings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/marketplace/my-listings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListings(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load your listings.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;

        try {
            await axios.delete(`http://localhost:5000/api/marketplace/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListings(listings.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete listing');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/marketplace/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setListings(listings.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            ));
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#1f2937' }}>My Listings</h2>
                <Link to="/marketplace/create" className="btn btn-primary">
                    + Create New Listing
                </Link>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {listings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>
                    <p>You haven't posted any listings yet.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: '#4b5563' }}>Item</th>
                                <th style={{ padding: '1rem', color: '#4b5563' }}>Price</th>
                                <th style={{ padding: '1rem', color: '#4b5563' }}>Status</th>
                                <th style={{ padding: '1rem', color: '#4b5563' }}>Date Posted</th>
                                <th style={{ padding: '1rem', color: '#4b5563', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '4px', background: '#e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                                            {item.thumbnail ? (
                                                <img src={`http://localhost:5000${item.thumbnail}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>No Img</div>
                                            )}
                                        </div>
                                        <div>
                                            <Link to={`/marketplace/${item.id}`} style={{ fontWeight: '500', color: '#1f2937', textDecoration: 'none' }}>
                                                {item.title}
                                            </Link>
                                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.category_name}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                        {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(item.price)}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            background: item.status === 'active' ? '#dcfce7' : item.status === 'sold' ? '#fee2e2' : '#fef3c7',
                                            color: item.status === 'active' ? '#166534' : item.status === 'sold' ? '#991b1b' : '#92400e'
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {item.status === 'active' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(item.id, 'sold')}
                                                    className="btn btn-sm btn-outline"
                                                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                                                >
                                                    Mark Sold
                                                </button>
                                            )}
                                            <Link
                                                to={`/marketplace/edit/${item.id}`}
                                                className="btn btn-sm btn-outline"
                                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', color: '#2563eb', borderColor: '#2563eb' }}
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="btn btn-sm btn-outline"
                                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: '#ef4444' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyMarketplaceListings;
