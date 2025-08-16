import type { LucideIcon } from "lucide-react";

export interface FileItem {
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
