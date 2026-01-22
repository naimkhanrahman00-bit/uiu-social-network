import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SectionRequestCard from '../../components/SectionIssue/SectionRequestCard';

const SectionRequestsFeed = () => {
    const [requests, setRequests] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filters, setFilters] = useState({
        courseId: '',
        search: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const params = {};
                if (filters.courseId) params.courseId = filters.courseId;
                if (filters.search) params.search = filters.search;

                const res = await api.get('/section-issue/new-section', { params });
                setRequests(res.data);
            } catch (err) {
                console.error("Failed to load section requests", err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchRequests();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">New Section Requests</h1>
                    <p className="text-gray-500 text-sm">Review requests and show support for new sections.</p>
                </div>
                <Link to="/section-issue/new-section" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    + Make a Request
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
                            placeholder="Search requests..."
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
                        <div className="flex justify-center p-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {requests.map(request => (
                                <SectionRequestCard key={request.id} request={request} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded shadow border border-gray-100">
                            <p className="text-gray-500">No new section requests found.</p>
                            <p className="text-gray-400 text-sm mt-1">Be the first to request one!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SectionRequestsFeed;
