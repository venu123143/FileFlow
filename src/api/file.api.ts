import apiClient from "@/api/axios";

const createFolder = async (data: any) => {
    const response = await apiClient.post("/file-flow/folder", data);
    return response.data;
};

const renameFolder = async (id: string, data: any) => {
    const response = await apiClient.patch(`/file-flow/folder/${id}/rename`, data);
    return response.data;
};

const moveFileOrFolder = async (id: string, data: any) => {
    const response = await apiClient.patch(`/file-flow/folder/${id}/move`, data);
    return response.data;
};

const createFile = async (data: any) => {
    const response = await apiClient.post("/file-flow/file", data);
    return response.data;
};

const shareFileOrFolder = async (file_id: string, data: any) => {
    const response = await apiClient.post(`/file-flow/share/file/${file_id}`, data);
    return response.data;
};

const revokeShare = async (shareId: string) => {
    const response = await apiClient.delete(`/file-flow/share/${shareId}`);
    return response.data;
};

const getAllSharedFiles = async () => {
    const response = await apiClient.get("/file-flow/share/file/all-shared-files");
    return response.data;
};

const getAllSharedFilesByMe = async () => {
    const response = await apiClient.get("/file-flow/share/file/shared-by-me");
    return response.data;
};

const getAllSharedFilesWithMe = async () => {
    const response = await apiClient.get("/file-flow/share/file/shared-with-me");
    return response.data;
};

const getFileSystemTree = async () => {
    const response = await apiClient.get("/file-flow/file/all?accessLevel=protected");
    return response.data;
};


const getPrivateFiles = async () => {
    const response = await apiClient.get("/file-flow/file/all?accessLevel=private");
    return response.data;
};

const getTrash = async () => {
    const response = await apiClient.get("/file-flow/file/trash");
    return response.data;
};

const deleteFileOrFolder = async (id: string) => {
    const response = await apiClient.delete(`/file-flow/file/${id}`);
    return response.data;
};

const restoreFileOrFolder = async (id: string) => {
    const response = await apiClient.post(`/file-flow/file/${id}/restore`);
    return response.data;
};

const emptyTrash = async () => {
    const response = await apiClient.delete("/file-flow/file/empty-trash");
    return response.data;
};

const getRecents = async (page: number = 1, limit: number = 20) => {
    const response = await apiClient.get(`/file-flow/file/recents`, {
        params: { page, limit }, withCredentials: true
    });
    return response.data;
};

const updateFileAccessLevel = async (id: string, data: any) => {
    const response = await apiClient.patch(`/file-flow/file/${id}/update-access-level`, data);
    return response.data;
};

export default {
    createFolder,
    renameFolder,
    moveFileOrFolder,
    createFile,
    getPrivateFiles,
    shareFileOrFolder,
    revokeShare,
    getAllSharedFiles,
    getAllSharedFilesByMe,
    getAllSharedFilesWithMe,
    getFileSystemTree,
    getTrash,
    deleteFileOrFolder,
    restoreFileOrFolder,
    emptyTrash,
    getRecents,
    updateFileAccessLevel,
};
