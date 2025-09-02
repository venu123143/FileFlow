import React, { useReducer, useContext, createContext, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import fileApi from '@/api/file.api';
import { toast } from 'sonner';

interface FileState {
    files: any[];
    loading: boolean;
}

type FileAction =
    | { type: 'SET_FILES'; files: any[] }
    | { type: 'SET_LOADING'; loading: boolean };

const initialState: FileState = {
    files: [],
    loading: false,
};

function fileReducer(state: FileState, action: FileAction): FileState {
    switch (action.type) {
        case 'SET_FILES':
            return { ...state, files: action.files };
        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        default:
            return state;
    }
}

interface FileContextType extends FileState {
    createFolder: (data: any) => Promise<{ success: boolean; error?: string }>;
    renameFolder: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
    moveFileOrFolder: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
    createFile: (data: any) => Promise<{ success: boolean; error?: string }>;
    shareFileOrFolder: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
    getAllSharedFiles: () => Promise<any>;
    getAllSharedFilesByMe: () => Promise<any>;
    getAllSharedFilesWithMe: () => Promise<any>;
    getFileSystemTree: () => Promise<any>;
    getTrash: () => Promise<any>;
    deleteFileOrFolder: (id: string) => Promise<{ success: boolean; error?: string }>;
    restoreFileOrFolder: (id: string) => Promise<{ success: boolean; error?: string }>;
    emptyTrash: () => Promise<{ success: boolean; error?: string }>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(fileReducer, initialState);
    //   const queryClient = useQueryClient();

    const { mutateAsync: createFolderMutationFn } = useMutation({
        mutationFn: async (data: any) => {
            const result = await fileApi.createFolder(data);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("Folder created successfully!");
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: renameFolderMutationFn } = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const result = await fileApi.renameFolder(id, data);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("Folder renamed successfully!");
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: moveFileOrFolderMutationFn } = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const result = await fileApi.moveFileOrFolder(id, data);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("File or folder moved successfully!");
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: createFileMutationFn } = useMutation({
        mutationFn: async (data: any) => {
            const result = await fileApi.createFile(data);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("File created successfully!");
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: shareFileOrFolderMutationFn } = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const result = await fileApi.shareFileOrFolder(id, data);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("File or folder shared successfully!");
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: deleteFileOrFolderMutationFn } = useMutation({
        mutationFn: async (id: string) => {
            const result = await fileApi.deleteFileOrFolder(id);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("File or folder deleted successfully!");
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: restoreFileOrFolderMutationFn } = useMutation({
        mutationFn: async (id: string) => {
            const result = await fileApi.restoreFileOrFolder(id);
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("File or folder restored successfully!");
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: emptyTrashMutationFn } = useMutation({
        mutationFn: async () => {
            const result = await fileApi.emptyTrash();
            return result.data;
        },
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            toast.success("Trash emptied successfully!");
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const createFolder = async (data: any) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await createFolderMutationFn(data);
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to create folder.";
            return { success: false, error: errorMessage };
        }
    };

    const renameFolder = async (id: string, data: any) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await renameFolderMutationFn({ id, data });
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to rename folder.";
            return { success: false, error: errorMessage };
        }
    };

    const moveFileOrFolder = async (id: string, data: any) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await moveFileOrFolderMutationFn({ id, data });
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to move file or folder.";
            return { success: false, error: errorMessage };
        }
    };

    const createFile = async (data: any) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await createFileMutationFn(data);
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to create file.";
            return { success: false, error: errorMessage };
        }
    };

    const shareFileOrFolder = async (id: string, data: any) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await shareFileOrFolderMutationFn({ id, data });
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to share file or folder.";
            return { success: false, error: errorMessage };
        }
    };

    const getAllSharedFiles = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await fileApi.getAllSharedFiles();
            dispatch({ type: 'SET_LOADING', loading: false });
            return result.data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to get all shared files.";
            throw new Error(errorMessage);
        }
    };

    const getAllSharedFilesByMe = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await fileApi.getAllSharedFilesByMe();
            dispatch({ type: 'SET_LOADING', loading: false });
            return result.data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to get all shared files by me.";
            throw new Error(errorMessage);
        }
    };

    const getAllSharedFilesWithMe = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await fileApi.getAllSharedFilesWithMe();
            dispatch({ type: 'SET_LOADING', loading: false });
            return result.data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to get all shared files with me.";
            throw new Error(errorMessage);
        }
    };

    const getFileSystemTree = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await fileApi.getFileSystemTree();
            dispatch({ type: 'SET_LOADING', loading: false });
            return result.data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to get file system tree.";
            throw new Error(errorMessage);
        }
    };

    const getTrash = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await fileApi.getTrash();
            dispatch({ type: 'SET_LOADING', loading: false });
            return result.data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to get trash.";
            throw new Error(errorMessage);
        }
    };

    const deleteFileOrFolder = async (id: string) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await deleteFileOrFolderMutationFn(id);
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete file or folder.";
            return { success: false, error: errorMessage };
        }
    };

    const restoreFileOrFolder = async (id: string) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await restoreFileOrFolderMutationFn(id);
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to restore file or folder.";
            return { success: false, error: errorMessage };
        }
    };

    const emptyTrash = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await emptyTrashMutationFn();
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to empty trash.";
            return { success: false, error: errorMessage };
        }
    };

    const value: FileContextType = {
        ...state,
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

    return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};

export const useFile = () => {
    const context = useContext(FileContext);
    if (!context) {
        throw new Error('useFile must be used within a FileProvider');
    }
    return context;
};