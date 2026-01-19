import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditLostFoundPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [formData, setFormData] = useState({
        type: 'lost', // 'lost' or 'found'
        category_id: '',
        title: '',
        description: '',
        location: '',
        date_lost_found: '',
        collection_location: '',
        // For ID Cards
        name_on_card: '',
        card_student_id: '',
        card_department: ''
    });
    const [image, setImage] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const catRes = await api.get('/lost-found/categories');
                setCategories(catRes.data);

                // Fetch Post Details
                const postRes = await api.get(`/lost-found/${id}`);
                const post = postRes.data;

                // Format date for input type="date"
                const dateVal = post.date_lost_found ? new Date(post.date_lost_found).toISOString().split('T')[0] : '';

                setFormData({
                    type: post.type,
                    category_id: post.category_id,
                    title: post.title,
                    description: post.description || '',
                    location: post.location,
                    date_lost_found: dateVal,
                    collection_location: post.collection_location || '',
                    name_on_card: post.name_on_card || '',
                    card_student_id: post.card_student_id || '',
                    card_department: post.card_department || ''
                });
                setCurrentImage(post.image_path);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setMsg('Error loading post data');
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onFileChange = e => setImage(e.target.files[0]);

    const onSubmit = async e => {
        e.preventDefault();
        setMsg('');

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
            await api.put(`/lost-found/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMsg('Post updated successfully!');
            setTimeout(() => navigate(`/lost-found/${id}`), 2000);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Error updating post');
        }
    };

    const isIDCard = categories.find(c => c.id == formData.category_id)?.name === 'ID Card';
    const isFound = formData.type === 'found';

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <div className="card">
                <h2>Edit Post</h2>
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1rem', width: 'auto' }}>Cancel</button>

                {msg && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px' }}>{msg}</div>}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Category:</label>
                        <select name="category_id" value={formData.category_id} onChange={onChange} className="form-input">
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input type="text" name="title" value={formData.title} onChange={onChange} className="form-input" required />
                    </div>

                    {isIDCard ? (
                        <>
                            <div className="form-group">
                                <label className="form-label">Name on Card</label>
                                <input type="text" name="name_on_card" value={formData.name_on_card} onChange={onChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Student ID on Card</label>
                                <input type="text" name="card_student_id" value={formData.card_student_id} onChange={onChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Department on Card</label>
                                <input type="text" name="card_department" value={formData.card_department} onChange={onChange} className="form-input" required />
                            </div>
                        </>
                    ) : (
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea name="description" value={formData.description} onChange={onChange} className="form-input" rows="3"></textarea>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">{isFound ? 'Date Found' : 'Date Lost'}</label>
                        <input type="date" name="date_lost_found" value={formData.date_lost_found} onChange={onChange} className="form-input" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{isFound ? 'Location Found' : 'Location Lost'}</label>
                        <input type="text" name="location" value={formData.location} onChange={onChange} className="form-input" required />
                    </div>

                    {isFound && (
                        <div className="form-group">
                            <label className="form-label">Collection Point</label>
                            <input
                                type="text"
                                name="collection_location"
                                value={formData.collection_location}
                                onChange={onChange}
                                className="form-input"
                                required
                            />
                        </div>
                    )}

                    {!isIDCard && (
                        <div className="form-group">
                            <label className="form-label">Image (Leave empty to keep existing)</label>
                            {currentImage && <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Current image exists</div>}
                            <input type="file" onChange={onFileChange} className="form-input" accept="image/*" />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Update Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditLostFoundPost;
