import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
import ResourceRequestForm from '../components/ResourceRequestForm';

const ResourceHub = () => {
    const { user } = useAuth();
    const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'Departments', type: 'root' }]);
    const [currentView, setCurrentView] = useState('departments'); // departments, courses, resources, my-requests
    const [showRequestModal, setShowRequestModal] = useState(false);

    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [resources, setResources] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Selection state
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (currentView === 'departments') {
            fetchDepartments();
        }
    }, [currentView]);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/resources/departments');
            setDepartments(res.data);
            setCurrentView('departments');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async (deptId) => {
        setLoading(true);
        try {
            const res = await api.get(`/resources/courses?department_id=${deptId}`);
            setCourses(res.data);
            setCurrentView('courses');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResources = async (courseId = null) => {
        setLoading(true);
        try {
            let url = '/resources';
            const params = new URLSearchParams();

            if (courseId) params.append('course_id', courseId);
            if (searchTerm) params.append('search', searchTerm);

            const res = await api.get(`${url}?${params.toString()}`);
            setResources(res.data);
            setCurrentView('resources');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/resources/requests/my-requests');
            setMyRequests(res.data);
            setCurrentView('my-requests');
            setBreadcrumbs([{ name: 'My Requests', type: 'my-requests' }]);
            setSelectedDept(null);
            setSelectedCourse(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Global search handle
    useEffect(() => {
        if (searchTerm) {
            // When searching, we switch to resources view and search everything
            // Or typically search within current context?
            // Let's search globally for simplicity
            const delayDebounceFn = setTimeout(() => {
                fetchResources(); // No specific course filter, search all
                setBreadcrumbs([{ name: 'Search Results', type: 'search' }]);
                setSelectedDept(null);
                setSelectedCourse(null);
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else if (currentView === 'search') {
            // Reset to departments if search cleared
            resetView();
        }
    }, [searchTerm]);


    const handleDeptClick = (dept) => {
        setSelectedDept(dept);
        setBreadcrumbs([
            { name: 'Departments', type: 'root' },
            { name: dept.name, type: 'dept', data: dept }
        ]);
        fetchCourses(dept.id);
        setSearchTerm('');
    };

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        setBreadcrumbs(prev => [
            ...prev,
            { name: `${course.code} - ${course.name}`, type: 'course', data: course }
        ]);
        fetchResources(course.id);
    };

    const handleBreadcrumbClick = (crumb, index) => {
        if (crumb.type === 'root') {
            resetView();
        } else if (crumb.type === 'dept') {
            handleDeptClick(crumb.data);
        }
        // If clicking current Level, do nothing or reload
    };

    const resetView = () => {
        setBreadcrumbs([{ name: 'Departments', type: 'root' }]);
        setSelectedDept(null);
        setSelectedCourse(null);
        setCurrentView('departments');
        fetchDepartments();
        setSearchTerm('');
    };

    const handleDownload = async (resource) => {
        try {
            const response = await api.get(`/resources/${resource.id}/download`, {
                responseType: 'blob',
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Extract extension from file_path
            const extension = resource.file_path ? resource.file_path.split('.').pop() : 'pdf';
            link.setAttribute('download', `${resource.title}.${extension}`);

            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            // Update download count locally
            setResources(prev => prev.map(r =>
                r.id === resource.id ? { ...r, download_count: r.download_count + 1 } : r
            ));

        } catch (error) {
            console.error("Download failed", error);
            // If 401, redirect to login? Or just alert.
            if (error.response && error.response.status === 401) {
                alert("Please log in to download resources.");
            } else {
                alert("Failed to download resource. Please try again.");
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Resource Hub</h1>
                <div className="flex gap-4">
                    <div className="w-64">
                        <input
                            type="text"
                            placeholder="Search resources..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {user && (
                        <>
                            <button
                                onClick={fetchMyRequests}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                My Requests
                            </button>
                            <button
                                onClick={() => setShowRequestModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Request Resource
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Breadcrumbs */}
            <nav className="flex mb-6 text-gray-500 text-sm" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    {breadcrumbs.map((crumb, index) => (
                        <li key={index} className="inline-flex items-center">
                            {index > 0 && (
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                </svg>
                            )}
                            <button
                                onClick={() => handleBreadcrumbClick(crumb, index)}
                                className={`inline-flex items-center hover:text-blue-600 ${index === breadcrumbs.length - 1 ? 'font-semibold text-gray-700' : ''}`}
                                disabled={index === breadcrumbs.length - 1}
                            >
                                {crumb.name}
                            </button>
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {/* Departments View */}
                    {currentView === 'departments' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {departments.map(dept => (
                                <div
                                    key={dept.id}
                                    onClick={() => handleDeptClick(dept)}
                                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md cursor-pointer border border-gray-100 hover:border-blue-300 transition-all text-center group"
                                >
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {dept.code}
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900">{dept.name}</h3>
                                    <p className="text-gray-500 mt-2 text-sm">Browse courses</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Courses View */}
                    {currentView === 'courses' && (
                        <div className="space-y-4">
                            {courses.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No courses found for this department.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {courses.map(course => (
                                        <div
                                            key={course.id}
                                            onClick={() => handleCourseClick(course)}
                                            className="bg-white p-4 rounded-lg border hover:border-blue-500 cursor-pointer shadow-sm flex justify-between items-center"
                                        >
                                            <div>
                                                <span className="text-blue-600 font-bold">{course.code}</span>
                                                <h4 className="font-medium text-gray-900">{course.name}</h4>
                                                <p className="text-xs text-gray-500">{course.trimester} Trimester</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resources View */}
                    {currentView === 'resources' && (
                        <div className="space-y-4">
                            {resources.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg">No resources found.</p>
                                    {user && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => setShowRequestModal(true)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Request this resource
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {resources.map(resource => (
                                        <ResourceCard
                                            key={resource.id}
                                            resource={resource}
                                            onDownload={handleDownload}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* My Requests View */}
                    {currentView === 'my-requests' && (
                        <div className="overflow-hidden bg-white shadow sm:rounded-md">
                            <ul role="list" className="divide-y divide-gray-200">
                                {myRequests.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">You haven't made any requests yet.</p>
                                    </div>
                                ) : (
                                    myRequests.map((request) => (
                                        <li key={request.id}>
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="truncate text-sm font-medium text-blue-600">{request.resource_name}</p>
                                                    <div className="ml-2 flex flex-shrink-0">
                                                        <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                                                            ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                    request.status === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-red-100 text-red-800'}`}>
                                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 sm:flex sm:justify-between">
                                                    <div className="sm:flex">
                                                        <p className="flex items-center text-sm text-gray-500">
                                                            {request.course_code} - {request.course_name}
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                        <p>
                                                            Requested on {new Date(request.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                {request.description && (
                                                    <div className="mt-2 text-sm text-gray-500 italic">
                                                        "{request.description}"
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </>
            )}

            {showRequestModal && (
                <ResourceRequestForm
                    onClose={() => setShowRequestModal(false)}
                    onSuccess={() => {
                        // Optionally refresh requests if in that view, or just show success alert
                        alert("Request submitted successfully!");
                        if (currentView === 'my-requests') fetchMyRequests();
                    }}
                />
            )}
        </div>
    );
};

export default ResourceHub;
