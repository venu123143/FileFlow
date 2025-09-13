import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Pause, Play, AlertTriangle } from 'lucide-react';
import { useGlobalUpload } from '@/contexts/GlobalUploadContext';
import { useNavigate, useLocation } from 'react-router-dom';

const GlobalUploadIndicator: React.FC = () => {
    const { 
        uploads, 
        activeUploads, 
        getCompletedUploads, 
        getFailedUploads,
        abortUpload,
        removeFile,
        handleUpload
    } = useGlobalUpload();
    
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const completedUploads = getCompletedUploads();
    const failedUploads = getFailedUploads();
    const totalUploads = Object.keys(uploads).length;

    // Only show indicator when not on upload page
    const isOnUploadPage = location.pathname.includes('/all-files/') && location.pathname !== '/all-files';
    if (totalUploads === 0 || isOnUploadPage) return null;

    // Check if there are active uploads
    const hasActiveUploads = Object.values(uploads).some(upload => 
        upload.status === 'uploading' || upload.status === 'processing'
    );

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'uploading':
                return <Upload className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'processing':
                return <Upload className="w-4 h-4 text-orange-600 animate-spin" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Pause className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'uploading': return 'bg-blue-500';
            case 'processing': return 'bg-orange-500';
            case 'completed': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-300';
        }
    };

    const handleRetryUpload = async (fileName: string) => {
        await handleUpload(fileName);
    };

    const handleGoToUploads = () => {
        // Navigate to upload page or show uploads in a modal
        navigate('/all-files');
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Warning Message - Show when there are active uploads */}
            {hasActiveUploads && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg shadow-lg max-w-sm">
                    <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-amber-800 font-medium">
                                Uploads in progress - Please don't refresh the page
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Collapsed State */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="bg-white shadow-lg rounded-lg p-3 border border-gray-200 hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                    <div className="relative">
                        <Upload className="w-5 h-5 text-blue-600" />
                        {activeUploads > 0 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                        )}
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                            {activeUploads > 0 ? `${activeUploads} uploading` : `${totalUploads} files`}
                        </p>
                        <p className="text-xs text-gray-500">
                            {activeUploads > 0 ? 'In progress' : 'Completed'}
                        </p>
                    </div>
                </button>
            )}

            {/* Expanded State */}
            {isExpanded && (
                <div className="bg-white shadow-xl rounded-lg border border-gray-200 w-80 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Upload className="w-5 h-5 text-blue-600" />
                            <h3 className="font-medium text-gray-900">File Uploads</h3>
                            {activeUploads > 0 && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    {activeUploads} active
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Upload List */}
                    <div className="max-h-64 overflow-y-auto">
                        {Object.entries(uploads).map(([fileName, upload]) => (
                            <div key={fileName} className="p-3 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                        {getStatusIcon(upload.status)}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {fileName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {upload.file ? formatFileSize(upload.file.size) : 'Unknown size'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(fileName)}
                                        className="text-gray-400 hover:text-red-600 flex-shrink-0"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">
                                            {upload.status === 'processing' ? 'Processing...'
                                                : upload.status === 'error' ? 'Failed'
                                                    : upload.status === 'completed' ? 'Completed'
                                                        : upload.status === 'uploading' ? `${upload.progress}%`
                                                            : 'Ready'}
                                        </span>
                                        {upload.status === 'uploading' && (
                                            <span className="text-xs text-gray-500">{upload.progress}%</span>
                                        )}
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 rounded-full ${getStatusColor(upload.status)}`}
                                            style={{ width: `${upload.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between">
                                    <div className="flex space-x-2">
                                        {upload.status === 'idle' && (
                                            <button
                                                onClick={() => handleRetryUpload(fileName)}
                                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                            >
                                                <Play className="w-3 h-3 mr-1" />
                                                Start
                                            </button>
                                        )}
                                        {upload.status === 'error' && (
                                            <button
                                                onClick={() => handleRetryUpload(fileName)}
                                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                                            >
                                                <Play className="w-3 h-3 mr-1" />
                                                Retry
                                            </button>
                                        )}
                                        {upload.status === 'uploading' && (
                                            <button
                                                onClick={() => abortUpload(fileName)}
                                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-gray-600 rounded hover:bg-gray-700"
                                            >
                                                <Pause className="w-3 h-3 mr-1" />
                                                Cancel
                                            </button>
                                        )}
                                    </div>

                                    {upload.error && (
                                        <p className="text-xs text-red-600 truncate max-w-32" title={upload.error}>
                                            {upload.error}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">
                                {completedUploads.length} completed, {failedUploads.length} failed
                            </div>
                            <button
                                onClick={handleGoToUploads}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View Files
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalUploadIndicator;
