// @/contexts/uploadContext.tsx
import React, { createContext, useContext, useReducer, useCallback, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInitiateUpload, useUploadChunk, useCompleteUpload, useAbortUpload, useDirectUpload, useGetUploadedParts } from '@/hooks/useUploadMutations';
import { getAuthState } from '@/store/auth.store';
import apiClient from '@/api/axios';
import * as uploadApi from '@/api/upload.api';

export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
export const UPLOAD_CONCURRENCY = 4; // parallel chunk uploads per file

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
    | { type: 'SET_VIDEOS'; payload: VideosState }
    | { type: 'APPEND_VIDEOS'; payload: { videos: uploadApi.S3File[]; pagination: VideosState['pagination'] } }
    | { type: 'SET_VIDEOS_FETCHING'; payload: boolean }
    | { type: 'SET_VIDEOS_INITIALIZED' }
    | { type: 'RESET' };

interface VideosState {
    videos: uploadApi.S3File[];
    pagination: {
        hasMore: boolean;
        nextContinuationToken: string | null;
        maxKeys: number;
        currentCount: number;
    };
}

interface UploadState {
    fileStates: { [fileName: string]: FileUploadState };
    isPopupMinimized: boolean;
    isPopupVisible: boolean;
    loading: boolean;
    error: string | null;
    success: boolean;
    uploadedFiles: FileObject[];
    videos: VideosState | null;
    // Persist across route changes — lives in context, not component
    isFetchingVideos: boolean;
    videosInitialized: boolean;
}

const initialState: UploadState = {
    fileStates: {},
    isPopupMinimized: false,
    isPopupVisible: false,
    loading: false,
    error: null,
    success: false,
    uploadedFiles: [],
    videos: null,
    isFetchingVideos: false,
    videosInitialized: false,
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
            };

        case 'UPDATE_FILE_STATE':
            if (!state.fileStates[action.payload.fileName]) return state;
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

        case 'REMOVE_FILE': {
            const { [action.payload.fileName]: _, ...remainingFiles } = state.fileStates;
            return {
                ...state,
                fileStates: remainingFiles,
                isPopupVisible: Object.keys(remainingFiles).length > 0
            };
        }

        case 'SET_POPUP_MINIMIZED':
            return { ...state, isPopupMinimized: action.payload };

        case 'SET_POPUP_VISIBLE':
            return { ...state, isPopupVisible: action.payload };

        case 'CLEAR_ALL_COMPLETED': {
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
        }

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
            if (!state.fileStates[action.payload.fileName]) return state;
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

        case 'SET_VIDEOS':
            return { ...state, videos: action.payload };

        case 'APPEND_VIDEOS':
            return {
                ...state,
                videos: state.videos
                    ? { videos: [...state.videos.videos, ...action.payload.videos], pagination: action.payload.pagination }
                    : { videos: action.payload.videos, pagination: action.payload.pagination }
            };

        // ─── NEW: track fetch lifecycle in context so it persists across remounts ───
        case 'SET_VIDEOS_FETCHING':
            return { ...state, isFetchingVideos: action.payload };

        case 'SET_VIDEOS_INITIALIZED':
            return { ...state, videosInitialized: true };
        // ────────────────────────────────────────────────────────────────────────────

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
    getAllFiles: (payload?: uploadApi.GetAllFilesPayload) => Promise<uploadApi.GetAllFilesResponse>;
    setButtonLoading: (fileName: string, button: 'upload' | 'retry' | 'abort' | 'remove', loading: boolean) => void;
    reset: () => void;
    // Videos state management
    videos: VideosState | null;
    /** True while the initial or retry fetch is in-flight. Persists across route changes. */
    isFetchingVideos: boolean;
    /** True once at least one fetch has completed (success or populated cache). */
    videosInitialized: boolean;
    getVideos: (isInitial?: boolean) => Promise<void>;
    loadMoreVideos: () => Promise<void>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

