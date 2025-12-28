// @/contexts/uploadContext.tsx
import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { useInitiateUpload, useUploadChunk, useCompleteUpload, useAbortUpload, useDirectUpload, useGetUploadedParts } from '@/hooks/useUploadMutations';
import { getAuthState } from '@/store/auth.store';
import apiClient from '@/api/axios';

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
    isUploading: boolean;
    isRetrying: boolean;
    isAborting: boolean;
    isRemoving: boolean;
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
    | { type: 'SET_BUTTON_LOADING'; payload: { fileName: string; button: 'upload' | 'retry' | 'abort' | 'remove'; loading: boolean } }
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
                        isUploading: false,
                        isRetrying: false,
                        isAborting: false,
                        isRemoving: false,
                    }
                },
                // isPopupVisible: true,
            };

        case 'UPDATE_FILE_STATE':
            // Don't update if file doesn't exist in state (prevent partial states)
            if (!state.fileStates[action.payload.fileName]) {
                return state;
            }
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
        case 'SET_BUTTON_LOADING':
            // Don't update if file doesn't exist in state (prevent partial states)
            if (!state.fileStates[action.payload.fileName]) {
                return state;
            }
            return {
                ...state,
                fileStates: {
                    ...state.fileStates,
                    [action.payload.fileName]: {
                        ...state.fileStates[action.payload.fileName],
                        isUploading: action.payload.button === 'upload' ? action.payload.loading : state.fileStates[action.payload.fileName]?.isUploading || false,
                        isRetrying: action.payload.button === 'retry' ? action.payload.loading : state.fileStates[action.payload.fileName]?.isRetrying || false,
                        isAborting: action.payload.button === 'abort' ? action.payload.loading : state.fileStates[action.payload.fileName]?.isAborting || false,
                        isRemoving: action.payload.button === 'remove' ? action.payload.loading : state.fileStates[action.payload.fileName]?.isRemoving || false,
                    }
                }
            };
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
    autoClearCompleted: () => void;
    uploadFiles: (files: File[]) => Promise<FileObject[]>;
    deleteFile: (fileName: string) => Promise<boolean>;
    setButtonLoading: (fileName: string, button: 'upload' | 'retry' | 'abort' | 'remove', loading: boolean) => void;
    reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

