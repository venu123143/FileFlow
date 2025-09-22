// @/components/upload/FileUploader.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
    Upload,
    FileSpreadsheet,
    X,
    FileText,
    FileImage,
    FileVideo,
    FileArchive,
    FileAudio,
    File,
    Play,
    Pause,
    RotateCcw,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUpload } from '@/contexts/UploadContext';
import { useFile } from '@/contexts/fileContext';

export type FileType = 'excel' | 'pdf' | 'image' | 'video' | 'audio' | 'archive' | 'text' | 'any';

export interface FileConfig {
    type: FileType;
    maxSize: number; // in MB
    allowedExtensions: string[];
}

interface FileUploaderProps {
    allowedTypes?: FileConfig[];
    maxFiles?: number;
    folderId?: string;
}

const DEFAULT_FILE_CONFIGS: FileConfig[] = [
    {
        type: 'any',
        maxSize: 100,
        allowedExtensions: ['*']
    }
];

const FileUploader: React.FC<FileUploaderProps> = ({
    allowedTypes = DEFAULT_FILE_CONFIGS,
    maxFiles = 10,
    folderId,
}) => {
    const { createFile } = useFile();
    const navigate = useNavigate();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    const {
        state,
        handleUpload,
        uploadFiles,
        abortUpload,
        removeFile,
        updateFileState,
        autoClearCompleted
    } = useUpload();

    const { fileStates } = state;

    // Check if any uploads are in progress
    useEffect(() => {
        const hasActiveUploads = Object.values(fileStates).some(
            file => file.status === 'uploading' || file.status === 'processing'
        );
        setShowWarning(hasActiveUploads);

        // Add beforeunload event listener
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasActiveUploads) {
                e.preventDefault();
                e.returnValue = 'You have uploads in progress. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        if (hasActiveUploads) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [fileStates]);

    const getFileType = (file: File): FileType => {
        const ext = file.name.toLowerCase().split('.').pop() || '';
        if (['.csv', '.xlsx', '.xls'].includes(`.${ext}`)) return 'excel';
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(`.${ext}`)) return 'image';
        if (['.mp4', '.avi', '.mov', '.mkv', '.wmv'].includes(`.${ext}`)) return 'video';
        if (['.mp3', '.wav', '.flac'].includes(`.${ext}`)) return 'audio';
        if (['.zip', '.rar', '.7z'].includes(`.${ext}`)) return 'archive';
        if (['.pdf'].includes(`.${ext}`)) return 'pdf';
        if (['.txt', '.doc', '.docx'].includes(`.${ext}`)) return 'text';
        return 'any';
    };

    const getFileIcon = (fileType: FileType) => {
        const iconClass = "w-5 h-5";
        const icons = {
            'excel': <FileSpreadsheet className={iconClass} />,
            'pdf': <FileText className={iconClass} />,
            'image': <FileImage className={iconClass} />,
            'video': <FileVideo className={iconClass} />,
            'archive': <FileArchive className={iconClass} />,
            'audio': <FileAudio className={iconClass} />,
            'text': <FileText className={iconClass} />,
            'any': <File className={iconClass} />
        };
        return icons[fileType] || icons.any;
    };

    const validateFile = (file: File): string | null => {
        const fileType = getFileType(file);
        const config = allowedTypes.find(type => type.type === fileType || type.type === 'any');

        if (!config) {
            return 'File type not allowed';
        }

        if (file.size > config.maxSize * 1024 * 1024) {
            return `File size must be less than ${config.maxSize}MB`;
        }

        const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!config.allowedExtensions.includes(ext) && !config.allowedExtensions.includes('*')) {
            return `Allowed extensions: ${config.allowedExtensions.join(', ')}`;
        }

        return null;
    };

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = 'dataTransfer' in e
            ? Array.from(e.dataTransfer?.files || [])
            : Array.from((e.target as HTMLInputElement)?.files || []);

        const newFiles: File[] = [];
        const errors: string[] = [];

        files.forEach(file => {
            const error = validateFile(file);
            if (error) {
                errors.push(`${file.name}: ${error}`);
            } else if (selectedFiles.length + newFiles.length < maxFiles) {
                newFiles.push(file);
            } else {
                errors.push(`Maximum ${maxFiles} files allowed`);
            }
        });

        if (errors.length > 0) {
            console.error('File validation errors:', errors);
        }

        if (newFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    }, [allowedTypes, maxFiles, selectedFiles.length]);

    const handleFileUpload = async (file: File) => {
        const fileType = getFileType(file);

        try {
            if (fileType === 'video') {
                // Use chunked upload for video files
                const result = await handleUpload(file, folderId);
                if (result) {
                    await createFile({
                        name: file.name,
                        parent_id: folderId === "root" ? null : folderId,
                        file_info: result
                    });
                    updateFileState(file.name, {
                        url: result.storage_path,
                        status: 'completed',
                        progress: 100,
                        lastUploadedChunk: Math.ceil(file.size / (5 * 1024 * 1024))
                    });
                }
            } else {
                // Use direct upload for non-video files (images, excel, pdf, text, etc.)
                // Initialize file state if not exists
                if (!fileStates[file.name]) {
                    updateFileState(file.name, {
                        uploadId: null,
                        url: null,
                        fileKey: null,
                        progress: 0,
                        status: 'uploading',
                        error: null,
                        lastUploadedChunk: 0,
                        totalChunks: 1,
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type
                    });
                } else {
                    updateFileState(file.name, {
                        status: 'uploading',
                        progress: 0,
                        error: null
                    });
                }

                // Update progress to show upload started
                updateFileState(file.name, {
                    progress: 50
                });

                const uploadedFiles = await uploadFiles([file]);

                if (uploadedFiles && uploadedFiles.length > 0) {
                    const uploadedFile = uploadedFiles[0];

                    // Create file entry in database
                    await createFile({
                        name: file.name,
                        parent_id: folderId === "root" ? null : folderId,
                        file_info: {
                            file_type: file.type,
                            file_size: file.size,
                            storage_path: uploadedFile.url,
                            thumbnail_path: uploadedFile.url,
                            duration: undefined
                        }
                    });

                    updateFileState(file.name, {
                        url: uploadedFile.url,
                        status: 'completed',
                        progress: 100,
                        lastUploadedChunk: 1,
                        totalChunks: 1 // Set to 1 for direct uploads
                    });
                } else {
                    throw new Error('Upload failed - no file returned');
                }
            }
        } catch (error: any) {
            updateFileState(file.name, {
                status: 'error',
                error: error.message || 'Upload failed'
            });
        }
    };

    const handleRemoveFile = async (file: File) => {
        const fileState = fileStates[file.name];
        if (fileState?.status === 'uploading' && fileState.totalChunks > 1) {
            // Only abort chunked uploads (video files)
            await abortUpload(file.name);
        } else {
            removeFile(file.name);
        }
        setSelectedFiles(prev => prev.filter(f => f.name !== file.name));
    };

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

    const openFile = (file: File) => {
        const baseUrl = import.meta.env.VITE_API_CDN_URL;
        const fileState = fileStates[file.name];
        if (fileState?.url) {
            window.open(`${baseUrl}/${fileState.url}`, '_blank');
        }
    };

    // Check if all uploaded files are completed
    const allFilesCompleted = selectedFiles.length > 0 && selectedFiles.every(file => {
        const fileState = fileStates[file.name];
        return fileState?.status === 'completed';
    });

    // Auto-clear completed uploads when all files are completed
    useEffect(() => {
        if (allFilesCompleted) {
            const timer = setTimeout(() => {
                autoClearCompleted();
            }, 3000); // Clear after 3 seconds
            
            return () => clearTimeout(timer);
        }
    }, [allFilesCompleted, autoClearCompleted]);

    const handleClose = () => {
        navigate('/all-files');
    };

    return (
        <>

            {/* Drop Zone */}
            <div
                className={`lg:cursor-pointer relative m-6 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'
                    }`}
                onDrop={onDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onClick={() => document.getElementById('fileInput')?.click()}
            >
                <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    multiple={maxFiles > 1}
                    onChange={onDrop}
                    accept={allowedTypes.flatMap(t => t.allowedExtensions).join(',')}
                />

                <div className="space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                        <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-700">
                            {isDragOver ? 'Release to upload' : 'Drop files here or click to browse'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Maximum {maxFiles} file{maxFiles > 1 ? 's' : ''} allowed
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3 justify-center">
                            {allowedTypes.map((config, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                                >
                                    {config.type} (max {config.maxSize}MB)
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Warning Message */}
            {showWarning && (
                <div className="m-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">
                                Upload in Progress
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700">
                                <strong>Please do not refresh or close this page</strong> while files are being uploaded.
                                You can freely go to other pages - uploads will continue in the background.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {/* Close Button - Show when all files are completed */}
            {allFilesCompleted && (
                <div className="p-6 bg-green-50 border-t border-green-200">
                    <div className="flex items-center justify-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                            All files uploaded successfully!
                        </span>
                        <button
                            onClick={handleClose}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Close & Return to Files
                        </button>
                    </div>
                </div>
            )}

            {/* File List */}
            {selectedFiles.length > 0 && (
                <div className="p-6 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                        Selected Files ({selectedFiles.length}/{maxFiles})
                    </h3>
                    <div className="space-y-3">
                        {selectedFiles.map((file) => {
                            const fileState = fileStates[file.name] || {
                                progress: 0,
                                status: 'idle',
                                error: null,
                                totalChunks: Math.ceil(file.size / (5 * 1024 * 1024)),
                                lastUploadedChunk: 0
                            };

                            return (
                                <div
                                    key={file.name}
                                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0 text-gray-600">
                                                {getFileIcon(getFileType(file))}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(file)}
                                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-xs font-medium ${getStatusColor(fileState.status)}`}>
                                                {fileState.status === 'processing' ? 'Processing...'
                                                    : fileState.status === 'error' ? 'Failed'
                                                        : fileState.status === 'completed' ? 'Completed'
                                                            : fileState.status === 'uploading' ? `Uploading ${fileState.progress}%`
                                                                : 'Ready to upload'}
                                            </span>
                                            {fileState.status === 'uploading' && fileState.totalChunks > 1 && (
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

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex space-x-2">
                                            {fileState.status === 'idle' && (
                                                <button
                                                    onClick={() => handleFileUpload(file)}
                                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200"
                                                >
                                                    <Upload className="w-3 h-3 mr-1" />
                                                    Upload
                                                </button>
                                            )}
                                            {fileState.status === 'error' && (
                                                <button
                                                    onClick={() => handleFileUpload(file)}
                                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200"
                                                >
                                                    <RotateCcw className="w-3 h-3 mr-1" />
                                                    Retry
                                                </button>
                                            )}
                                            {fileState.status === 'uploading' && fileState.totalChunks > 1 && (
                                                <button
                                                    onClick={() => abortUpload(file.name)}
                                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors duration-200"
                                                >
                                                    <Pause className="w-3 h-3 mr-1" />
                                                    Cancel
                                                </button>
                                            )}
                                            {fileState.status === 'completed' && fileState.url && (
                                                <button
                                                    onClick={() => openFile(file)}
                                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors duration-200"
                                                >
                                                    <Play className="w-3 h-3 mr-1" />
                                                    Open
                                                </button>
                                            )}
                                        </div>

                                        {fileState.error && (
                                            <p className="text-xs text-red-600 truncate max-w-xs" title={fileState.error}>
                                                {fileState.error}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};

export default FileUploader;