// @/contexts/uploadContext.tsx
import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import apiClient from '@/api/axios';
import { getAuthState } from '@/store/auth.store';

export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export type UploadStatus = 'idle' | 'uploading' | 'completed' | 'error' | 'processing';

export interface UploadResponse {
    uploadId: string;
    key: string;
}

export interface CompleteUploadResponse {
    file_type: string;
    file_size: number;
    storage_path: string;
    thumbnail_path?: string;
    duration?: number;
}

export interface FileUploadState {
    uploadId: string | null;
    url: string | null;
    fileKey: string | null;
    progress: number;
    status: UploadStatus;
    error: string | null;
    lastUploadedChunk: number;
    totalChunks: number;
    fileName: string;
    fileSize: number;
    fileType: string;
}

export interface FileObject {
    fileName: string;
    url: string;
}

// Action types
type UploadAction =
    | { type: 'INITIALIZE_FILE'; payload: { fileName: string; fileSize: number; fileType: string } }
    | { type: 'UPDATE_FILE_STATE'; payload: { fileName: string; updates: Partial<FileUploadState> } }
    | { type: 'REMOVE_FILE'; payload: { fileName: string } }
    | { type: 'SET_POPUP_MINIMIZED'; payload: boolean }
    | { type: 'SET_POPUP_VISIBLE'; payload: boolean }
    | { type: 'CLEAR_ALL_COMPLETED' }
    | { type: 'UPLOAD_START' | 'DELETE_START' }
    | { type: 'UPLOAD_SUCCESS'; payload: FileObject[] }
    | { type: 'DELETE_SUCCESS' }
    | { type: 'ERROR'; payload: string }
    | { type: 'RESET' };

interface UploadState {
    fileStates: { [fileName: string]: FileUploadState };
    isPopupMinimized: boolean;
    isPopupVisible: boolean;
    loading: boolean;
    error: string | null;
    success: boolean;
    uploadedFiles: FileObject[];
}

const initialState: UploadState = {
    fileStates: {},
    isPopupMinimized: false,
    isPopupVisible: false,
    loading: false,
    error: null,
    success: false,
    uploadedFiles: [],
};

// Reducer
const uploadReducer = (state: UploadState, action: UploadAction): UploadState => {
    switch (action.type) {
        case 'INITIALIZE_FILE':
            return {
                ...state,
                fileStates: {
                    ...state.fileStates,
                    [action.payload.fileName]: {
                        uploadId: null,
                        url: null,
                        fileKey: null,
                        progress: 0,
                        status: 'idle',
                        error: null,
                        lastUploadedChunk: 0,
                        totalChunks: Math.ceil(action.payload.fileSize / CHUNK_SIZE),
                        fileName: action.payload.fileName,
                        fileSize: action.payload.fileSize,
                        fileType: action.payload.fileType,
                    }
                },
                isPopupVisible: true,
            };

        case 'UPDATE_FILE_STATE':
            return {
                ...state,
                fileStates: {
                    ...state.fileStates,
                    [action.payload.fileName]: {
                        ...state.fileStates[action.payload.fileName],
                        ...action.payload.updates
                    }
                }
            };

        case 'REMOVE_FILE':
            const { [action.payload.fileName]: _, ...remainingFiles } = state.fileStates;
            return {
                ...state,
                fileStates: remainingFiles,
                isPopupVisible: Object.keys(remainingFiles).length > 0
            };

        case 'SET_POPUP_MINIMIZED':
            return {
                ...state,
                isPopupMinimized: action.payload
            };

        case 'SET_POPUP_VISIBLE':
            return {
                ...state,
                isPopupVisible: action.payload
            };

        case 'CLEAR_ALL_COMPLETED':
            const activeFiles = Object.entries(state.fileStates).reduce((acc, [key, file]) => {
                if (file.status !== 'completed' && file.status !== 'error') {
                    acc[key] = file;
                }
                return acc;
            }, {} as { [fileName: string]: FileUploadState });

            return {
                ...state,
                fileStates: activeFiles,
                isPopupVisible: Object.keys(activeFiles).length > 0
            };

        case 'UPLOAD_START':
        case 'DELETE_START':
            return { ...state, loading: true, error: null, success: false };
        case 'UPLOAD_SUCCESS':
            return { ...state, loading: false, success: true, uploadedFiles: action.payload };
        case 'DELETE_SUCCESS':
            return { ...state, loading: false, success: true, uploadedFiles: [] };
        case 'ERROR':
            return { ...state, loading: false, error: action.payload, success: false };
        case 'RESET':
            return initialState;

        default:
            return state;
    }
};

// Context
interface UploadContextType {
    state: UploadState;
    dispatch: React.Dispatch<UploadAction>;
    handleUpload: (file: File, folderId?: string) => Promise<CompleteUploadResponse | undefined>;
    abortUpload: (fileName: string) => Promise<void>;
    removeFile: (fileName: string) => void;
    updateFileState: (fileName: string, updates: Partial<FileUploadState>) => void;
    setPopupMinimized: (minimized: boolean) => void;
    setPopupVisible: (visible: boolean) => void;
    clearAllCompleted: () => void;
    uploadFiles: (files: File[]) => Promise<FileObject[]>;
    deleteFile: (fileName: string) => Promise<boolean>;
    reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

// Provider
export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(uploadReducer, initialState);
    const { token } = getAuthState();

