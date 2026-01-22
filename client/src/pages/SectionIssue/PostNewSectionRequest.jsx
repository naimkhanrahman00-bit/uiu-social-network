import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PostNewSectionRequest = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        course_id: '',
        desired_section: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/resources/courses');
                setCourses(res.data);
            } catch (err) {
                console.error("Failed to fetch courses", err);
                setError("Failed to load courses.");
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/section-issue/new-section', formData);
            alert('Section request submitted successfully! It is pending approval.');
            navigate('/section-issue');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Request New Section</h2>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Course</label>
                    <select
                        name="course_id"
                        value={formData.course_id}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        required
                    >
                        <option value="">Select a Course</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>
                                {course.code} - {course.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Desired Section Name/Number</label>
                    <input
                        type="text"
                        name="desired_section"
                        value={formData.desired_section}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        placeholder="e.g. C, Section 5, Evening Batch"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Reason / Justification</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        rows="4"
                        placeholder="Why do you need this section? (e.g., Clashes, High demand)"
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/section-issue')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostNewSectionRequest;
