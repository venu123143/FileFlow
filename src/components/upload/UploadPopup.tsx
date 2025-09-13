// @/components/upload/UploadPopup.tsx
import React from 'react';
import {
    X,
    Minimize2,
    Maximize2,
    Upload,
    FileText,
    Pause,
    RotateCcw,
    Trash2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { useUpload } from '@/contexts/UploadContext';

const UploadPopup: React.FC = () => {
    const {
        state,
        abortUpload,
        removeFile,
        setPopupMinimized,
        setPopupVisible,
        clearAllCompleted,
        handleUpload
    } = useUpload();

    const { fileStates, isPopupMinimized, isPopupVisible } = state;
    const files = Object.values(fileStates);

    if (!isPopupVisible || files.length === 0) return null;

    const uploadingFiles = files.filter(f => f.status === 'uploading' || f.status === 'processing');
    const completedFiles = files.filter(f => f.status === 'completed');
    const errorFiles = files.filter(f => f.status === 'error');

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'processing': return 'text-orange-600';
            case 'uploading': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getProgressBarColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'processing': return 'bg-orange-500';
            case 'uploading': return 'bg-blue-500';
            default: return 'bg-gray-300';
        }
    };

    const handleRetry = async (fileName: string) => {
        const fileState = fileStates[fileName];
        if (fileState) {
            // Create a File object from the stored metadata
            const file = new File([], fileState.fileName, { type: fileState.fileType });
            Object.defineProperty(file, 'size', { value: fileState.fileSize });
            await handleUpload(file);
        }
    };

    return (
        <div
            className={`fixed z-50 bg-white rounded-lg shadow-2xl transition-all duration-300 ${
                isPopupMinimized
                    ? 'bottom-4 right-4 w-80'
                    : 'bottom-4 right-4 w-96 max-h-[600px]'
            }`}
            style={{
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span className="font-semibold">
                        Uploads ({uploadingFiles.length} active)
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setPopupMinimized(!isPopupMinimized)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        {isPopupMinimized ? (
                            <Maximize2 className="w-4 h-4" />
                        ) : (
                            <Minimize2 className="w-4 h-4" />
                        )}
                    </button>
                    <button
                        onClick={() => setPopupVisible(false)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {!isPopupMinimized && (
                <div className="max-h-[500px] overflow-y-auto">
                    {/* Summary */}
                    {(completedFiles.length > 0 || errorFiles.length > 0) && (
                        <div className="p-3 bg-gray-50 border-b">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex space-x-4">
                                    {completedFiles.length > 0 && (
                                        <span className="flex items-center text-green-600">
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            {completedFiles.length} completed
                                        </span>
                                    )}
                                    {errorFiles.length > 0 && (
                                        <span className="flex items-center text-red-600">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errorFiles.length} failed
                                        </span>
                                    )}
                                </div>
                                {completedFiles.length > 0 && (
                                    <button
                                        onClick={clearAllCompleted}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        Clear completed
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* File List */}
                    <div className="p-3 space-y-3">
                        {files.map((fileState) => (
                            <div
                                key={fileState.fileName}
                                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {fileState.fileName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(fileState.fileSize)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {fileState.status === 'uploading' && (
                                            <button
                                                onClick={() => abortUpload(fileState.fileName)}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="Cancel upload"
                                            >
                                                <Pause className="w-4 h-4" />
                                            </button>
                                        )}
                                        {fileState.status === 'error' && (
                                            <button
                                                onClick={() => handleRetry(fileState.fileName)}
                                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="Retry upload"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                        )}
                                        {(fileState.status === 'completed' || fileState.status === 'error') && (
                                            <button
                                                onClick={() => removeFile(fileState.fileName)}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-medium ${getStatusColor(fileState.status)}`}>
                                            {fileState.status === 'processing' ? 'Processing...'
                                                : fileState.status === 'error' ? 'Failed'
                                                    : fileState.status === 'completed' ? 'Completed'
                                                        : fileState.status === 'uploading' ? `Uploading ${fileState.progress}%`
                                                            : 'Ready'}
                                        </span>
                                        {fileState.status === 'uploading' && (
                                            <span className="text-xs text-gray-500">
                                                Chunk {fileState.lastUploadedChunk}/{fileState.totalChunks}
                                            </span>
                                        )}
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 rounded-full ${getProgressBarColor(fileState.status)}`}
                                            style={{ width: `${fileState.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                {fileState.error && (
                                    <p className="text-xs text-red-600 truncate" title={fileState.error}>
                                        {fileState.error}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Minimized View */}
            {isPopupMinimized && uploadingFiles.length > 0 && (
                <div className="p-3">
                    <div className="text-sm text-gray-600">
                        Uploading {uploadingFiles.length} file{uploadingFiles.length > 1 ? 's' : ''}...
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                            style={{
                                width: `${
                                    uploadingFiles.reduce((acc, f) => acc + f.progress, 0) / 
                                    uploadingFiles.length
                                }%`
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadPopup;