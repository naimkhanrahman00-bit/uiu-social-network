import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ManageResourceRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null); // For modal
    const [actionType, setActionType] = useState(''); // 'approve', 'reject', 'fulfill'
    const [actionData, setActionData] = useState({ admin_note: '', fulfilled_resource_id: '' });

    useEffect(() => {
        fetchRequests();
    }, [filterStatus]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/resources/requests?status=${filterStatus === 'all' ? '' : filterStatus}`);
            setRequests(res.data);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoading(false);
        }
    };

    const openActionModal = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setActionData({ admin_note: '', fulfilled_resource_id: '' });
    };

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        try {
            let status = 'pending';
            if (actionType === 'approve') status = 'approved';
            if (actionType === 'reject') status = 'rejected';
            if (actionType === 'fulfill') status = 'uploaded';

            await api.patch(`/resources/requests/${selectedRequest.id}`, {
                status,
                admin_note: actionData.admin_note,
                fulfilled_resource_id: actionData.fulfilled_resource_id || null
            });

            alert('Request updated successfully!');
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert('Failed to update request.');
        }
    };

    if (user?.role !== 'admin') return <div className="p-8 text-center text-red-600">Access Denied.</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Manage Resource Requests</h1>

            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-4 py-2 rounded ${filterStatus === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    All Requests
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : requests.length === 0 ? (
                <p className="text-gray-500">No requests found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>{req.user_name}</div>
                                        <div className="text-gray-500 text-xs">{req.student_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {req.course_code}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="font-medium">{req.resource_name}</div>
                                        <div className="text-gray-500 text-xs">{req.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                req.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                                    req.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {req.status === 'pending' && (
                                            <>
                                                <button onClick={() => openActionModal(req, 'approve')} className="text-blue-600 hover:text-blue-900 mr-3">Approve</button>
                                                <button onClick={() => openActionModal(req, 'reject')} className="text-red-600 hover:text-red-900">Reject</button>
                                            </>
                                        )}
                                        {(req.status === 'pending' || req.status === 'approved') && (
                                            <button onClick={() => openActionModal(req, 'fulfill')} className="text-green-600 hover:text-green-900 ml-3">Fulfill (Upload)</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Action Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4 capitalize">{actionType} Request</h3>

                        <form onSubmit={handleActionSubmit}>
                            {actionType === 'fulfill' && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Resource ID (Uploaded)</label>
                                    <input
                                        type="number"
                                        className="shadow border rounded w-full py-2 px-3"
                                        value={actionData.fulfilled_resource_id}
                                        onChange={(e) => setActionData({ ...actionData, fulfilled_resource_id: e.target.value })}
                                        placeholder="Enter ID of uploaded resource"
                                        required
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Admin Note</label>
                                <textarea
                                    className="shadow border rounded w-full py-2 px-3"
                                    value={actionData.admin_note}
                                    onChange={(e) => setActionData({ ...actionData, admin_note: e.target.value })}
                                    placeholder="Reason or comment..."
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-white rounded capitalize ${actionType === 'reject' ? 'bg-red-600' : 'bg-blue-600'
                                        }`}
                                >
                                    {actionType}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageResourceRequests;
