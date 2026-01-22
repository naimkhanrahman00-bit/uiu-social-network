import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Messages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollingRef = useRef(null);

    // Initial Load
    useEffect(() => {
        fetchConversations();
        return () => stopPolling();
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle conversation selection (Polling & Fetching)
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            startPolling(selectedConversation.id);
            markAsRead(selectedConversation.id);
        } else {
            stopPolling();
        }
    }, [selectedConversation]);

    const startPolling = (conversationId) => {
        stopPolling();
        pollingRef.current = setInterval(() => {
            fetchMessages(conversationId, true);
            // Also refresh conversation list to update last message/time/unread counts for others
            fetchConversations(true);
        }, 3000); // Poll every 3 seconds
    };

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    const fetchConversations = async (silent = false) => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data);
            if (!silent) setLoading(false);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            if (!silent) setLoading(false);
        }
    };

    const fetchMessages = async (conversationId, silent = false) => {
        try {
            const res = await api.get(`/messages/${conversationId}`);
            setMessages(res.data);
            if (!silent && res.data.length > 0) {
                // Mark as read if we have unread messages (optimized to simple call)
                markAsRead(conversationId);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            await api.patch(`/messages/${conversationId}/read`);
            // Update local badge count logic involves refetching conversations usually
        } catch (err) {
            console.error("Error marking read:", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await api.post(`/messages/${selectedConversation.id}`, {
                content: newMessage
            });

            setNewMessage('');
            fetchMessages(selectedConversation.id); // Refresh immediately
            fetchConversations(true); // Update sidebar
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading messages...</div>;

    return (
        <div className="container" style={{ margin: '2rem auto', maxWidth: '1000px', height: 'calc(100vh - 120px)' }}>
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
                <div style={{ borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
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
                                        background: selectedConversation?.id === conv.id ? '#eff6ff' : (conv.unread_count > 0 ? '#f0fdf4' : 'white'),
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}
                                >
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
                                                {conv.last_message || 'Start chatting...'}
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
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#fff' }}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: 'white', flexShrink: 0 }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                                    {selectedConversation.other_user_name}
                                </h3>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                    {selectedConversation.other_user_email}
                                </div>
                            </div>

                            {/* Messages List */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '1rem',
                                background: '#f9fafb',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}>
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: isMe ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <div style={{
                                                maxWidth: '70%',
                                                background: isMe ? '#2563eb' : 'white',
                                                color: isMe ? 'white' : '#1f2937',
                                                padding: '0.75rem 1rem',
                                                borderRadius: isMe ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                border: isMe ? 'none' : '1px solid #e5e7eb'
                                            }}>
                                                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                                <div style={{
                                                    fontSize: '0.7rem',
                                                    marginTop: '0.25rem',
                                                    textAlign: 'right',
                                                    color: isMe ? 'rgba(255,255,255,0.8)' : '#9ca3af'
                                                }}>
                                                    {formatTime(msg.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', background: 'white', flexShrink: 0 }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '9999px',
                                            outline: 'none',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}
                                        className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="btn btn-primary"
                                        style={{ borderRadius: '9999px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#d1d5db' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '1rem', color: '#374151' }}>Your Messages</h3>
                            <p style={{ marginTop: '0.5rem' }}>Select a conversation to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .container { height: auto !important; }
                    .container > div { grid-template-columns: 1fr !important; height: 600px !important; }
                    div[style*="borderRight"] { border-right: none !important; border-bottom: 1px solid #e5e7eb; height: 150px; }
                }
            `}</style>
        </div>
    );
};

export default Messages;
