import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './PostGeneralIssue.css';

function PostGeneralIssue() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_anonymous: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/feedback/general', formData);
            alert('Feedback submitted successfully! It will be visible after moderator approval.');
            navigate('/feedback');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-general-issue">
            <div className="page-header">
                <h1>Post General Issue</h1>
                <p>Share your concerns about university issues</p>
            </div>

            <form onSubmit={handleSubmit} className="feedback-form">
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        maxLength="200"
                        placeholder="Brief summary of the issue"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Description *</label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows="8"
                        placeholder="Describe the issue in detail..."
                    />
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="is_anonymous"
                            checked={formData.is_anonymous}
                            onChange={handleChange}
                        />
                        <span>Post Anonymously</span>
                    </label>
                    <small>Your identity will be hidden from other users</small>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/feedback')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PostGeneralIssue;
