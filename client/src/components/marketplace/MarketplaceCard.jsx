import React from 'react';
import { Link } from 'react-router-dom';

const MarketplaceCard = ({ listing }) => {
    const { id, title, price, is_negotiable, listing_type, condition_status, thumbnail, created_at, seller_name, seller_image } = listing;

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0
    }).format(price);

    // Relative time
    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    };

    return (
        <div className="card marketplace-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-image" style={{ height: '200px', backgroundColor: '#f3f4f6', overflow: 'hidden', position: 'relative' }}>
                {thumbnail ? (
                    <img
                        src={`http://localhost:5000${thumbnail}`}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                        No Image
                    </div>
                )}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: listing_type === 'sale' ? '#10b981' : listing_type === 'exchange' ? '#8b5cf6' : '#f59e0b',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                }}>
                    {listing_type === 'both' ? 'Sale/Exchange' : listing_type}
                </div>
            </div>

            <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0' }}>
                        <Link to={`/marketplace/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {title.length > 40 ? title.substring(0, 40) + '...' : title}
                        </Link>
                    </h3>
                </div>

                <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        marginRight: '0.5rem'
                    }}>
                        {condition_status.replace('_', ' ')}
                    </span>
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            {formattedPrice}
                        </span>
                        {is_negotiable && <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '4px' }}>(Neg.)</span>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{timeAgo(created_at)}</span>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#d1d5db', marginRight: '8px', overflow: 'hidden' }}>
                        {seller_image ? (
                            <img src={`http://localhost:5000${seller_image}`} alt={seller_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                {seller_name?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{seller_name}</span>
                </div>
            </div>

            <Link to={`/marketplace/${id}`} className="btn btn-block" style={{ margin: '0 1rem 1rem 1rem', textAlign: 'center' }}>
                View Details
            </Link>
        </div>
    );
};

export default MarketplaceCard;
