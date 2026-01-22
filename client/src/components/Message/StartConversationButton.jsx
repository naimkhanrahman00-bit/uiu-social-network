import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const StartConversationButton = ({ recipientId, context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleStartConversation = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const initialMessage = context ? `${context}\n\n${message}` : message;

            const response = await api.post('/messages/conversations', {
                recipientId,
                initialMessage
            });

            setIsOpen(false);
            navigate('/messages'); // Ideally navigate to specific conversation
        } catch (error) {
            console.error("Error starting conversation:", error);
            alert("Failed to start conversation.");
        } finally {
            setLoading(false);
        }
    };

    if (!user || parseInt(user.id) === parseInt(recipientId)) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary"
            >
                Message
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Send Message</h3>
                        <form onSubmit={handleStartConversation}>
                            <textarea
                                style={{
                                    width: '100%',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    padding: '0.75rem',
                                    marginBottom: '1rem',
                                    minHeight: '120px',
                                    fontFamily: 'inherit'
                                }}
                                placeholder="Type your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="btn btn-outline"
                                    style={{ marginRight: '0.5rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary"
                                >
                                    {loading ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default StartConversationButton;
