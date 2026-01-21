import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';

const CreateMarketplaceListing = () => {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        category_id: '',
        listing_type: 'sale', // sale, exchange, both
        price: '',
        is_negotiable: false,
        exchange_for: '',
        condition_status: 'good',
        description: '',
    });

    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]); // URLs of images already on server
    const [imagePreviews, setImagePreviews] = useState([]); // Previews for NEW images

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/marketplace/categories');
                setCategories(res.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (isEditing) {
            const fetchListing = async () => {
                try {
                    setLoading(true);
                    const res = await axios.get(`/marketplace/${id}`);
                    const listing = res.data;

                    if (listing.user_id !== user.id) {
                        setError("You are not authorized to edit this listing.");
                        return;
                    }

                    setFormData({
                        title: listing.title,
                        category_id: listing.category_id,
                        listing_type: listing.listing_type,
                        price: listing.price || '',
                        is_negotiable: !!listing.is_negotiable,
                        exchange_for: listing.exchange_for || '',
                        condition_status: listing.condition_status,
                        description: listing.description
                    });

                    // Handle existing images
                    if (listing.images && listing.images.length > 0) {
                        // Map absolute paths
                        const fullPaths = listing.images.map(img => `http://localhost:5000${img}`);
                        setExistingImages(fullPaths);
                    }
                } catch (err) {
                    console.error("Error fetching listing:", err);
                    setError("Failed to load listing details.");
                } finally {
                    setLoading(false);
                }
            };
            fetchListing();
        }
    }, [id, user.id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        // if (isEditing) return; // Enabled now
        const files = Array.from(e.target.files);

        const totalImages = existingImages.length + images.length + files.length;
        if (totalImages > 5) {
            alert(`You can only have up to 5 images. You currently have ${existingImages.length + images.length}.`);
            return;
        }

        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeNewImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Append new images
            images.forEach(image => {
                data.append('images', image);
            });

            if (isEditing) {
                // Append existing images to keep
                existingImages.forEach(img => {
                    data.append('keep_images', img);
                });

                await axios.put(`/marketplace/${id}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                navigate('/marketplace/my-listings');
            } else {
                await axios.post('/marketplace', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                navigate('/marketplace');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} listing`);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '800px',
            margin: '2rem auto',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        header: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#333'
        },
        error: {
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #fecaca'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            color: '#374151',
            fontWeight: '500'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '1rem'
        },
        textarea: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '1rem',
            minHeight: '100px'
        },
        radioGroup: {
            display: 'flex',
            gap: '1.5rem'
        },
        radioLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
        },
        row: {
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-end'
        },
        checkboxLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            marginBottom: '0.5rem'
        },
        imagePreviewContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '0.5rem'
        },
        imagePreview: {
            position: 'relative',
            width: '80px',
            height: '80px'
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '4px',
            border: '1px solid #eee'
        },
        removeBtn: {
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
        },
        submitBtn: {
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
        }
    };

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '1px 0' }}>
            <div style={styles.container}>
                <h1 style={styles.header}>{isEditing ? 'Edit Listing' : 'Create New Listing'}</h1>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="What are you listing?"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Category</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Listing Type</label>
                        <div style={styles.radioGroup}>
                            {['sale', 'exchange', 'both'].map(type => (
                                <label key={type} style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="listing_type"
                                        value={type}
                                        checked={formData.listing_type === type}
                                        onChange={handleChange}
                                    />
                                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {(formData.listing_type === 'sale' || formData.listing_type === 'both') && (
                        <div style={styles.row}>
                            <div style={{ flex: 1, ...styles.formGroup }}>
                                <label style={styles.label}>Price (BDT)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required={formData.listing_type !== 'exchange'}
                                    style={styles.input}
                                    placeholder="0.00"
                                />
                            </div>
                            <div style={{ ...styles.formGroup, marginBottom: '2.25rem' }}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="is_negotiable"
                                        checked={formData.is_negotiable}
                                        onChange={handleChange}
                                    />
                                    <span>Negotiable</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {(formData.listing_type === 'exchange' || formData.listing_type === 'both') && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Looking to Exchange For</label>
                            <input
                                type="text"
                                name="exchange_for"
                                value={formData.exchange_for}
                                onChange={handleChange}
                                required={formData.listing_type === 'exchange'}
                                style={styles.input}
                                placeholder="e.g. Scientific Calculator, Note books"
                            />
                        </div>
                    )}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Condition</label>
                        <select
                            name="condition_status"
                            value={formData.condition_status}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        >
                            <option value="new">New</option>
                            <option value="like_new">Like New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            style={styles.textarea}
                            placeholder="Describe your item..."
                        ></textarea>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Images (Max 5)</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            style={styles.input}
                            disabled={existingImages.length + images.length >= 5}
                        />

                        <div style={styles.imagePreviewContainer}>
                            {/* Existing Images */}
                            {existingImages.map((src, index) => (
                                <div key={`existing-${index}`} style={styles.imagePreview}>
                                    <img src={src} alt="Existing" style={styles.image} />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        style={styles.removeBtn}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            {/* New Images */}
                            {imagePreviews.map((src, index) => (
                                <div key={`new-${index}`} style={styles.imagePreview}>
                                    <img src={src} alt="Preview" style={styles.image} />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        style={styles.removeBtn}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                            {existingImages.length + images.length}/5 images used
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={styles.submitBtn}
                    >
                        {loading ? 'Saving...' : (isEditing ? 'Update Listing' : 'Create Listing')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateMarketplaceListing;