    const updateFileState = useCallback((fileName: string, updates: Partial<FileUploadState>) => {
        dispatch({ type: 'UPDATE_FILE_STATE', payload: { fileName, updates } });
    }, []);

    const initializeFile = useCallback((fileName: string, fileSize: number, fileType: string) => {
        dispatch({ type: 'INITIALIZE_FILE', payload: { fileName, fileSize, fileType } });
    }, []);

    const removeFile = useCallback((fileName: string) => {
        dispatch({ type: 'REMOVE_FILE', payload: { fileName } });
    }, []);

    const setPopupMinimized = useCallback((minimized: boolean) => {
        dispatch({ type: 'SET_POPUP_MINIMIZED', payload: minimized });
    }, []);

    const setPopupVisible = useCallback((visible: boolean) => {
        dispatch({ type: 'SET_POPUP_VISIBLE', payload: visible });
    }, []);

    const clearAllCompleted = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL_COMPLETED' });
    }, []);

    const handleUpload = useCallback(async (file: File, folderId?: string) => {
        if (!state.fileStates[file.name]) {
            initializeFile(file.name, file.size, file.type);
        }

        try {
            let uploadId = state.fileStates[file.name]?.uploadId;
            let key = state.fileStates[file.name]?.fileKey;
            let parts: { PartNumber: number; ETag: string }[] = [];
            let startChunk = state.fileStates[file.name]?.lastUploadedChunk || 0;
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

            if (!uploadId) {
                // Initiate upload (1st time)
                const response = await apiClient.post('/upload/initiate', {
                    fileName: file.name,
                    mimeType: file.type,
                    folderId
                });
                const initiateResponse = response.data.data as UploadResponse;
                uploadId = initiateResponse.uploadId;
                key = initiateResponse.key;

                updateFileState(file.name, {
                    uploadId,
                    fileKey: key,
                    status: 'uploading',
                    totalChunks
                });
            } else {
                // Resume upload - get already uploaded parts
                const { data: uploadedParts } = await apiClient.get(`/upload/parts/file/${uploadId}?key=${key}`);
                parts = uploadedParts.parts || [];
                startChunk = Math.max(...parts.map(part => part.PartNumber), 0);

                // Calculate progress based on already uploaded chunks
                const resumeProgress = Math.round((startChunk / totalChunks) * 100);
                updateFileState(file.name, {
                    status: 'uploading',
                    progress: resumeProgress
                });
            }

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
                                const chunkProgress = progressEvent.loaded / progressEvent.total;
                                const overallProgress = Math.round(((chunkNumber + chunkProgress) / totalChunks) * 100);
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
                    throw error;
                }
            }

            updateFileState(file.name, { status: 'processing', error: null });

            try {
                const response = await apiClient.post(`/upload/complete/file/${uploadId}`, { key, parts });
                const completeResponse = response.data.data as CompleteUploadResponse;

                updateFileState(file.name, {
                    status: 'completed',
                    progress: 100,
                    url: completeResponse.storage_path
                });

                return completeResponse;
            } catch (error: any) {
                updateFileState(file.name, {
                    status: 'error',
                    error: `Failed to complete upload: ${error.message}`
                });
                throw error;
            }
        } catch (error: any) {
            updateFileState(file.name, {
                status: 'error',
                error: `Upload failed: ${error.message}`
            });
        }
    }, [state.fileStates, updateFileState, initializeFile]);

    const abortUpload = useCallback(async (fileName: string) => {
        try {
            const fileState = state.fileStates[fileName];
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
    }, [state.fileStates, updateFileState, removeFile]);

    const uploadFiles = async (files: File[]) => {
        dispatch({ type: 'UPLOAD_START' });

        try {
            const formData = new FormData();
            files.forEach((file) => formData.append('upload', file));

            const response = await apiClient.post('/stream/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data?.data) {
                const fileUrls = response.data.data as FileObject[];
                dispatch({ type: 'UPLOAD_SUCCESS', payload: fileUrls });
                return response.data.data;
            }
        } catch (error: any) {
            dispatch({ type: 'ERROR', payload: error?.message || 'Network error' });
            return [];
        }
    };

    const deleteFile = async (fileName: string) => {
        dispatch({ type: 'DELETE_START' });

        try {
            const response = await apiClient.delete(`/stream/upload/${fileName}`, {
                headers: {
                    Authorization: token?.jwt_token ? `Bearer ${token.jwt_token}` : undefined,
                },
            });

            if (response.data?.success) {
                dispatch({ type: 'DELETE_SUCCESS' });
                return true;
            } else {
                dispatch({ type: 'ERROR', payload: response.data?.message || 'Delete failed' });
                return false;
            }
        } catch (error: any) {
            dispatch({ type: 'ERROR', payload: error?.message || 'Network error' });
            return false;
        }
    };

    const reset = () => dispatch({ type: 'RESET' });

    const value: UploadContextType = {
        state,
        dispatch,
        handleUpload,
        abortUpload,
        removeFile,
        updateFileState,
        setPopupMinimized,
        setPopupVisible,
        clearAllCompleted,
        uploadFiles,
        deleteFile,
        reset,
    };

    return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
};

// Hook
export const useUpload = () => {
    const context = useContext(UploadContext);
    if (context === undefined) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
};