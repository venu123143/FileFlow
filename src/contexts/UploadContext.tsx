import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import apiClient from '@/api/axios'; // Your configured Axios client
import { getAuthState } from '@/store/auth.store';

type UploadAction =
    | { type: 'UPLOAD_START' | 'DELETE_START' }
    | { type: 'UPLOAD_SUCCESS'; payload: FileObject[] } // Array of file URLs or identifiers
    | { type: 'DELETE_SUCCESS' }
    | { type: 'ERROR'; payload: string }
    | { type: 'RESET' };

interface FileObject {
    fileName: string;
    url: string;
}

interface UploadState {
    loading: boolean;
    success: boolean;
    error: string | null;
    uploadedFiles: FileObject[];
    fetchedFile: string | null;
}

const initialState: UploadState = {
    loading: false,
    success: false,
    error: null,
    uploadedFiles: [],
    fetchedFile: null,
};

interface UploadContextType extends UploadState {
    uploadFiles: (files: File[]) => Promise<FileObject[]>;
    deleteFile: (fileName: string) => Promise<boolean>;
    reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

function uploadReducer(state: UploadState, action: UploadAction): UploadState {
    switch (action.type) {
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
}

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(uploadReducer, initialState);
    const { token } = getAuthState();

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
                const fileUrls = response.data.data as FileObject[]; // Assuming backend returns array of file URLs/identifiers
                dispatch({ type: 'UPLOAD_SUCCESS', payload: fileUrls });
                return response.data.data;
            }
        } catch (error: any) {
            dispatch({ type: 'ERROR', payload: error?.message || 'Network error' });
            return false;
        }
    };


    const deleteFile = async (fileName: string) => {
        dispatch({ type: 'DELETE_START' });

        try {
            const response = await apiClient.delete(`/stream/upload/${fileName}`, {
                headers: {
                    Authorization: token?.token ? `Bearer ${token.token}` : undefined,
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

    return (
        <UploadContext.Provider
            value={{
                ...state,
                uploadFiles,
                deleteFile,
                reset,
            }}
        >
            {children}
        </UploadContext.Provider>
    );
};

export const useUpload = () => {
    const context = useContext(UploadContext);
    if (!context) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
};