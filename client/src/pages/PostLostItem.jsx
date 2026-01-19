import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const PostLostItem = () => {
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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/lost-found/categories');
                setCategories(res.data);
                // Default to first category if available
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: res.data[0].id }));
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onFileChange = e => setImage(e.target.files[0]);

    const onTypeChange = newType => {
        setFormData(prev => ({
            ...prev,
            type: newType
        }));
    };

    const onSubmit = async e => {
        e.preventDefault();
        setMsg('');

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
            await api.post('/lost-found', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMsg('Post created successfully!');
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Error creating post');
        }
    };

    const isIDCard = categories.find(c => c.id == formData.category_id)?.name === 'ID Card';
    const isFound = formData.type === 'found';

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <div className="card">
                <h2>{isFound ? 'Post Found Item' : 'Post Lost Item'}</h2>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => onTypeChange('lost')}
                        className={`btn ${!isFound ? 'btn-primary' : ''}`}
                        style={{ flex: 1, opacity: !isFound ? 1 : 0.6 }}
                    >
                        I Lost Something
                    </button>
                    <button
                        type="button"
                        onClick={() => onTypeChange('found')}
                        className={`btn ${isFound ? 'btn-primary' : ''}`}
                        style={{ flex: 1, opacity: isFound ? 1 : 0.6 }}
                    >
                        I Found Something
                    </button>
                </div>

                {msg && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px' }}>{msg}</div>}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">{isFound ? 'Category' : 'I Lost'}:</label>
                        <select name="category_id" value={formData.category_id} onChange={onChange} className="form-input">
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input type="text" name="title" value={formData.title} onChange={onChange} className="form-input" placeholder={isFound ? "e.g. Found Blue Wallet" : "e.g. Lost Blue Wallet"} required />
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
                            <textarea name="description" value={formData.description} onChange={onChange} className="form-input" rows="3" placeholder="Describe the item..."></textarea>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">{isFound ? 'Date Found' : 'Date Lost'}</label>
                        <input type="date" name="date_lost_found" value={formData.date_lost_found} onChange={onChange} className="form-input" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{isFound ? 'Location Found' : 'Location Lost'}</label>
                        <input type="text" name="location" value={formData.location} onChange={onChange} className="form-input" placeholder="e.g. Canteen, Library" required />
                    </div>

                    {isFound && (
                        <div className="form-group">
                            <label className="form-label">Collection Point (Where can the owner find you/it?)</label>
                            <input
                                type="text"
                                name="collection_location"
                                value={formData.collection_location}
                                onChange={onChange}
                                className="form-input"
                                placeholder="e.g. Security Office, or Call me"
                                required
                            />
                        </div>
                    )}

                    {!isIDCard && (
                        <div className="form-group">
                            <label className="form-label">Image (Optional)</label>
                            <input type="file" onChange={onFileChange} className="form-input" accept="image/*" />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        {isFound ? 'Post Found Item' : 'Post Lost Item'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostLostItem;