// Provider
export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(uploadReducer, initialState);
    const { token } = getAuthState();
    const queryClient = useQueryClient();

    // React Query mutations
    const initiateUploadMutation = useInitiateUpload();
    const uploadChunkMutation = useUploadChunk();
    const completeUploadMutation = useCompleteUpload();
    const abortUploadMutation = useAbortUpload();
    const directUploadMutation = useDirectUpload();
    const getUploadedPartsMutation = useGetUploadedParts();

    // Use a ref to always read latest state inside callbacks without stale closures
    const stateRef = useRef(state);
    stateRef.current = state;

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

    const autoClearCompleted = useCallback(() => {
        const completedFiles = Object.values(stateRef.current.fileStates).filter(file => file.status === 'completed');

        if (completedFiles.length > 0) {
            const timeoutId = setTimeout(() => {
                dispatch({ type: 'CLEAR_ALL_COMPLETED' });
            }, 5000);

            return () => clearTimeout(timeoutId);
        }
    }, []);

    const handleUpload = useCallback(async (file: File, folderId?: string) => {
        if (!stateRef.current.fileStates[file.name]) {
            initializeFile(file.name, file.size, file.type);
        }

        await new Promise(resolve => setTimeout(resolve, 0));

        try {
            let uploadId = stateRef.current.fileStates[file.name]?.uploadId;
            let key = stateRef.current.fileStates[file.name]?.fileKey;
            let parts: { PartNumber: number; ETag: string }[] = [];
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

            if (!uploadId) {
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
                const uploadedPartsResponse = await getUploadedPartsMutation.mutateAsync({
                    uploadId,
                    key: key!
                });
                parts = uploadedPartsResponse.parts || [];
                const lastPart = parts.length > 0 ? Math.max(...parts.map(part => part.PartNumber)) : 0;
                updateFileState(file.name, { status: 'uploading', lastUploadedChunk: lastPart });
            }

            // Build the list of chunk indices that still need uploading.
            const pendingChunks: number[] = [];
            for (let i = 0; i < totalChunks; i++) {
                if (!parts.some(part => part.PartNumber === i + 1)) {
                    pendingChunks.push(i);
                }
            }

            // Per-chunk byte progress for parallel-safe aggregated progress.
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
                if (state.fileStates[file.name]?.isAborting) {
                    throw new Error('Upload aborted');
                }
                const partNumber = chunkNumber + 1;
                const start = chunkNumber * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const chunkResponse = await uploadChunkMutation.mutateAsync({
                    uploadId: uploadId!,
                    key: key!,
                    chunk,
                    metadata: {
                        chunkNumber: partNumber,
                        totalChunks,
                        fileSize: file.size,
                        originalFileName: file.name,
                        mimeType: file.type,
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.loaded != null) {
                            chunkLoaded[partNumber] = Math.min(progressEvent.loaded, end - start);
                            reportProgress();
                        }
                    },
                });

                parts.push({ PartNumber: chunkResponse.PartNumber, ETag: chunkResponse.ETag });
                chunkLoaded[partNumber] = end - start;
                updateFileState(file.name, {
                    lastUploadedChunk: Math.max(...parts.map(p => p.PartNumber)),
                });
                reportProgress();
            };

            // Bounded-concurrency worker pool — true parallel uploads with a
            // safe cap to avoid spawning hundreds of XHRs for large files.
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
                throw failureRef.current.error;
            }
            updateFileState(file.name, { status: 'processing', error: null, progress: 100 });

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
    }, [updateFileState, initializeFile, initiateUploadMutation, uploadChunkMutation, completeUploadMutation, getUploadedPartsMutation]);

    const abortUpload = useCallback(async (fileName: string) => {
        try {
            const fileState = stateRef.current.fileStates[fileName];
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
    }, [updateFileState, removeFile, abortUploadMutation]);

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

    const getAllFiles = async (payload?: uploadApi.GetAllFilesPayload): Promise<uploadApi.GetAllFilesResponse> => {
        try {
            return await uploadApi.getAllFiles(payload);
        } catch (error: any) {
            throw new Error(error?.response?.data?.message || error?.message || 'Failed to get files');
        }
    };

    /**
     * getVideos — stable callback, uses stateRef to avoid stale closures.
     * Persists across route changes because loading/initialized state lives in the reducer.
     */
    const getVideos = useCallback(async (isInitial = false) => {
        const currentState = stateRef.current;

        // Skip if already fetching
        if (currentState.isFetchingVideos) return;

        // Skip initial fetch if we already have data
        if (isInitial && currentState.videosInitialized && currentState.videos && currentState.videos.videos.length > 0) {
            return;
        }

        // Check React Query cache first (avoids network hit on re-mount)
        if (isInitial) {
            const cachedData = queryClient.getQueryData<uploadApi.GetAllFilesResponse>(['videos']);
            if (cachedData && cachedData.files.length > 0) {
                dispatch({
                    type: 'SET_VIDEOS',
                    payload: { videos: cachedData.files, pagination: cachedData.pagination }
                });
                dispatch({ type: 'SET_VIDEOS_INITIALIZED' });
                return;
            }
        }

        dispatch({ type: 'SET_VIDEOS_FETCHING', payload: true });

        try {
            const data = await queryClient.fetchQuery({
                queryKey: ['videos'],
                queryFn: () => uploadApi.getAllFiles({ folder: 'videos', maxKeys: 24 }),
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
            });

            dispatch({
                type: 'SET_VIDEOS',
                payload: { videos: data.files, pagination: data.pagination }
            });
            dispatch({ type: 'SET_VIDEOS_INITIALIZED' });
        } finally {
            dispatch({ type: 'SET_VIDEOS_FETCHING', payload: false });
        }
    }, [queryClient]); // No state dependency — uses stateRef

    const loadMoreVideos = useCallback(async () => {
        const { videos: currentVideos } = stateRef.current;
        if (!currentVideos?.pagination.hasMore || !currentVideos?.pagination.nextContinuationToken) {
            return;
        }

        try {
            const result = await uploadApi.getAllFiles({
                folder: 'videos',
                maxKeys: 24,
                continuationToken: currentVideos.pagination.nextContinuationToken,
            });

            dispatch({
                type: 'APPEND_VIDEOS',
                payload: { videos: result.files, pagination: result.pagination }
            });
        } catch (error: any) {
            throw new Error(error?.response?.data?.message || error?.message || 'Failed to load more videos');
        }
    }, []); // No state dependency — uses stateRef

    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

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
        getAllFiles,
        setButtonLoading,
        reset,
        videos: state.videos,
        isFetchingVideos: state.isFetchingVideos,
        videosInitialized: state.videosInitialized,
        getVideos,
        loadMoreVideos,
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