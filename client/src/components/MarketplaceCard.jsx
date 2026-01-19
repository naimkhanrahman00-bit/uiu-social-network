import React from 'react';
import { Link } from 'react-router-dom';

const MarketplaceCard = ({ listing }) => {
    // Construct absolute URL for the image
    const imageUrl = listing.thumbnail
        ? `http://localhost:5000${listing.thumbnail}`
        : 'https://via.placeholder.com/300x200?text=No+Image';

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(price);
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
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
        return Math.floor(seconds) + " seconds ago";
    };

    const styles = {
        card: {
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            textDecoration: 'none',
            color: 'inherit'
        },
        imageContainer: {
            height: '200px',
            overflow: 'hidden',
            backgroundColor: '#f3f4f6',
            position: 'relative'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        content: {
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
        },
        category: {
            fontSize: '0.75rem',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
        },
        title: {
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#1f2937',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
        },
        priceRow: {
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.5rem',
            marginBottom: '0.5rem'
        },
        price: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#2563eb'
        },
        negotiable: {
            fontSize: '0.75rem',
            color: '#059669',
            backgroundColor: '#d1fae5',
            padding: '2px 6px',
            borderRadius: '4px'
        },
        exchange: {
            fontSize: '0.875rem',
            color: '#7c3aed',
            fontWeight: '500',
            marginBottom: '0.5rem'
        },
        footer: {
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: '#6b7280',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '0.75rem'
        },
        condition: {
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            backgroundColor: '#e5e7eb',
            color: '#374151'
        }
    };

    return (
        <Link to={`/marketplace/${listing.id}`} style={styles.card} className="marketplace-card">
            <div style={styles.imageContainer}>
                <img
                    src={imageUrl}
                    alt={listing.title}
                    style={styles.image}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                />
                <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: listing.listing_type === 'sale' ? '#2563eb' : (listing.listing_type === 'exchange' ? '#7c3aed' : '#db2777'),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }}>
                    {listing.listing_type === 'both' ? 'Sale/Exchange' : listing.listing_type}
                </span>
            </div>

            <div style={styles.content}>
                <div style={styles.category}>{listing.category_name}</div>
                <h3 style={styles.title}>{listing.title}</h3>

                {listing.listing_type !== 'exchange' && (
                    <div style={styles.priceRow}>
                        <span style={styles.price}>{formatPrice(listing.price)}</span>
                        {listing.is_negotiable && <span style={styles.negotiable}>Negotiable</span>}
                    </div>
                )}

                {(listing.listing_type === 'exchange' || listing.listing_type === 'both') && (
                    <div style={styles.exchange}>
                        ⇄ {listing.exchange_for}
                    </div>
                )}

                <div style={styles.footer}>
                    <span style={styles.condition}>
                        {listing.condition_status.replace('_', ' ')}
                    </span>
                    <span>{timeAgo(listing.created_at)}</span>
                </div>
            </div>
        </Link>
    );
};

export default MarketplaceCard;
