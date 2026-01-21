import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ManageMarketplaceCategories = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        id: null,
        name: '',
        icon: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchCategories();
    }, [user, navigate]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/marketplace/categories');
            setCategories(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch categories');
            setLoading(false);
        }
    };

    const handleEdit = (cat) => {
        setForm({ id: cat.id, name: cat.name, icon: cat.icon || '' });
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await axios.delete(`/marketplace/categories/${id}`);
            setSuccess('Category deleted successfully');
            fetchCategories();
        } catch (err) {
            setError('Failed to delete category');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.name) {
            setError('Category name is required');
            return;
        }

        try {
            if (isEditing) {
                await axios.put(`/marketplace/categories/${form.id}`, { name: form.name, icon: form.icon });
                setSuccess('Category updated successfully');
            } else {
                await axios.post('/marketplace/categories', { name: form.name, icon: form.icon });
                setSuccess('Category created successfully');
            }
            setForm({ id: null, name: '', icon: '' });
            setIsEditing(false);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleCancel = () => {
        setForm({ id: null, name: '', icon: '' });
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Manage Marketplace Categories</h1>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="md:col-span-1 bg-white p-6 rounded shadow-sm border h-fit">
                    <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Category' : 'Add New Category'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Electronics"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Icon (Optional)</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.icon}
                                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                placeholder="e.g. laptop"
                            />
                            <p className="text-xs text-gray-500 mt-1">FontAwesome icon name (without 'fa-')</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className={`flex-1 text-white font-bold py-2 px-4 rounded ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                                {isEditing ? 'Update' : 'Add'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List Section */}
                <div className="md:col-span-2 bg-white rounded shadow-sm border overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Icon
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{cat.id}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap font-medium">{cat.name}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className={`inline-block px-3 py-1 font-semibold text-gray-900 leading-tight`}>
                                            <i className={`fa fa-${cat.icon}`}></i> {cat.icon}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="text-orange-600 hover:text-orange-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageMarketplaceCategories;
