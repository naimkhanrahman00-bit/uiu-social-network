import React from 'react';
import { Link } from 'react-router-dom';

const SectionIssueDashboard = () => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Section Issues</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Exchange Section */}
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold mb-3 text-blue-700">Section Exchange</h2>
                    <p className="text-gray-600 mb-6">
                        Find someone to swap your section with. Post your current section and what you're looking for.
                    </p>
                    <div className="flex gap-3">
                        <Link
                            to="/section-issue/post"
                            className="flex-1 text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                        >
                            Post Request
                        </Link>
                        <Link
                            to="/section-issue/exchange-feed"
                            className="flex-1 text-center border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition"
                        >
                            Browse Requests
                        </Link>
                    </div>
                </div>

                {/* New Section Request */}
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
                    <h2 className="text-xl font-bold mb-3 text-green-700">Request New Section</h2>
                    <p className="text-gray-600 mb-6">
                        Request a new section if all are full. Gather support from other students.
                    </p>
                    <div className="flex gap-3">
                        <Link
                            to="/section-issue/new-section"
                            className="flex-1 text-center bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                        >
                            Request Section
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectionIssueDashboard;
