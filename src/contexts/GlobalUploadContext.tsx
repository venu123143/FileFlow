import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
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
    file: File;
    folderId?: string;
    isUploading?: boolean; // Flag to prevent duplicate upload attempts
}

interface GlobalUploadState {
    uploads: { [fileName: string]: FileUploadState };
    activeUploads: number;
}

type GlobalUploadAction =
    | { type: 'ADD_FILE'; fileName: string; file: File; folderId?: string; initialState?: Partial<FileUploadState> }
    | { type: 'UPDATE_FILE_STATE'; fileName: string; updates: Partial<FileUploadState> }
    | { type: 'REMOVE_FILE'; fileName: string }
    | { type: 'CLEAR_ALL' }
    | { type: 'SET_ACTIVE_UPLOADS'; count: number };

const initialState: GlobalUploadState = {
    uploads: {},
    activeUploads: 0,
};

function globalUploadReducer(state: GlobalUploadState, action: GlobalUploadAction): GlobalUploadState {
    switch (action.type) {
        case 'ADD_FILE':
            return {
                ...state,
                uploads: {
                    ...state.uploads,
                    [action.fileName]: {
                        uploadId: null,
                        url: null,
                        fileKey: null,
                        progress: 0,
                        status: 'idle',
                        error: null,
                        lastUploadedChunk: 0,
                        file: action.file,
                        folderId: action.folderId,
                        ...action.initialState
                    }
                }
            };
        case 'UPDATE_FILE_STATE':
            return {
                ...state,
                uploads: {
                    ...state.uploads,
                    [action.fileName]: {
                        ...state.uploads[action.fileName],
                        ...action.updates
                    }
                }
            };
        case 'REMOVE_FILE':
            const newUploads = { ...state.uploads };
            delete newUploads[action.fileName];
            return {
                ...state,
                uploads: newUploads,
                activeUploads: Math.max(0, state.activeUploads - 1)
            };
        case 'CLEAR_ALL':
            return {
                ...state,
                uploads: {},
                activeUploads: 0
            };
        case 'SET_ACTIVE_UPLOADS':
            return {
                ...state,
                activeUploads: action.count
            };
        default:
            return state;
    }
}

interface GlobalUploadContextType extends GlobalUploadState {
    addFile: (file: File, folderId?: string, initialState?: Partial<FileUploadState>) => void;
    updateFileState: (fileName: string, updates: Partial<FileUploadState>) => void;
    removeFile: (fileName: string) => void;
    handleUpload: (fileName: string) => Promise<CompleteUploadResponse | undefined>;
    abortUpload: (fileName: string) => Promise<void>;
    clearAllUploads: () => void;
    getActiveUploads: () => FileUploadState[];
    getCompletedUploads: () => FileUploadState[];
    getFailedUploads: () => FileUploadState[];
}

const GlobalUploadContext = createContext<GlobalUploadContextType | undefined>(undefined);

