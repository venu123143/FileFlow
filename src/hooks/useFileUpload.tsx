import { useCallback } from 'react';
import { useGlobalUpload, type FileUploadState, type CompleteUploadResponse } from '@/contexts/GlobalUploadContext';

export type UploadStatus = 'idle' | 'uploading' | 'completed' | 'error' | 'processing';

export interface UseFileUploadReturn {
    fileStates: { [fileName: string]: FileUploadState };
    handleUpload: (file: File) => Promise<CompleteUploadResponse | undefined>;
    abortUpload: (fileName: string) => Promise<void>;
    removeFile: (fileName: string) => void;
    updateFileState: (fileName: string, updates: Partial<FileUploadState>) => void;
}

const useFileUpload = (folderId?: string): UseFileUploadReturn => {
    const {
        uploads: fileStates,
        addFile,
        handleUpload: globalHandleUpload,
        abortUpload: globalAbortUpload,
        removeFile: globalRemoveFile,
        updateFileState: globalUpdateFileState,
    } = useGlobalUpload();

    const handleUpload = useCallback(async (file: File) => {
        // Add file to global state if not already present
        if (!fileStates[file.name]) {
            addFile(file, folderId);
        }
        
        // Use global upload handler
        return await globalHandleUpload(file.name);
    }, [fileStates, addFile, globalHandleUpload, folderId]);

    const abortUpload = useCallback(async (fileName: string) => {
        return await globalAbortUpload(fileName);
    }, [globalAbortUpload]);

    const removeFile = useCallback((fileName: string) => {
        globalRemoveFile(fileName);
    }, [globalRemoveFile]);

    const updateFileState = useCallback((fileName: string, updates: Partial<FileUploadState>) => {
        globalUpdateFileState(fileName, updates);
    }, [globalUpdateFileState]);

    return {
        fileStates,
        handleUpload,
        abortUpload,
        removeFile,
        updateFileState
    };
};

export default useFileUpload;