import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackList from './FeedbackList';
import './FeedbackDashboard.css';

const FeedbackDashboard = () => {
    const [activeTab, setActiveTab] = useState('general');
    const navigate = useNavigate();

    return (
        <div className="feedback-dashboard container">
            <div className="feedback-header-section" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1>Student Feedback</h1>
                    <p style={{ color: '#666' }}>Voice your opinions and help improve our campus.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/feedback/general')}
                        className="btn-primary"
                    >
                        Post General Issue
                    </button>
                    <button
                        onClick={() => navigate('/feedback/canteen')}
                        className="btn-primary"
                        style={{ background: '#FF9800' }}
                    >
                        Post Canteen Review
                    </button>
                </div>
            </div>

            <div className="feedback-tabs" style={{ marginBottom: '2rem', borderBottom: '1px solid #ddd' }}>
                <button
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    General Issues
                </button>
                <button
                    className={`tab-btn ${activeTab === 'canteen' ? 'active' : ''}`}
                    onClick={() => setActiveTab('canteen')}
                >
                    Canteen & Food
                </button>
            </div>

            <FeedbackList type={activeTab} />
        </div>
    );
};

export default FeedbackDashboard;
