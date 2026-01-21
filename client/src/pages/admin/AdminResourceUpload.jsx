import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminResourceUpload = () => {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        department_id: '',
        course_id: '',
        title: '',
        description: ''
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/resources/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error("Failed to load departments", err);
        }
    };

    const fetchCourses = async (deptId) => {
        try {
            const res = await api.get(`/resources/courses?department_id=${deptId}`);
            setCourses(res.data);
        } catch (err) {
            console.error("Failed to load courses", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'department_id') {
            fetchCourses(value);
            setFormData(prev => ({ ...prev, department_id: value, course_id: '' }));
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!file) {
            setMessage({ text: 'Please select a PDF file.', type: 'error' });
            return;
        }

        if (file.type !== 'application/pdf') {
            setMessage({ text: 'Only PDF files are allowed.', type: 'error' });
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            setMessage({ text: 'File size must be less than 50MB.', type: 'error' });
            return;
        }

        const data = new FormData();
        data.append('course_id', formData.course_id);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('file', file);

        setLoading(true);
        try {
            await api.post('/resources', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage({ text: 'Resource uploaded successfully!', type: 'success' });
            setFormData({ department_id: '', course_id: '', title: '', description: '' });
            setFile(null);
            // Reset file input manually if needed
            document.getElementById('file-upload').value = '';
        } catch (err) {
            console.error(err);
            setMessage({
                text: err.response?.data?.message || 'Failed to upload resource.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-600">Access Denied. Admins only.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Resource</h1>

            {message.text && (
                <div className={`p-4 rounded-md mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white px-8 pt-6 pb-8 mb-4 shadow rounded-lg">

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                    <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Course</label>
                    <select
                        name="course_id"
                        value={formData.course_id}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={!formData.department_id}
                    >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Resource Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Midterm Spring 2023"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional description"
                        rows="3"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">PDF File (Max 50MB)</label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        required
                    />
                </div>

                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Uploading...' : 'Upload Resource'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminResourceUpload;
