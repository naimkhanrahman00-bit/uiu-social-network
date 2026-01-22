import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import StartConversationButton from '../components/Message/StartConversationButton';

const MarketplaceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [listing, setListing] = useState(null);
    const [otherListings, setOtherListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        fetchListingDetails();
    }, [id]);

    useEffect(() => {
        if (listing && listing.user_id) {
            fetchOtherListings();
        }
    }, [listing]);

    const fetchListingDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/marketplace/${id}`);
            setListing(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching listing details:', err);
            setError('Failed to load listing details. It may have been removed.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOtherListings = async () => {
        try {
            // Fetch 4 listings from the same user, excluding current one
            const res = await axios.get(`http://localhost:5000/api/marketplace?user_id=${listing.user_id}&limit=4`);
            // Filter out current listing
            const others = res.data.listings.filter(item => item.id !== parseInt(id));
            setOtherListings(others.slice(0, 3)); // Show max 3
        } catch (err) {
            console.error('Error fetching likely listings:', err);
        }
    };

    const handleBack = () => {
        navigate('/marketplace');
    };

    const nextImage = () => {
        if (!listing || !listing.images) return;
        setActiveImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        if (!listing || !listing.images) return;
        setActiveImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
    };

    const formattedPrice = listing ? new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0
    }).format(listing.price) : '';

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;

        try {
            await axios.delete(`http://localhost:5000/api/marketplace/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Listing deleted successfully');
            navigate('/marketplace');
        } catch (err) {
            console.error(err);
            alert('Failed to delete listing');
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>Loading details...</div>;
    if (error) return (
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="alert alert-error" style={{ display: 'inline-block' }}>{error}</div>
            <div style={{ marginTop: '1rem' }}>
                <button onClick={handleBack} className="btn btn-primary">Back to Marketplace</button>
            </div>
        </div>
    );
    if (!listing) return null;

    const isOwner = user && user.id === listing.user_id;

    return (
        <div className="container">
            <button onClick={handleBack} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
                &larr; Back to Marketplace
            </button>

            <div className="listing-details-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '2rem' }}>

                {/* Left Column: Images */}
                <div className="listing-images-section">
                    <div className="main-image-container" style={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        aspectRatio: '4/3',
                        position: 'relative',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {listing.images && listing.images.length > 0 ? (
                            <>
                                <img
                                    src={`http://localhost:5000${listing.images[activeImageIndex]}`}
                                    alt={listing.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                                {listing.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            style={{
                                                position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%',
                                                width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            &#10094;
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            style={{
                                                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%',
                                                width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            &#10095;
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div style={{ color: '#9ca3af' }}>No Images Available</div>
                        )}

                        <div style={{
                            position: 'absolute',
                            top: '15px',
                            left: '15px',
                            background: listing.listing_type === 'sale' ? '#10b981' : listing.listing_type === 'exchange' ? '#8b5cf6' : '#f59e0b',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            textTransform: 'capitalize',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {listing.listing_type === 'both' ? 'Sale / Exchange' : listing.listing_type}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {listing.images && listing.images.length > 1 && (
                        <div className="thumbnails-scroll" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                            {listing.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    style={{
                                        width: '80px',
                                        height: '60px',
                                        flexShrink: 0,
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: activeImageIndex === idx ? '2px solid var(--primary-color)' : '2px solid transparent',
                                        opacity: activeImageIndex === idx ? 1 : 0.7
                                    }}
                                >
                                    <img src={`http://localhost:5000${img}`} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="listing-info-section">
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                background: '#e5e7eb',
                                color: '#4b5563',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                display: 'inline-block',
                                marginBottom: '0.5rem'
                            }}>
                                {listing.category_name}
                            </span>
                            <h1 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#1f2937' }}>{listing.title}</h1>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                    Posted on {formatDate(listing.created_at)}
                                </div>
                                <div style={{
                                    padding: '4px 8px',
                                    background: listing.condition_status === 'new' ? '#d1fae5' : '#f3f4f6',
                                    color: listing.condition_status === 'new' ? '#065f46' : '#374151',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    textTransform: 'uppercase'
                                }}>
                                    {listing.condition_status.replace('_', ' ')}
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '1.5rem 0' }} />

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                                {formattedPrice}
                            </div>
                            {listing.is_negotiable && (
                                <div style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                                    Price is Negotiable
                                </div>
                            )}

                            {(listing.listing_type === 'exchange' || listing.listing_type === 'both') && listing.exchange_for && (
                                <div style={{ marginTop: '1rem', background: '#fef3c7', padding: '1rem', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                                    <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.25rem' }}>Looking to Exchange For:</strong>
                                    <p style={{ margin: 0, color: '#b45309' }}>{listing.exchange_for}</p>
                                </div>
                            )}
                        </div>

                        <div className="description-box" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'inline-block', paddingBottom: '4px' }}>Description</h3>
                            <p style={{ whiteSpace: 'pre-wrap', color: '#374151', lineHeight: '1.6' }}>
                                {listing.description}
                            </p>
                        </div>

                        <div className="seller-box" style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '1rem', color: '#4b5563' }}>Seller Information</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#d1d5db', overflow: 'hidden' }}>
                                    {listing.seller_image ? (
                                        <img src={`http://localhost:5000${listing.seller_image}`} alt={listing.seller_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#6b7280' }}>
                                            {listing.seller_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{listing.seller_name}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{listing.seller_department_name}</div>
                                </div>
                            </div>

                            {isOwner ? (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={handleDelete}
                                        className="btn btn-outline"
                                        style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                                    >
                                        Delete Listing
                                    </button>
                                    <Link
                                        to={`/marketplace/edit/${id}`}
                                        className="btn btn-primary"
                                        style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                                    >
                                        Edit Listing
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ width: '100%' }}>
                                    <StartConversationButton
                                        recipientId={listing.user_id}
                                        context={`Hi, I'm interested in your listing: "${listing.title}"`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Other Listings from this Seller */}
            {
                otherListings.length > 0 && (
                    <div style={{ marginTop: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1f2937' }}>More from {listing.seller_name}</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {otherListings.map(item => (
                                <Link to={`/marketplace/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: 'white',
                                        transition: 'transform 0.2s',
                                        height: '100%'
                                    }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ height: '150px', background: '#f3f4f6' }}>
                                            {item.thumbnail ? (
                                                <img src={`http://localhost:5000${item.thumbnail}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Image</div>
                                            )}
                                        </div>
                                        <div style={{ padding: '1rem' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h3>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                                {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(item.price)}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )
            }

            <style>{`
                @media (max-width: 768px) {
                    .listing-details-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div >
    );
};

export default MarketplaceDetails;
