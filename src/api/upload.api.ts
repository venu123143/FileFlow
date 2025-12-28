import apiClient from "@/api/axios";
import type { AxiosProgressEvent } from "axios";

// Types
export interface InitiateUploadPayload {
    fileName: string;
    mimeType: string;
    folderId?: string;
}

export interface InitiateUploadResponse {
    uploadId: string;
    key: string;
}

export interface UploadChunkPayload {
    uploadId: string;
    key: string;
    chunk: Blob;
    metadata: {
        chunkNumber: number;
        totalChunks: number;
        fileSize: number;
        originalFileName: string;
        mimeType: string;
    };
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

export interface UploadChunkResponse {
    PartNumber: number;
    ETag: string;
}

export interface CompletePart {
    PartNumber: number;
    ETag: string;
}

export interface CompleteUploadPayload {
    uploadId: string;
    key: string;
    parts: CompletePart[];
}

export interface CompleteUploadResponse {
    file_type: string;
    file_size: number;
    storage_path: string;
    thumbnail_path?: string;
    duration?: number;
}

export interface AbortUploadPayload {
    uploadId: string;
    key: string;
}

export interface GetUploadedPartsPayload {
    uploadId: string;
    key: string;
}

export interface GetUploadedPartsResponse {
    parts: CompletePart[];
}

export interface DirectUploadResponse {
    storage_path: string;
}

// API Functions

/**
 * Initiate a multipart upload
 */
export const initiateMultipartUpload = async (
    payload: InitiateUploadPayload
): Promise<InitiateUploadResponse> => {
    const response = await apiClient.post('/upload/initiate', payload);
    return response.data.data;
};

/**
 * Upload a single chunk
 */
export const uploadChunk = async (
    payload: UploadChunkPayload
): Promise<UploadChunkResponse> => {
    const formData = new FormData();
    formData.append('chunk', payload.chunk);
    formData.append('key', payload.key);
    formData.append('metadata', JSON.stringify(payload.metadata));

    const response = await apiClient.post(
        `/upload/chunk/file/${payload.uploadId}`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: payload.onUploadProgress,
        }
    );

    return response.data.data;
};

/**
 * Complete a multipart upload
 */
export const completeMultipartUpload = async (
    payload: CompleteUploadPayload
): Promise<CompleteUploadResponse> => {
    const response = await apiClient.post(
        `/upload/complete/file/${payload.uploadId}`,
        { key: payload.key, parts: payload.parts }
    );
    return response.data.data;
};

/**
 * Abort a multipart upload
 */
export const abortMultipartUpload = async (
    payload: AbortUploadPayload
): Promise<void> => {
    await apiClient.post(`/upload/abort/file/${payload.uploadId}`, {
        key: payload.key,
    });
};

/**
 * Get already uploaded parts for a multipart upload
 */
export const getUploadedParts = async (
    payload: GetUploadedPartsPayload
): Promise<GetUploadedPartsResponse> => {
    const response = await apiClient.get(
        `/upload/parts/file/${payload.uploadId}?key=${payload.key}`
    );
    return response.data;
};

/**
 * Direct upload for non-video files (images, PDFs, etc.)
 */
export const directUpload = async (
    files: File[]
): Promise<DirectUploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await apiClient.post('/upload/file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (response.data?.success && response.data?.data) {
        return response.data.data.map((fileData: any) => ({
            storage_path: fileData.storage_path,
        }));
    }

    throw new Error(response.data?.message || 'Upload failed - invalid response');
};

export default {
    initiateMultipartUpload,
    uploadChunk,
    completeMultipartUpload,
    abortMultipartUpload,
    getUploadedParts,
    directUpload,
};

