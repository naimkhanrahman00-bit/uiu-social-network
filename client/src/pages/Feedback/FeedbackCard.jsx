import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const FeedbackCard = ({ feedback }) => {
    const { user } = useAuth();
    const isCanteen = feedback.feedback_type === 'canteen';
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Admin Response State
    const [responseContent, setResponseContent] = useState('');
    const [submittingResponse, setSubmittingResponse] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState(feedback); // Local state to update immediately

    const openLightbox = (img) => {
        setSelectedImage(img);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setSelectedImage(null);
    };

    const handleResponseSubmit = async (e) => {
        e.preventDefault();
        if (!responseContent.trim()) return;

        setSubmittingResponse(true);
        try {
            await api.post(`/feedback/${currentFeedback.id}/respond`, { response: responseContent });

            // Optimistic update or refetch needed. Simple optimistic update:
            setCurrentFeedback({
                ...currentFeedback,
                admin_response: responseContent,
                admin_response_at: new Date().toISOString(),
                admin_responder_name: user.full_name
            });
            setResponseContent('');
        } catch (error) {
            console.error("Failed to submit response", error);
            alert("Failed to submit response");
        } finally {
            setSubmittingResponse(false);
        }
    };

    const isAdmin = user && user.role === 'admin';

    return (
        <div className="feedback-card" style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            border: '1px solid #eee'
        }}>
            <div className="feedback-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem'
            }}>
                <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {currentFeedback.is_anonymous ? (
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>?</span>
                        </div>
                    ) : (
                        <img
                            src={currentFeedback.author_avatar ? `http://localhost:5000${currentFeedback.author_avatar}` : 'https://via.placeholder.com/40'}
                            alt={currentFeedback.author_name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    )}
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#333' }}>
                            {currentFeedback.is_anonymous ? 'Anonymous Student' : currentFeedback.author_name}
                        </h4>
                        {!currentFeedback.is_anonymous && currentFeedback.author_department && (
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>{currentFeedback.author_department}</span>
                        )}
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>
                            {new Date(currentFeedback.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div className="status-badge" style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    background: currentFeedback.status === 'approved' ? '#e8f5e9' : '#fff3e0',
                    color: currentFeedback.status === 'approved' ? '#2e7d32' : '#ef6c00'
                }}>
                    {currentFeedback.status.charAt(0).toUpperCase() + currentFeedback.status.slice(1)}
                </div>
            </div>

            <div className="feedback-content">
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#333' }}>{currentFeedback.title}</h3>
                <p style={{ margin: 0, color: '#555', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{currentFeedback.content}</p>
            </div>

            {isCanteen && currentFeedback.images && currentFeedback.images.length > 0 && (
                <div className="feedback-images" style={{ marginTop: '1rem', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                    {currentFeedback.images.map((img, index) => (
                        <img
                            key={index}
                            src={`http://localhost:5000${img}`}
                            alt={`Feedback attachment ${index + 1}`}
                            onClick={() => openLightbox(`http://localhost:5000${img}`)}
                            style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: '1px solid #eee'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Admin Response Display */}
            {currentFeedback.admin_response && (
                <div className="admin-response" style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderLeft: '4px solid #007bff',
                    borderRadius: '4px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{
                            background: '#007bff',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            marginRight: '8px'
                        }}>ADMIN RESPONSE</span>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                            by {currentFeedback.admin_responder_name} • {new Date(currentFeedback.admin_response_at).toLocaleDateString()}
                        </span>
                    </div>
                    <p style={{ margin: 0, color: '#333', fontSize: '0.95rem' }}>{currentFeedback.admin_response}</p>
                </div>
            )}

            {/* Admin Response Input */}
            {isAdmin && !currentFeedback.admin_response && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <form onSubmit={handleResponseSubmit}>
                        <textarea
                            value={responseContent}
                            onChange={(e) => setResponseContent(e.target.value)}
                            placeholder="Write an official response..."
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                minHeight: '80px',
                                marginBottom: '0.5rem',
                                fontFamily: 'inherit'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={submittingResponse}
                                style={{
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    opacity: submittingResponse ? 0.7 : 1
                                }}
                            >
                                {submittingResponse ? 'Posting...' : 'Post Response'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Simple Lightbox */}
            {lightboxOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    cursor: 'pointer'
                }} onClick={closeLightbox}>
                    <img
                        src={selectedImage}
                        alt="Full size"
                        style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '4px' }}
                    />
                </div>
            )}
        </div>
    );
};

export default FeedbackCard;
