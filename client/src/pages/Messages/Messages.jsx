import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Messages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setLoading(false);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading messages...</div>;

    return (
        <div className="container" style={{ margin: '2rem auto', maxWidth: '1000px', height: 'calc(100vh - 100px)' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '300px 1fr',
                gap: '1rem',
                height: '100%',
                background: 'white',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden'
            }}>
                {/* Sidebar: Conversation List */}
                <div style={{ borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Messages</h2>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {conversations.length === 0 ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
                                No conversations yet.
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Browse the marketplace to start chatting!</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid #f3f4f6',
                                        cursor: 'pointer',
                                        background: selectedConversation?.id === conv.id ? '#eff6ff' : 'white',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}
                                    onMouseOver={(e) => { if (selectedConversation?.id !== conv.id) e.currentTarget.style.background = '#f9fafb' }}
                                    onMouseOut={(e) => { if (selectedConversation?.id !== conv.id) e.currentTarget.style.background = 'white' }}
                                >
                                    {/* Avatar Placeholder */}
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#d1d5db',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        color: '#374151',
                                        flexShrink: 0
                                    }}>
                                        {conv.other_user_name.charAt(0)}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <h4 style={{ fontWeight: '600', fontSize: '0.95rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {conv.other_user_name}
                                            </h4>
                                            {conv.last_message_at && (
                                                <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0 }}>
                                                    {formatTime(conv.last_message_at)}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.85rem',
                                                color: conv.unread_count > 0 ? '#1f2937' : '#6b7280',
                                                fontWeight: conv.unread_count > 0 ? '600' : 'normal',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {conv.last_message || 'No messages yet'}
                                            </p>
                                            {conv.unread_count > 0 && (
                                                <span style={{
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold',
                                                    borderRadius: '9999px',
                                                    minWidth: '18px',
                                                    height: '18px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '0 4px',
                                                    marginLeft: '0.5rem'
                                                }}>
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content: Chat Area */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', color: '#6b7280' }}>
                    {selectedConversation ? (
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedConversation.other_user_name}</h3>
                            <p style={{ marginTop: '0.5rem' }}>Chat functionality coming soon in Story 7.3</p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ margin: '0 auto', color: '#d1d5db' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '1rem', color: '#374151' }}>Your Messages</h3>
                            <p style={{ marginTop: '0.5rem' }}>Select a conversation to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Mobile Responsive Style */}
            <style>{`
                @media (max-width: 768px) {
                    .container { height: auto !important; }
                    .container > div { grid-template-columns: 1fr !important; height: 600px !important; }
                    div[style*="borderRight"] { border-right: none !important; border-bottom: 1px solid #e5e7eb; height: 300px; }
                }
            `}</style>
        </div>
    );
};

export default Messages;
