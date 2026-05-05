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

export interface GetAllFilesPayload {
    folder?: 'files' | 'videos' | 'images' | 'documents';
    maxKeys?: number;
    continuationToken?: string;
}

export interface S3File {
    key: string;
    size: number;
    lastModified: Date;
    etag: string;
    cdnUrl: string;
    storageClass?: string;
    owner?: {
        displayName?: string;
        id?: string;
    };
    // Include all other S3 properties that might be returned
    [key: string]: any;
}

export interface GetAllFilesResponse {
    files: S3File[];
    pagination: {
        hasMore: boolean;
        nextContinuationToken: string | null;
        maxKeys: number;
        currentCount: number;
    };
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
    // Backend wraps as { success, message, data: { parts } }. Unwrap .data.data
    // to match other endpoints in this file and what callers expect.
    return response.data?.data ?? response.data;
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

/**
 * Get all files from S3 storage with pagination
 */
export const getAllFiles = async (
    payload?: GetAllFilesPayload
): Promise<GetAllFilesResponse> => {
    const params = new URLSearchParams();

    if (payload?.folder) {
        params.append('folder', payload.folder);
    }
    if (payload?.maxKeys) {
        params.append('maxKeys', payload.maxKeys.toString());
    }
    if (payload?.continuationToken) {
        params.append('continuationToken', payload.continuationToken);
    }

    const queryString = params.toString();
    const url = `/upload/file/get-all-files${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    
    if (response.data?.success && response.data?.data) {
        // Convert lastModified strings to Date objects
        const data = response.data.data;
        if (data.files && Array.isArray(data.files)) {
            data.files = data.files.map((file: any) => ({
                ...file,
                lastModified: file.lastModified ? new Date(file.lastModified) : new Date(),
            }));
        }
        return data;
    }

    throw new Error(response.data?.message || 'Failed to get files');
};

export default {
    initiateMultipartUpload,
    uploadChunk,
    completeMultipartUpload,
    abortMultipartUpload,
    getUploadedParts,
    directUpload,
    getAllFiles,
};

