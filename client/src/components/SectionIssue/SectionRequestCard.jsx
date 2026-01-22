import React, { useState } from 'react';
import api from '../../api/axios';

const SectionRequestCard = ({ request }) => {
    const [supported, setSupported] = useState(request.is_supported);
    const [count, setCount] = useState(request.support_count);
    const [loading, setLoading] = useState(false);

    const handleSupport = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/section-issue/new-section/${request.id}/support`);
            if (res.data.action === 'supported') {
                setSupported(1);
                setCount(prev => prev + 1);
            } else {
                setSupported(0);
                setCount(prev => prev - 1);
            }
        } catch (err) {
            console.error("Failed to toggle support", err);
            alert("Failed to update support status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold mb-1">
                        {request.course_code}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800">{request.course_name}</h3>
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-500 block">Desired Section</span>
                    <span className="font-mono font-bold text-gray-700">{request.desired_section}</span>
                </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 flex-grow italic">"{request.reason}"</p>

            <div className="mt-auto flex items-center justify-between border-t pt-3">
                <div className="text-xs text-gray-500">
                    By {request.user_name}
                </div>

                <button
                    onClick={handleSupport}
                    disabled={loading}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded transition ${supported
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold">{count}</span>
                </button>
            </div>
        </div>
    );
};

export default SectionRequestCard;
