import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ManageCourses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [formData, setFormData] = useState({ id: '', code: '', name: '', department_id: '', trimester: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [deptRes, coursesRes] = await Promise.all([
                api.get('/resources/departments'),
                api.get('/resources/courses')
            ]);
            setDepartments(deptRes.data);
            setCourses(coursesRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ id: '', code: '', name: '', department_id: '', trimester: '' });
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (course) => {
        setModalMode('edit');
        setFormData({
            id: course.id,
            code: course.code,
            name: course.name,
            department_id: course.department_id,
            trimester: course.trimester
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await api.delete(`/resources/courses/${courseId}`);
            setCourses(courses.filter(c => c.id !== courseId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete course");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (modalMode === 'create') {
                await api.post('/resources/courses', formData);
            } else {
                await api.put(`/resources/courses/${formData.id}`, formData);
            }
            setIsModalOpen(false);
            fetchData(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || "Operation failed");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (user?.role !== 'admin') return <div className="p-8 text-center text-red-600">Access Denied.</div>;

    const getDepartmentName = (id) => departments.find(d => d.id === parseInt(id))?.code || id;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Courses</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    + Add New Course
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trimester</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {courses.map(course => (
                                <tr key={course.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDepartmentName(course.department_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.trimester}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(course)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">{modalMode === 'create' ? 'Add New Course' : 'Edit Course'}</h2>

                        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Course Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. CSE 1115"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Course Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. OOP"
                                    required
                                />
                            </div>
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
                                        <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Trimester</label>
                                <input
                                    type="text"
                                    name="trimester"
                                    value={formData.trimester}
                                    onChange={handleChange}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Spring 2023"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    {modalMode === 'create' ? 'Create Course' : 'Update Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCourses;
