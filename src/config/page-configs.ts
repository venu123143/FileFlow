import type { PageConfig, ViewConfig } from "@/types/file-manager";
import { Trash2, Lock, Users, FolderIcon } from "lucide-react";

// Standard page configuration
export const standardPageConfig: PageConfig = {
  variant: "standard",
  showThumbnails: true,
  showSize: true,
  showModified: true,
  showStarred: true,
  showShared: true,
  emptyStateMessage: "This folder is empty",
  emptyStateIcon: FolderIcon,
};

// Deleted files page configuration
export const deletedPageConfig: PageConfig = {
  variant: "deleted",
  showThumbnails: false,
  showSize: true,
  showModified: false,
  showStarred: false,
  showShared: false,
  showDeletedInfo: true,
  emptyStateMessage: "No deleted files found",
  emptyStateIcon: Trash2,
};

// Private files page configuration
export const privatePageConfig: PageConfig = {
  variant: "private",
  showThumbnails: true,
  showSize: true,
  showModified: true,
  showStarred: true,
  showShared: false,
  showEncrypted: true,
  showSensitive: true,
  emptyStateMessage: "No private files found",
  emptyStateIcon: Lock,
  customActions: [
    {
      label: "Encrypt",
      icon: Lock,
      action: () => {},
      variant: "secondary",
    },
    {
      label: "Decrypt",
      icon: Lock,
      action: () => {},
      variant: "secondary",
    },
  ],
};

// Shared files page configuration
export const sharedPageConfig: PageConfig = {
  variant: "shared",
  showThumbnails: true,
  showSize: true,
  showModified: true,
  showStarred: true,
  showShared: true,
  showSharedInfo: true,
  emptyStateMessage: "No shared files found",
  emptyStateIcon: Users,
  customActions: [
    {
      label: "Change Permission",
      icon: Users,
      action: () => {},
      variant: "secondary",
    },
  ],
};

// View configurations
export const defaultViewConfig: ViewConfig = {
  grid: {
    columns: {
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
      "2xl": 6,
    },
    gap: "gap-4",
    itemHeight: "h-auto",
  },
  list: {
    showThumbnails: true,
    showSize: true,
    showModified: true,
    itemHeight: "h-16",
  },
};

export const compactViewConfig: ViewConfig = {
  grid: {
    columns: {
      sm: 3,
      md: 4,
      lg: 5,
      xl: 6,
      "2xl": 7,
    },
    gap: "gap-3",
    itemHeight: "h-auto",
  },
  list: {
    showThumbnails: false,
    showSize: true,
    showModified: true,
    itemHeight: "h-12",
  },
};

// Helper function to get page config by variant
export const getPageConfig = (variant: PageConfig["variant"]): PageConfig => {
  switch (variant) {
    case "deleted":
      return deletedPageConfig;
    case "private":
      return privatePageConfig;
    case "shared":
      return sharedPageConfig;
    default:
      return standardPageConfig;
  }
};
