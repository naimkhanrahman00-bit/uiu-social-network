import React from 'react';

const ExchangeRequestCard = ({ post }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full mr-2">
                        {post.course_code}
                    </span>
                    <span className="text-gray-500 text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                    </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${post.status === 'approved' ? 'bg-green-100 text-green-800' :
                        post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                    }`}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-1">{post.course_name}</h3>

            <div className="flex items-center gap-2 mb-3 text-gray-700">
                <div className="bg-gray-100 px-3 py-1 rounded">
                    <span className="text-xs text-gray-500 block">Current</span>
                    <span className="font-bold">{post.current_section}</span>
                </div>
                <span className="text-gray-400">➔</span>
                <div className="bg-blue-50 px-3 py-1 rounded">
                    <span className="text-xs text-blue-500 block">Desired</span>
                    <span className="font-bold text-blue-700">{post.desired_section}</span>
                </div>
            </div>

            {post.note && (
                <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-2 rounded italic">
                    "{post.note}"
                </p>
            )}

            <div className="border-t pt-3 flex justify-between items-center">
                <div className="text-sm">
                    <p className="font-medium text-gray-800">{post.poster_name}</p>
                    <p className="text-gray-500 text-xs">{post.poster_email}</p>
                </div>
                <a
                    href={`mailto:${post.poster_email}?subject=Section Exchange: ${post.course_code}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Contact
                </a>
            </div>
        </div>
    );
};

export default ExchangeRequestCard;
