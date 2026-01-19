import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
    const { user, login } = useContext(AuthContext); // login used to update context state
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({});
    const [formData, setFormData] = useState({
        full_name: '',
        batch: '',
        department_id: '', // Might need to fetch depts or just show ID for now
        contact_info: ''
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setProfile(res.data);
            setFormData({
                full_name: res.data.full_name || '',
                batch: res.data.batch || '',
                department_id: res.data.department_id || '',
                contact_info: res.data.contact_info || ''
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onFileChange = e => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const onSubmit = async e => {
        e.preventDefault();
        const data = new FormData();
        data.append('full_name', formData.full_name);
        data.append('batch', formData.batch);
        data.append('department_id', formData.department_id);
        data.append('contact_info', formData.contact_info);
        if (image) {
            data.append('profile_picture', image);
        }

        try {
            const res = await api.put('/users/profile', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfile(res.data);
            // innovative: update global auth state if name changed
            // We might need a way to refresh the user in AuthContext without re-login.
            // For now, let's just update local state.

            setIsEditing(false);
            setMsg('Profile Updated Successfully');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setMsg(err.response?.data?.message || 'Error updating profile');
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>My Profile</h2>
                    <button
                        className="btn"
                        onClick={() => setIsEditing(!isEditing)}
                        style={{ background: isEditing ? '#6b7280' : 'var(--primary-color)', color: 'white' }}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {msg && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{msg}</div>}

                {!isEditing ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1rem', background: '#eee' }}>
                            {profile.profile_picture ? (
                                <img
                                    src={`http://localhost:5000${profile.profile_picture}`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#aaa' }}>👤</div>
                            )}
                        </div>
                        <h3>{profile.full_name}</h3>
                        <p style={{ color: '#666' }}>{profile.email}</p>
                        <div style={{ textAlign: 'left', marginTop: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '0.5rem' }}>
                            <p><strong>Student ID:</strong> {profile.student_id}</p>
                            <p><strong>Department ID:</strong> {profile.department_id}</p>
                            <p><strong>Batch:</strong> {profile.batch}</p>
                            <p><strong>Contact Info:</strong> {profile.contact_info || 'Not set'}</p>
                            <p><strong>Role:</strong> {profile.role}</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={onSubmit}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1rem', background: '#eee' }}>
                                {preview ? (
                                    <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : profile.profile_picture ? (
                                    <img src={`http://localhost:5000${profile.profile_picture}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#aaa' }}>👤</div>
                                )}
                            </div>
                            <input type="file" onChange={onFileChange} accept="image/*" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name="full_name" value={formData.full_name} onChange={onChange} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Batch</label>
                            <input type="text" name="batch" value={formData.batch} onChange={onChange} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contact Info</label>
                            <input type="text" name="contact_info" value={formData.contact_info} onChange={onChange} className="form-input" />
                        </div>
                        {/* Department ID is usually fixed or select from DB, keeping simplest text input for now or disabled if immutable per specific rule, but typically dept can change heavily. PRD says editable. */}
                        <div className="form-group">
                            <label className="form-label">Department ID</label>
                            <input type="number" name="department_id" value={formData.department_id} onChange={onChange} className="form-input" />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Changes</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
