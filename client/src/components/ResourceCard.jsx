import React from 'react';

const ResourceCard = ({ resource, onDownload }) => {
    // Determine icon based on file type (defaults to pdf for now since that's the main type)
    const getIcon = () => {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        );
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-start gap-4">
            <div className="flex-shrink-0">
                {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate" title={resource.title}>
                    {resource.title}
                </h3>
                <p className="text-sm text-gray-500 mb-1">{resource.course_code} - {resource.course_name}</p>
                <div className="text-sm text-gray-500 flex flex-wrap gap-x-4">
                    <span>{resource.department_code}</span>
                    <span>{resource.trimester} Tri</span>
                    <span>{formatFileSize(resource.file_size)}</span>
                </div>
                {resource.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{resource.description}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                        Uploaded by {resource.uploader_name || 'Admin'} • {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                    <button
                        onClick={() => onDownload(resource)}
                        className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-medium flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download ({resource.download_count})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
