import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ExchangeRequestCard from '../../components/SectionIssue/ExchangeRequestCard';

const SectionExchangeFeed = () => {
    const [posts, setPosts] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filters, setFilters] = useState({
        courseId: '',
        search: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch courses for filter
        const fetchCourses = async () => {
            try {
                const res = await api.get('/resources/courses');
                setCourses(res.data);
            } catch (err) {
                console.error("Failed to load courses", err);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const params = {};
                if (filters.courseId) params.courseId = filters.courseId;
                if (filters.search) params.search = filters.search;

                const res = await api.get('/section-issue/exchange', { params });
                setPosts(res.data);
            } catch (err) {
                console.error("Failed to load exchange posts", err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search slightly or just effect on change
        const timeoutId = setTimeout(() => {
            fetchPosts();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Section Exchange Requests</h1>
                <Link to="/section-issue/post" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Post Request
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="md:col-span-1 bg-white p-4 rounded-lg shadow h-fit">
                    <h2 className="font-semibold mb-4 text-gray-700">Filters</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Search</label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search notes..."
                            className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Course</label>
                        <select
                            name="courseId"
                            value={filters.courseId}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Feed Content */}
                <div className="md:col-span-3">
                    {loading ? (
                        <p className="text-gray-500">Loading requests...</p>
                    ) : posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {posts.map(post => (
                                <ExchangeRequestCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded shadow">
                            <p className="text-gray-500">No exchange requests found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SectionExchangeFeed;
