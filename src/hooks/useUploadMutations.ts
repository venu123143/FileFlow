import { useMutation } from "@tanstack/react-query";
import * as uploadApi from "@/api/upload.api";
import fileApi from "@/api/file.api";
import type { AccessLevel } from "@/types/file.types";

// Hook for initiating multipart upload
export const useInitiateUpload = () => {
    return useMutation({
        mutationFn: uploadApi.initiateMultipartUpload,
    });
};

// Hook for uploading a chunk
export const useUploadChunk = () => {
    return useMutation({
        mutationFn: uploadApi.uploadChunk,
    });
};

// Hook for completing multipart upload
export const useCompleteUpload = () => {
    return useMutation({
        mutationFn: uploadApi.completeMultipartUpload,
    });
};

// Hook for aborting upload
export const useAbortUpload = () => {
    return useMutation({
        mutationFn: uploadApi.abortMultipartUpload,
    });
};

// Hook for direct file upload (non-video files)
export const useDirectUpload = () => {
    return useMutation({
        mutationFn: (files: File[]) => uploadApi.directUpload(files),
    });
};

// Hook for creating file metadata in database
export interface CreateFileMetadataPayload {
    name: string;
    parent_id?: string | null;
    access_level?: AccessLevel;
    file_info: {
        file_type: string;
        file_size: number;
        storage_path: string;
        thumbnail_path?: string;
        duration?: number;
    };
}

export const useCreateFileMetadata = () => {
    return useMutation({
        mutationFn: (data: CreateFileMetadataPayload) => fileApi.createFile(data),
    });
};

// Hook for getting uploaded parts (for resume functionality)
export const useGetUploadedParts = () => {
    return useMutation({
        mutationFn: uploadApi.getUploadedParts,
    });
};