export const GlobalUploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(globalUploadReducer, initialState);

    const addFile = useCallback((file: File, folderId?: string, initialState?: Partial<FileUploadState>) => {
        dispatch({ 
            type: 'ADD_FILE', 
            fileName: file.name, 
            file, 
            folderId,
            initialState 
        });
    }, []);

    const updateFileState = useCallback((fileName: string, updates: Partial<FileUploadState>) => {
        dispatch({ type: 'UPDATE_FILE_STATE', fileName, updates });
    }, []);

    const removeFile = useCallback((fileName: string) => {
        dispatch({ type: 'REMOVE_FILE', fileName });
    }, []);

    const clearAllUploads = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' });
    }, []);

    const getActiveUploads = useCallback(() => {
        return Object.values(state.uploads).filter(upload => 
            upload.status === 'uploading' || upload.status === 'processing'
        );
    }, [state.uploads]);

    const getCompletedUploads = useCallback(() => {
        return Object.values(state.uploads).filter(upload => upload.status === 'completed');
    }, [state.uploads]);

    const getFailedUploads = useCallback(() => {
        return Object.values(state.uploads).filter(upload => upload.status === 'error');
    }, [state.uploads]);

    const handleUpload = useCallback(async (fileName: string): Promise<CompleteUploadResponse | undefined> => {
        const fileState = state.uploads[fileName];
        if (!fileState || fileState.isUploading) return undefined;

        const file = fileState.file;
        
        // Mark as uploading to prevent duplicate attempts
        updateFileState(fileName, { isUploading: true });
        
        try {
            let uploadId = fileState.uploadId;
            let key = fileState.fileKey;
            let parts: { PartNumber: number; ETag: string }[] = [];
            let startChunk = fileState.lastUploadedChunk || 0;

            if (!uploadId) {
                // initiate upload(1st time)
                const response = await apiClient.post('/upload/initiate', { 
                    fileName: file.name, 
                    mimeType: file.type 
                });
                const initiateResponse = response.data.data as UploadResponse;
                uploadId = initiateResponse.uploadId;
                key = initiateResponse.key;

                updateFileState(fileName, {
                    uploadId,
                    fileKey: key,
                    status: 'uploading'
                });
            } else {
                const { data: uploadedParts } = await apiClient.get(`/upload/parts/file/${uploadId}?key=${key}`);
                parts = uploadedParts.parts || [];
                startChunk = Math.max(...parts.map(part => part.PartNumber), 0);
                updateFileState(fileName, { status: 'uploading' });
            }

            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            
            for (let chunkNumber = startChunk; chunkNumber < totalChunks; chunkNumber++) {
                if (parts.some(part => part.PartNumber === chunkNumber + 1)) {
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
                                updateFileState(fileName, { progress: overallProgress });
                            }
                        },
                    });
                    const chunkResponse = response.data.data as { PartNumber: number; ETag: string };
                    parts.push({ PartNumber: chunkResponse.PartNumber, ETag: chunkResponse.ETag });
                    updateFileState(fileName, { lastUploadedChunk: chunkNumber + 1 });
                } catch (error: any) {
                    updateFileState(fileName, {
                        status: 'error',
                        error: `Failed to upload chunk ${chunkNumber + 1}: ${error.message}`
                    });
                    return;
                }
            }

            updateFileState(fileName, { status: 'processing', error: null });

            try {
                const response = await apiClient.post(`/upload/complete/file/${uploadId}`, { key, parts });
                const completeResponse = response.data.data as CompleteUploadResponse;
                
                updateFileState(fileName, {
                    url: completeResponse.storage_path,
                    status: 'completed',
                    progress: 100,
                    lastUploadedChunk: 0,
                    isUploading: false
                });

                return completeResponse;
            } catch (error: any) {
                updateFileState(fileName, {
                    status: 'error',
                    error: `Failed to complete upload: ${error.message}`,
                    isUploading: false
                });
            }
        } catch (error: any) {
            updateFileState(fileName, {
                status: 'error',
                error: `Upload failed: ${error.message}`,
                isUploading: false
            });
        }
    }, [state.uploads, updateFileState]);

    const abortUpload = useCallback(async (fileName: string) => {
        try {
            const fileState = state.uploads[fileName];
            if (fileState?.uploadId && fileState?.fileKey) {
                await apiClient.post(`/upload/abort/file/${fileState.uploadId}`, {
                    key: fileState.fileKey
                });
            }
            removeFile(fileName);
        } catch (error: any) {
            updateFileState(fileName, {
                status: 'error',
                error: `Failed to abort upload: ${error.message}`
            });
        }
    }, [state.uploads, updateFileState, removeFile]);

    // Update active uploads count
    React.useEffect(() => {
        const activeCount = getActiveUploads().length;
        dispatch({ type: 'SET_ACTIVE_UPLOADS', count: activeCount });
    }, [state.uploads, getActiveUploads]);

    const value: GlobalUploadContextType = {
        ...state,
        addFile,
        updateFileState,
        removeFile,
        handleUpload,
        abortUpload,
        clearAllUploads,
        getActiveUploads,
        getCompletedUploads,
        getFailedUploads,
    };

    return (
        <GlobalUploadContext.Provider value={value}>
            {children}
        </GlobalUploadContext.Provider>
    );
};

export const useGlobalUpload = () => {
    const context = useContext(GlobalUploadContext);
    if (!context) {
        throw new Error('useGlobalUpload must be used within a GlobalUploadProvider');
    }
    return context;
};
