import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './PostGeneralIssue.css'; // Reusing styles

function PostCanteenFeedback() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_anonymous: false
    });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 3) {
            setError('You can only upload up to 3 images');
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            data.append('is_anonymous', formData.is_anonymous);

            images.forEach(image => {
                data.append('images', image);
            });

            await api.post('/feedback/canteen', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Canteen feedback submitted successfully! It will be visible after moderator approval.');
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
                <h1>Post Canteen Feedback</h1>
                <p>Share your experience with food quality and canteen service</p>
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
                        placeholder="Subject of your feedback"
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
                        placeholder="Describe your experience in detail..."
                    />
                </div>

                <div className="form-group">
                    <label>Images (Max 3)</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        disabled={images.length >= 3}
                    />
                    <div className="image-previews" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {previews.map((preview, index) => (
                            <div key={index} className="preview-container" style={{ position: 'relative' }}>
                                <img
                                    src={preview}
                                    alt={`Preview ${index}`}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    style={{
                                        position: 'absolute',
                                        top: '0',
                                        right: '0',
                                        background: 'red',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
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

export default PostCanteenFeedback;
