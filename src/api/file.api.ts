import apiClient from "@/api/axios";


const createFolder = async (data: any) => {
    try {
        const response = await apiClient.post('/file-flow/folder', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const renameFolder = async (id: string, data: any) => {
    try {
        const response = await apiClient.patch(`/file-flow/folder/${id}/rename`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const moveFileOrFolder = async (id: string, data: any) => {
    try {
        const response = await apiClient.patch(`/file-flow/folder/${id}/move`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const createFile = async (data: any) => {
    try {
        const response = await apiClient.post('/file-flow/file', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const shareFileOrFolder = async (id: string, data: any) => {
    try {
        const response = await apiClient.post(`/file-flow/share/file/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getAllSharedFiles = async () => {
    try {
        const response = await apiClient.get('/file-flow/share/file/all-shared-files');
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getAllSharedFilesByMe = async () => {
    try {
        const response = await apiClient.get('/file-flow/share/file/shared-by-me');
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getAllSharedFilesWithMe = async () => {
    try {
        const response = await apiClient.get('/file-flow/share/file/shared-with-me');
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getFileSystemTree = async () => {
    try {
        const response = await apiClient.get('/file-flow/file/all');
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getTrash = async () => {
    try {
        const response = await apiClient.get('/file-flow/file/trash');
        return response.data;
    } catch (error) {
        throw error;
    }
};

const deleteFileOrFolder = async (id: string) => {
    try {
        const response = await apiClient.delete(`/file-flow/file/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const restoreFileOrFolder = async (id: string) => {
    try {
        const response = await apiClient.post(`/file-flow/file/${id}/restore`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const emptyTrash = async () => {
    try {
        const response = await apiClient.delete('/file-flow/file/empty-trash');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default {
    createFolder,
    renameFolder,
    moveFileOrFolder,
    createFile,
    shareFileOrFolder,
    getAllSharedFiles,
    getAllSharedFilesByMe,
    getAllSharedFilesWithMe,
    getFileSystemTree,
    getTrash,
    deleteFileOrFolder,
    restoreFileOrFolder,
    emptyTrash,
};