import React, { useReducer, useContext, createContext, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import fileApi from '@/api/file.api';
import { useAuth } from './useAuth';
import type {
    CreateFolderInput,
    RenameFolderInput,
    MoveFileOrFolderInput,
    CreateFileInput,
    ShareFileOrFolderInput,
    FileSystemNode,
    SharedFileSystemNode,
} from '@/types/file.types';

interface FileState {
    fileSystemTree: FileSystemNode[];
    trash: FileSystemNode[];
    sharedFiles: SharedFileSystemNode[];
    sharedFilesByMe: SharedFileSystemNode[];
    sharedFilesWithMe: SharedFileSystemNode[];
    recents: { files: Array<Pick<FileSystemNode, 'id' | 'name' | 'access_level' | 'file_info' | 'created_at' | 'last_accessed_at'>>; metadata: { total: number; page: number; limit: number; totalPages: number } } | null;
    loading: boolean;
}

type FileAction =
    | { type: 'SET_FILE_SYSTEM_TREE'; fileSystemTree: FileSystemNode[] }
    | { type: 'SET_TRASH'; trash: FileSystemNode[] }
    | { type: 'SET_SHARED_FILES'; sharedFiles: SharedFileSystemNode[] }
    | { type: 'SET_SHARED_FILES_BY_ME'; sharedFilesByMe: SharedFileSystemNode[] }
    | { type: 'SET_SHARED_FILES_WITH_ME'; sharedFilesWithMe: SharedFileSystemNode[] }
    | { type: 'SET_RECENTS'; recents: FileState['recents'] }
    | { type: 'SET_LOADING'; loading: boolean };

const initialState: FileState = {
    fileSystemTree: [],
    trash: [],
    sharedFiles: [],
    sharedFilesByMe: [],
    sharedFilesWithMe: [],
    recents: null,
    loading: false,
};

function fileReducer(state: FileState, action: FileAction): FileState {
    switch (action.type) {
        case 'SET_FILE_SYSTEM_TREE':
            return { ...state, fileSystemTree: action.fileSystemTree };
        case 'SET_TRASH':
            return { ...state, trash: action.trash };
        case 'SET_SHARED_FILES':
            return { ...state, sharedFiles: action.sharedFiles };
        case 'SET_SHARED_FILES_BY_ME':
            return { ...state, sharedFilesByMe: action.sharedFilesByMe };
        case 'SET_SHARED_FILES_WITH_ME':
            return { ...state, sharedFilesWithMe: action.sharedFilesWithMe };
        case 'SET_RECENTS':
            return { ...state, recents: action.recents };
        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        default:
            return state;
    }
}

type MutationResult = Promise<{ success: boolean; error?: string }>;

interface FileContextType extends FileState {
    createFolder: (data: CreateFolderInput) => MutationResult;
    renameFolder: (id: string, data: RenameFolderInput) => MutationResult;
    moveFileOrFolder: (id: string, data: MoveFileOrFolderInput) => MutationResult;
    createFile: (data: CreateFileInput) => MutationResult;
    shareFileOrFolder: (file_id: string, data: ShareFileOrFolderInput) => MutationResult;
    getAllSharedFiles: () => Promise<SharedFileSystemNode[]>;
    getAllSharedFilesByMe: () => Promise<SharedFileSystemNode[]>;
    getAllSharedFilesWithMe: () => Promise<SharedFileSystemNode[]>;
    getFileSystemTree: () => Promise<FileSystemNode[]>;
    getTrash: () => Promise<FileSystemNode[]>;
    getRecents: (page?: number, limit?: number) => Promise<FileState['recents']>;
    deleteFileOrFolder: (id: string) => MutationResult;
    restoreFileOrFolder: (id: string) => MutationResult;
    emptyTrash: () => MutationResult;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(fileReducer, initialState);
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // 🔹 Queries
    const { data: fileSystemTreeData, isLoading: fileSystemTreeLoading } = useQuery<FileSystemNode[]>({
        queryKey: ['fileSystemTree'],
        queryFn: async () => {
            const result = await fileApi.getFileSystemTree();
            return result.data;
        },
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!user, // Only enable the query when user is authenticated
    });

    const { data: trashData, isLoading: trashLoading } = useQuery<FileSystemNode[]>({
        queryKey: ['trash'],
        queryFn: async () => {
            const result = await fileApi.getTrash();
            return result.data;
        },
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!user, // Only enable the query when user is authenticated
    });

    // Update fileSystemTree in state when query data changes
    React.useEffect(() => {
        if (fileSystemTreeData) {
            dispatch({ type: 'SET_FILE_SYSTEM_TREE', fileSystemTree: fileSystemTreeData });
        }
    }, [fileSystemTreeData]);

    // Update trash in state when query data changes
    React.useEffect(() => {
        if (trashData) {
            dispatch({ type: 'SET_TRASH', trash: trashData });
        }
    }, [trashData]);

    // 🔹 Mutations
    const { mutateAsync: createFolderMutationFn } = useMutation({
        mutationFn: async (data: CreateFolderInput) => {
            const result = await fileApi.createFolder(data);
            return result.data;
        },
        retry: false,
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            // Invalidate and refetch file system tree
            queryClient.invalidateQueries({ queryKey: ['fileSystemTree'] });
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: renameFolderMutationFn } = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: RenameFolderInput }) => {
            const result = await fileApi.renameFolder(id, data);
            return result.data;
        },
        retry: false,
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            // Invalidate and refetch file system tree
            queryClient.invalidateQueries({ queryKey: ['fileSystemTree'] });
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: moveFileOrFolderMutationFn } = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: MoveFileOrFolderInput }) => {
            const result = await fileApi.moveFileOrFolder(id, data);
            return result.data;
        },
        retry: false,
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            // Invalidate and refetch file system tree
            queryClient.invalidateQueries({ queryKey: ['fileSystemTree'] });
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: createFileMutationFn } = useMutation({
        mutationFn: async (data: CreateFileInput) => {
            const result = await fileApi.createFile(data);
            return result.data;
        },
        retry: false,
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
            // Invalidate and refetch file system tree
            queryClient.invalidateQueries({ queryKey: ['fileSystemTree'] });
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    const { mutateAsync: shareFileOrFolderMutationFn } = useMutation({
        mutationFn: async ({ file_id, data }: { file_id: string; data: ShareFileOrFolderInput }) => {
            const result = await fileApi.shareFileOrFolder(file_id, data);
            return result.data;
        },
        retry: false,
        onSuccess: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
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
        retry: false,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fileSystemTree'] });
            queryClient.invalidateQueries({ queryKey: ['trash'] });
            dispatch({ type: 'SET_LOADING', loading: false });
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
        retry: false,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fileSystemTree'] });
            queryClient.invalidateQueries({ queryKey: ['trash'] });
            dispatch({ type: 'SET_LOADING', loading: false });
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
        retry: false,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trash'] });
            dispatch({ type: 'SET_LOADING', loading: false });
        },
        onError: () => {
            dispatch({ type: 'SET_LOADING', loading: false });
        },
    });

    // 🔹 Wrapped Actions
    const createFolder = async (data: CreateFolderInput) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await createFolderMutationFn(data);
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });

            // Handle different error structures
            let errorMessage = 'Failed to create folder.';

            if (error?.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
                // API returned errors array
                errorMessage = error.response.data.errors[0];
            } else if (error?.response?.data?.message) {
                // API returned message field
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                // Standard error message
                errorMessage = error.message;
            }

            return { success: false, error: errorMessage };
        }
    };

    const renameFolder = async (id: string, data: RenameFolderInput) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await renameFolderMutationFn({ id, data });
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            // Handle different error structures
            let errorMessage = 'Failed to create folder.';

            if (error?.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
                // API returned errors array
                errorMessage = error.response.data.errors[0];
            } else if (error?.response?.data?.message) {
                // API returned message field
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                // Standard error message
                errorMessage = error.message;
            }
            return { success: false, error: errorMessage };
        }
    };

    const moveFileOrFolder = async (id: string, data: MoveFileOrFolderInput) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await moveFileOrFolderMutationFn({ id, data });
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to move file or folder.';
            return { success: false, error: errorMessage };
        }
    };

    const createFile = async (data: CreateFileInput) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await createFileMutationFn(data);
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create file.';
            return { success: false, error: errorMessage };
        }
    };

    const shareFileOrFolder = async (file_id: string, data: ShareFileOrFolderInput) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            await shareFileOrFolderMutationFn({ file_id, data });
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to share file or folder.';
            return { success: false, error: errorMessage };
        }
    };

    const getAllSharedFiles = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await fileApi.getAllSharedFiles();
            dispatch({ type: 'SET_SHARED_FILES', sharedFiles: result.data });
            dispatch({ type: 'SET_LOADING', loading: false });
            return result.data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to get all shared files.';
            throw new Error(errorMessage);
        }
    };

    const getAllSharedFilesByMe = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await fileApi.getAllSharedFilesByMe();
            dispatch({ type: 'SET_SHARED_FILES_BY_ME', sharedFilesByMe: result.data });
            dispatch({ type: 'SET_LOADING', loading: false });
            return result.data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to get all shared files by me.';
            throw new Error(errorMessage);
        }
    };

    const getAllSharedFilesWithMe = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const result = await fileApi.getAllSharedFilesWithMe();
            dispatch({ type: 'SET_SHARED_FILES_WITH_ME', sharedFilesWithMe: result.data });
            dispatch({ type: 'SET_LOADING', loading: false });
            return result.data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to get all shared files with me.';
            throw new Error(errorMessage);
        }
    };

    const getFileSystemTree = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            // Refetch the query to get fresh data
            const data = await queryClient.fetchQuery({
                queryKey: ['fileSystemTree'],
                queryFn: async () => {
                    const result = await fileApi.getFileSystemTree();
                    return result.data;
                },
            });
            dispatch({ type: 'SET_FILE_SYSTEM_TREE', fileSystemTree: data });
            dispatch({ type: 'SET_LOADING', loading: false });
            return data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to get file system tree.';
            throw new Error(errorMessage);
        }
    };

    const getTrash = async () => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            // Refetch the query to get fresh data
            const data = await queryClient.fetchQuery({
                queryKey: ['trash'],
                queryFn: async () => {
                    const result = await fileApi.getTrash();
                    return result.data;
                },
            });
            dispatch({ type: 'SET_TRASH', trash: data });
            dispatch({ type: 'SET_LOADING', loading: false });
            return data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to get trash.';
            throw new Error(errorMessage);
        }
    };

    const getRecents = async (page: number = 1, limit: number = 20) => {
        try {
            dispatch({ type: 'SET_LOADING', loading: true });
            const data = await queryClient.fetchQuery({
                queryKey: ['recents', page, limit],
                queryFn: async () => {
                    const result = await fileApi.getRecents(page, limit);
                    return result.data as FileState['recents'];
                },
                staleTime: 2 * 60 * 1000, // 2 minutes
                gcTime: 5 * 60 * 1000,
            });
            dispatch({ type: 'SET_RECENTS', recents: data });
            dispatch({ type: 'SET_LOADING', loading: false });
            return data;
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to get recents.';
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
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete file or folder.';
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
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to restore file or folder.';
            return { success: false, error: errorMessage };
        }
    };

    const emptyTrash = async () => {
        try {
            if (state.trash.length > 0) {
                dispatch({ type: 'SET_LOADING', loading: true });
                await emptyTrashMutationFn();
            }
            return { success: true };
        } catch (error: any) {
            dispatch({ type: 'SET_LOADING', loading: false });
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to empty trash.';
            return { success: false, error: errorMessage };
        }
    };

    const value: FileContextType = {
        ...state,
        loading: state.loading || fileSystemTreeLoading || trashLoading,
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
        getRecents,
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