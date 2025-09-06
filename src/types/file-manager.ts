import type { LucideIcon } from "lucide-react";
import type { FileInfo } from "./file.types";

// Base file item interface
export interface BaseFileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  size: string;
  modified: string;
  icon: LucideIcon;
  thumbnail?: string | null;
  starred: boolean;
  shared: boolean;
  parentPath: string[];
  children?: FileItem[];
  file_info?: FileInfo;
}

// Extended interfaces for different page types
export interface StandardFileItem extends BaseFileItem {
  variant: "standard";
}

export interface DeletedFileItem extends BaseFileItem {
  variant: "deleted";
  deletedDate: string;
  deletedBy: string;
  daysLeft: number;
  originalLocation: string;
}

export interface PrivateFileItem extends BaseFileItem {
  variant: "private";
  encrypted: boolean;
  sensitive: boolean;
}

export interface SharedFileItem extends BaseFileItem {
  variant: "shared";
  sharedBy: {
    name: string;
    avatar?: string | null;
    initials: string;
  };
  sharedWith: Array<{
    name: string;
    avatar?: string | null;
    initials: string;
  }>;
  permission: "view" | "edit" | "admin";
  sharedDate: string;
  isOwner: boolean;
}

// Union type for all file item variants
export type FileItem = StandardFileItem | DeletedFileItem | PrivateFileItem | SharedFileItem;

// Page configuration interface
export interface PageConfig {
  variant: "standard" | "deleted" | "private" | "shared";
  showThumbnails?: boolean;
  showSize?: boolean;
  showModified?: boolean;
  showStarred?: boolean;
  showShared?: boolean;
  showEncrypted?: boolean;
  showSensitive?: boolean;
  showDeletedInfo?: boolean;
  showSharedInfo?: boolean;
  showPrivateInfo?: boolean;
  customActions?: Array<{
    label: string;
    icon: LucideIcon;
    action: (file: FileItem) => void;
    variant?: "default" | "destructive" | "secondary";
  }>;
  emptyStateMessage?: string;
  emptyStateIcon?: LucideIcon;
}

// Grid and List configuration
export interface ViewConfig {
  grid: {
    columns: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
      "2xl": number;
    };
    gap: string;
    itemHeight?: string;
  };
  list: {
    showThumbnails: boolean;
    showSize: boolean;
    showModified: boolean;
    itemHeight: string;
  };
}

// Action handlers interface
export interface FileActionHandlers {
  onFileSelect: (fileId: string) => void;
  onItemClick: (item: FileItem) => void;
  onDownload?: (file: FileItem) => void;
  onShare?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
  onRename?: (file: FileItem) => void;
  onRestore?: (file: FileItem) => void;
  onEncrypt?: (file: FileItem) => void;
  onDecrypt?: (file: FileItem) => void;
  onMove?: (file: FileItem) => void;
  onPermissionChange?: (file: FileItem, permission: string) => void;
  onCustomAction?: (action: string, file: FileItem) => void;
}

// File manager props interface
export interface FileManagerProps {
  files: FileItem[];
  selectedFiles: string[];
  pageConfig: PageConfig;
  viewConfig: ViewConfig;
  actionHandlers: FileActionHandlers;
  viewMode: "grid" | "list";
  className?: string;
  onCreateFolder?: (folderName: string) => Promise<{ success: boolean; error?: string }>;
}

export const getFileTypeColor = (type?: string) => {
  switch (type) {
    case "pdf":
    case "presentation":
      return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
    case "image":
    case "figma":
      return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    case "video":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";
    case "audio":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
    case "folder":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
    case "document":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

// Type guards for different file variants
export const isDeletedFile = (file: FileItem): file is DeletedFileItem => {
  return file.variant === "deleted";
};

export const isPrivateFile = (file: FileItem): file is PrivateFileItem => {
  return file.variant === "private";
};

export const isSharedFile = (file: FileItem): file is SharedFileItem => {
  return file.variant === "shared";
};

export const isStandardFile = (file: FileItem): file is StandardFileItem => {
  return file.variant === "standard";
};
