import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PostExchangeRequest = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        course_id: '',
        current_section: '',
        desired_section: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Assuming we have an endpoint to get all courses. 
                // If not, we might need to implement it or use what's available.
                // Based on previous tasks, /api/resources/courses fetches courses, possibly filtered.
                // Let's try /api/resources/courses first or check if there's a better one.
                // For now, I'll assume /api/resources/courses returns a list.
                const res = await api.get('/resources/courses');
                setCourses(res.data);
            } catch (err) {
                console.error("Failed to fetch courses", err);
                setError("Failed to load courses. Please try again.");
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
            await api.post('/section-issue/exchange', formData);
            alert('Exchange request posted successfully!');
            navigate('/section-issue'); // Navigate back to dashboard or feed
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Post Section Exchange Request</h2>

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
                                {course.code} - {course.name} ({course.trimester})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Current Section</label>
                        <input
                            type="text"
                            name="current_section"
                            value={formData.current_section}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. A"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Desired Section</label>
                        <input
                            type="text"
                            name="desired_section"
                            value={formData.desired_section}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. B or Any"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Note (Optional)</label>
                    <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        rows="3"
                        placeholder="Any additional details..."
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
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Posting...' : 'Post Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostExchangeRequest;
