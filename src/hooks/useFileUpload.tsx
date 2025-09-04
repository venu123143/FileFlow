import { useState, useCallback } from 'react';
import apiClient from '@/api/axios';
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export type UploadStatus = 'idle' | 'uploading' | 'completed' | 'error' | 'processing';

export interface UploadResponse {
    uploadId: string;
    key: string;
}

export interface CompleteUploadResponse {
    file_type: string;        // e.g. "image/png", "video/mp4"
    file_size: number;        // in bytes
    storage_path: string;     // internal storage path
    thumbnail_path?: string;   // path to generated thumbnail (if image/video)
    duration?: number;         // media duration in seconds (for audio/video)      
}

export interface FileUploadState {
    uploadId: string | null;
    url: string | null;
    fileKey: string | null;
    progress: number;
    status: UploadStatus;
    error: string | null;
    lastUploadedChunk: number;
}

export interface UseFileUploadReturn {
    fileStates: { [fileName: string]: FileUploadState };
    handleUpload: (file: File) => Promise<CompleteUploadResponse | undefined>;
    abortUpload: (fileName: string) => Promise<void>;
    removeFile: (fileName: string) => void;
    updateFileState: (fileName: string, updates: Partial<FileUploadState>) => void;
}

const useFileUpload = (): UseFileUploadReturn => {
    const [fileStates, setFileStates] = useState<{ [fileName: string]: FileUploadState }>({});

    const updateFileState = useCallback((fileName: string, updates: Partial<FileUploadState>) => {
        setFileStates(prev => ({
            ...prev,
            [fileName]: {
                ...prev[fileName],
                ...updates
            }
        }));
    }, []);

    const initializeFile = useCallback((fileName: string) => {
        setFileStates(prev => ({
            ...prev,
            [fileName]: {
                uploadId: null,
                url: null,
                fileKey: null,
                progress: 0,
                status: 'idle',
                error: null,
                lastUploadedChunk: 0
            }
        }));
    }, []);

    const handleUpload = useCallback(async (file: File) => {
        if (!fileStates[file.name]) {
            initializeFile(file.name);
        }
        try {
            let uploadId = fileStates[file.name]?.uploadId;
            let key = fileStates[file.name]?.fileKey;
            let parts: { PartNumber: number; ETag: string }[] = [];
            let startChunk = fileStates[file.name]?.lastUploadedChunk || 0;


            if (!uploadId) {
                // initiate upload(1st time)
                const response = await apiClient.post('/upload/initiate', { fileName: file.name, mimeType: file.type });
                const initiateResponse = response.data.data as UploadResponse;
                uploadId = initiateResponse.uploadId;
                key = initiateResponse.key;

                updateFileState(file.name, {
                    uploadId,
                    fileKey: key,
                    status: 'uploading'
                });
            } else {
                const { data: uploadedParts } = await apiClient.get(`/upload/parts/file/${uploadId}?key=${key}`);
                parts = uploadedParts.parts || [];
                startChunk = Math.max(...parts.map(part => part.PartNumber), 0);
                updateFileState(file.name, { status: 'uploading' });
            }
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            for (let chunkNumber = startChunk; chunkNumber < totalChunks; chunkNumber++) {
                if (parts.some(part => part.PartNumber === chunkNumber + 1)) {
                    // if chunk already uploaded, skip
                    // updateFileState(file.name, { lastUploadedChunk: chunkNumber + 1 });
                    continue;
                }
                const start = chunkNumber * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append('chunk', chunk);
                if (key) {
                    formData.append('key', key);
                }
                formData.append('metadata', JSON.stringify({
                    chunkNumber: chunkNumber + 1,
                    totalChunks,
                    fileSize: file.size,
                    originalFileName: file.name,
                    mimeType: file.type,
                }));

                try {
                    const response = await apiClient.post(`/upload/chunk/file/${uploadId}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: (progressEvent: any) => {
                            if (progressEvent.total) {
                                const chunkProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                                const overallProgress = Math.round(((chunkNumber + chunkProgress / 100) / totalChunks) * 100);
                                updateFileState(file.name, { progress: overallProgress });
                            }
                        },
                    });
                    const chunkResponse = response.data.data as { PartNumber: number; ETag: string };
                    parts.push({ PartNumber: chunkResponse.PartNumber, ETag: chunkResponse.ETag });
                    updateFileState(file.name, { lastUploadedChunk: chunkNumber + 1 });
                } catch (error: any) {
                    updateFileState(file.name, {
                        status: 'error',
                        error: `Failed to upload chunk ${chunkNumber + 1}: ${error.message}`
                    });
                    return;
                }
            }
            updateFileState(file.name, { status: 'processing', error: null });

            try {
                const response = await apiClient.post(`/upload/complete/file/${uploadId}`, { key, parts });
                const completeResponse = response.data.data as CompleteUploadResponse;
                return completeResponse;
            } catch (error: any) {
                updateFileState(file.name, {
                    status: 'error',
                    error: `Failed to complete upload: ${error.message}`
                });
            }
        } catch (error: any) {
            updateFileState(file.name, {
                status: 'error',
                error: `Upload failed: ${error.message}`
            });
        }
    }, [fileStates, updateFileState, initializeFile]);

    const abortUpload = useCallback(async (fileName: string) => {
        try {
            const fileState = fileStates[fileName];
            if (fileState?.uploadId && fileState?.fileKey) {
                await apiClient.post(`/upload/abort/file/${fileState.uploadId}`, {
                    key: fileState.fileKey
                });
            }

            setFileStates(prev => {
                const newStates = { ...prev };
                delete newStates[fileName];
                return newStates;
            });
        } catch (error: any) {
            updateFileState(fileName, {
                status: 'error',
                error: `Failed to abort upload: ${error.message}`
            });
        }
    }, [fileStates, updateFileState]);

    const removeFile = useCallback((fileName: string) => {
        setFileStates(prev => {
            const newStates = { ...prev };
            delete newStates[fileName];
            return newStates;
        });
    }, []);

    return {
        fileStates,
        handleUpload,
        abortUpload,
        removeFile,
        updateFileState
    };
};

export default useFileUpload;