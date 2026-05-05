import { useState, useCallback } from 'react';
import apiClient from '@/api/axios';
export const CHUNK_SIZE = 8 * 1024 * 1024; // 5MB chunks
export const UPLOAD_CONCURRENCY = 4; // parallel chunk uploads

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
                // Fetch already uploaded parts so retry resumes from where it left off.
                // Backend wraps responses as { success, data: { parts } }, so unwrap .data.data.
                const resp = await apiClient.get(`/upload/parts/file/${uploadId}?key=${key}`);
                const partsPayload = resp.data?.data ?? resp.data ?? {};
                parts = partsPayload.parts || [];
                startChunk = Math.max(...parts.map(part => part.PartNumber), 0);
                updateFileState(file.name, {
                    status: 'uploading',
                    lastUploadedChunk: startChunk,
                });
            }
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

            // Build list of chunk indices that still need uploading.
            const pendingChunks: number[] = [];
            for (let i = 0; i < totalChunks; i++) {
                if (!parts.some(part => part.PartNumber === i + 1)) {
                    pendingChunks.push(i);
                }
            }

            // Per-chunk byte progress for aggregated overall progress (parallel-safe).
            const chunkLoaded: Record<number, number> = {};
            parts.forEach(p => {
                const s = (p.PartNumber - 1) * CHUNK_SIZE;
                const e = Math.min(s + CHUNK_SIZE, file.size);
                chunkLoaded[p.PartNumber] = e - s;
            });
            const reportProgress = () => {
                const loaded = Object.values(chunkLoaded).reduce((a, b) => a + b, 0);
                const overall = file.size > 0 ? Math.min(99, Math.round((loaded / file.size) * 100)) : 0;
                updateFileState(file.name, { progress: overall });
            };
            reportProgress();

            const uploadOneChunk = async (chunkNumber: number) => {
                const partNumber = chunkNumber + 1;
                const start = chunkNumber * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append('chunk', chunk);
                if (key) {
                    formData.append('key', key);
                }
                formData.append('metadata', JSON.stringify({
                    chunkNumber: partNumber,
                    totalChunks,
                    fileSize: file.size,
                    originalFileName: file.name,
                    mimeType: file.type,
                }));

                const response = await apiClient.post(`/upload/chunk/file/${uploadId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent: any) => {
                        if (progressEvent.loaded != null) {
                            chunkLoaded[partNumber] = Math.min(progressEvent.loaded, end - start);
                            reportProgress();
                        }
                    },
                });
                const chunkResponse = response.data.data as { PartNumber: number; ETag: string };
                parts.push({ PartNumber: chunkResponse.PartNumber, ETag: chunkResponse.ETag });
                chunkLoaded[partNumber] = end - start;
                updateFileState(file.name, {
                    lastUploadedChunk: Math.max(...parts.map(p => p.PartNumber)),
                });
                reportProgress();
            };

            // Bounded-concurrency worker pool — uploads chunks in parallel without
            // spawning hundreds of simultaneous requests for large files.
            let cursor = 0;
            type Failure = { chunkNumber: number; error: any };
            const failureRef: { current: Failure | null } = { current: null };
            const worker = async () => {
                while (failureRef.current === null) {
                    const idx = cursor++;
                    if (idx >= pendingChunks.length) return;
                    const chunkNumber = pendingChunks[idx];
                    try {
                        await uploadOneChunk(chunkNumber);
                    } catch (error: any) {
                        failureRef.current = { chunkNumber, error };
                        return;
                    }
                }
            };
            const workerCount = Math.max(1, Math.min(UPLOAD_CONCURRENCY, pendingChunks.length));
            await Promise.all(Array.from({ length: workerCount }, worker));

            if (failureRef.current) {
                const f = failureRef.current;
                updateFileState(file.name, {
                    status: 'error',
                    error: `Failed to upload chunk ${f.chunkNumber + 1}: ${f.error.message}`,
                });
                return;
            }
            updateFileState(file.name, { status: 'processing', error: null, progress: 100 });

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