export const SHARE_PERMISSION = {
    VIEW: 'view',
    EDIT: 'edit',
    ADMIN: 'admin',
} as const;

export const ACCESS_LEVEL = {
    PUBLIC: "public",
    PRIVATE: "private",
    PROTECTED: "protected",
} as const;

export type SharePermission = typeof SHARE_PERMISSION[keyof typeof SHARE_PERMISSION];
export type AccessLevel = typeof ACCESS_LEVEL[keyof typeof ACCESS_LEVEL];

export interface AccessLevelAttributes {
    id?: string;
    access_level: AccessLevel;
    created_at?: Date;
    updated_at?: Date;
}


export interface CreateFolderInput {
    name: string;
    parent_id?: string;
    access_level?: AccessLevel;
    description?: string;
    tags?: string[];
}



export interface UpdateFolderInput {
    name?: string;
    access_level?: AccessLevel;
    description?: string;
    tags?: string[];
}

export interface RenameFolderInput {
    name: string;
}

export interface MoveFileOrFolderInput {
    target_folder_id?: string | null;
}

export interface FileInfo {
    file_type: string; // e.g. "image/png"
    file_size: number; // in bytes
    storage_path: string;
    thumbnail_path?: string | null;
    duration?: number | null;
}



export interface CreateFileInput {
    name: string;
    parent_id?: string | null;
    access_level?: AccessLevel;
    description?: string | null;
    tags?: string[];
    file_info: FileInfo;
}

export interface ShareFileOrFolderInput {
    shared_with_user_id: string;
    permission_level: SharePermission;
    message?: string;
    expires_at?: Date;
}

export interface FileSystemNode {
    id: string;
    owner_id: string;
    parent_id: string | null;
    name: string;
    is_folder: boolean;
    access_level: string;
    file_info: FileInfo | null;
    description: string | null;
    tags: string[];
    metadata: any | null;
    last_accessed_at: Date | null;
    created_at: Date;
    updated_at: Date;
    children: FileSystemNode[];
}

export interface SharedUserDetails {
    id: string;
    email: string;
    display_name: string;
    avatar_url?: string;
}

export interface SharedFileSystemNode {
    id: string;
    owner_id: string;
    parent_id: string | null;
    name: string;
    is_folder: boolean;
    access_level: string;
    file_info?: FileInfo | null;
    description?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    last_accessed_at?: Date;
    created_at: Date;
    updated_at: Date;

    // Share information
    share_id: string;
    shared_by_user_id: string;
    shared_with_user_id: string;

    // User details objects
    shared_by_user: SharedUserDetails;
    shared_with_user: SharedUserDetails;

    permission_level: string;
    share_message?: string;
    expires_at?: Date;
    share_created_at: Date;

    // Recursive children
    children: SharedFileSystemNode[];
}