// Provider
export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(uploadReducer, initialState);
    const { token } = getAuthState();

    // React Query mutations
    const initiateUploadMutation = useInitiateUpload();
    const uploadChunkMutation = useUploadChunk();
    const completeUploadMutation = useCompleteUpload();
    const abortUploadMutation = useAbortUpload();
    const directUploadMutation = useDirectUpload();
    const getUploadedPartsMutation = useGetUploadedParts();

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

    const setButtonLoading = useCallback((fileName: string, button: 'upload' | 'retry' | 'abort' | 'remove', loading: boolean) => {
        dispatch({ type: 'SET_BUTTON_LOADING', payload: { fileName, button, loading } });
    }, []);

    // Auto-clear completed uploads after 5 seconds
    const autoClearCompleted = useCallback(() => {
        const completedFiles = Object.values(state.fileStates).filter(file => file.status === 'completed');

        if (completedFiles.length > 0) {
            const timeoutId = setTimeout(() => {
                dispatch({ type: 'CLEAR_ALL_COMPLETED' });
            }, 5000); // 5 seconds delay

            // Return cleanup function
            return () => clearTimeout(timeoutId);
        }
    }, [state.fileStates]);

    const handleUpload = useCallback(async (file: File, folderId?: string) => {
        // Always initialize file first to ensure complete state
        if (!state.fileStates[file.name]) {
            initializeFile(file.name, file.size, file.type);
        }

        // Wait for next tick to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 0));

        try {
            let uploadId = state.fileStates[file.name]?.uploadId;
            let key = state.fileStates[file.name]?.fileKey;
            let parts: { PartNumber: number; ETag: string }[] = [];
            let startChunk = 0;
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

            if (!uploadId) {
                // Initiate upload (1st time)
                const initiateResponse = await initiateUploadMutation.mutateAsync({
                    fileName: file.name,
                    mimeType: file.type,
                    folderId
                });
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
                const uploadedPartsResponse = await getUploadedPartsMutation.mutateAsync({
                    uploadId,
                    key: key!
                });
                parts = uploadedPartsResponse.parts || [];
                
                // Fix: Calculate correct startChunk from already uploaded parts
                startChunk = parts.length > 0 ? Math.max(...parts.map(part => part.PartNumber)) : 0;

                // Calculate progress based on already uploaded chunks
                const resumeProgress = Math.round((startChunk / totalChunks) * 100);
                updateFileState(file.name, {
                    status: 'uploading',
                    progress: resumeProgress
                });
            }

            // Upload chunks
            for (let chunkNumber = startChunk; chunkNumber < totalChunks; chunkNumber++) {
                // Skip already uploaded chunks
                if (state.fileStates[file.name]?.isAborting) {
                    throw new Error('Upload aborted');
                }
                if (parts.some(part => part.PartNumber === chunkNumber + 1)) {
                    continue;
                }

                const start = chunkNumber * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const chunkResponse = await uploadChunkMutation.mutateAsync({
                    uploadId: uploadId!,
                    key: key!,
                    chunk,
                    metadata: {
                        chunkNumber: chunkNumber + 1,
                        totalChunks,
                        fileSize: file.size,
                        originalFileName: file.name,
                        mimeType: file.type,
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const chunkProgress = progressEvent.loaded / progressEvent.total;
                            const overallProgress = Math.round(((chunkNumber + chunkProgress) / totalChunks) * 100);
                            updateFileState(file.name, { progress: overallProgress });
                        }
                    },
                });

                parts.push({ PartNumber: chunkResponse.PartNumber, ETag: chunkResponse.ETag });
                updateFileState(file.name, { lastUploadedChunk: chunkNumber + 1 });
            }
            updateFileState(file.name, { status: 'processing', error: null });

            try {
                const completeResponse = await completeUploadMutation.mutateAsync({
                    uploadId: uploadId!,
                    key: key!,
                    parts
                });

                updateFileState(file.name, {
                    status: 'completed',
                    progress: 100,
                    url: completeResponse.storage_path,
                    isUploading: false,
                    isRetrying: false
                });

                return completeResponse;
            } catch (error: any) {
                updateFileState(file.name, {
                    status: 'error',
                    error: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to complete upload',
                    isUploading: false,
                    isRetrying: false
                });
                throw error;
            }
        } catch (error: any) {
            updateFileState(file.name, {
                status: 'error',
                error: error.response?.data?.message || error.response?.data?.error || error.message || 'Upload failed',
                isUploading: false,
                isRetrying: false
            });
        }
    }, [state.fileStates, updateFileState, initializeFile, initiateUploadMutation, uploadChunkMutation, completeUploadMutation, getUploadedPartsMutation]);

    const abortUpload = useCallback(async (fileName: string) => {
        try {
            const fileState = state.fileStates[fileName];
            if (fileState?.uploadId && fileState?.fileKey) {
                updateFileState(fileName, { isAborting: true });
                await abortUploadMutation.mutateAsync({
                    uploadId: fileState.uploadId,
                    key: fileState.fileKey
                });
                updateFileState(fileName, { isAborting: false });
            }
            removeFile(fileName);
        } catch (error: any) {
            updateFileState(fileName, {
                status: 'error',
                error: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to abort upload',
                isAborting: false
            });
        }
    }, [state.fileStates, updateFileState, removeFile, abortUploadMutation]);

    const uploadFiles = async (files: File[]) => {
        dispatch({ type: 'UPLOAD_START' });

        try {
            const uploadedData = await directUploadMutation.mutateAsync(files);

            const uploadedFiles = uploadedData.map((fileData, index) => ({
                fileName: files[index]?.name || 'unknown',
                url: fileData.storage_path
            }));

            dispatch({ type: 'UPLOAD_SUCCESS', payload: uploadedFiles });
            return uploadedFiles;
        } catch (error: any) {
            console.log('uploadFiles error', error);
            dispatch({ type: 'ERROR', payload: error?.response?.data?.message || error?.message || 'Network error' });
            return [];
        }
    };

    const deleteFile = async (fileName: string) => {
        dispatch({ type: 'DELETE_START' });

        try {
            const response = await apiClient.delete(`/upload/file/${fileName}`, {
                headers: {
                    Authorization: token?.access_token ? `Bearer ${token.access_token}` : undefined,
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
        autoClearCompleted,
        uploadFiles,
        deleteFile,
        setButtonLoading,
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