import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { FileSystemNode } from "@/types/file.types"
import type { FileItem, StandardFileItem, DeletedFileItem } from "@/types/file-manager"
import {
  FileText,
  FolderIcon,
  ImageIcon,
  Video,
  Music,
  Archive,
} from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Helper function to format date
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  // Handle both Date objects and date strings
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)
  const diffInDays = diffInHours / 24

  if (diffInHours < 1) return 'Less than an hour ago'
  if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`
  if (diffInDays < 7) return `${Math.floor(diffInDays)} days ago`
  return dateObj.toLocaleDateString()
}

// Helper function to get file icon based on file type
export function getFileIcon(fileType: string | null) {
  if (!fileType) return FolderIcon

  if (fileType.includes('image/')) return ImageIcon
  if (fileType.includes('video/')) return Video
  if (fileType.includes('audio/')) return Music
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText
  if (fileType.includes('zip') || fileType.includes('archive')) return Archive

  return FileText
}

// Helper function to determine file type category
export function getFileTypeCategory(fileType: string | null): string {
  if (!fileType) return 'folder'

  if (fileType.includes('image/')) return 'image'
  if (fileType.includes('video/')) return 'video'
  if (fileType.includes('audio/')) return 'audio'
  if (fileType.includes('pdf')) return 'pdf'
  if (fileType.includes('document') || fileType.includes('word')) return 'document'
  if (fileType.includes('presentation')) return 'presentation'
  if (fileType.includes('figma')) return 'figma'
  if (fileType.includes('zip') || fileType.includes('archive')) return 'archive'

  return 'document'
}

// Transform FileSystemNode to FileItem
export function transformFileSystemNodeToFileItem(
  node: FileSystemNode,
  parentPath: string[] = []
): StandardFileItem {
  const isFolder = node.is_folder
  const fileType = node.file_info?.file_type || null
  const size = node.file_info?.file_size || 0
  const thumbnail = node.file_info?.thumbnail_path || null

  // Handle potential null updated_at
  const modifiedDate = node.updated_at || node.created_at

  return {
    id: node.id,
    name: node.name,
    type: isFolder ? "folder" : "file",
    fileType: isFolder ? "folder" : getFileTypeCategory(fileType),
    size: isFolder ? "—" : formatFileSize(size),
    modified: formatRelativeTime(modifiedDate),
    icon: isFolder ? FolderIcon : getFileIcon(fileType),
    thumbnail,
    file_info: node.file_info || undefined,
    starred: false, // This would need to be fetched from favorites API
    shared: node.access_level === "public", // Simplified assumption
    parentPath,
    variant: "standard",
    children: node.children ? node.children.map(child =>
      transformFileSystemNodeToFileItem(child, [...parentPath, node.name])
    ) : undefined,
  }
}

// Transform FileSystemNode array to FileItem array
export function transformFileSystemNodesToFileItems(nodes: FileSystemNode[]): StandardFileItem[] {
  return nodes.map(node => transformFileSystemNodeToFileItem(node))
}

// Transform FileSystemNode to DeletedFileItem
export function transformFileSystemNodeToDeletedFileItem(
  node: FileSystemNode,
  parentPath: string[] = []
): DeletedFileItem {
  const isFolder = node.is_folder
  const fileType = node.file_info?.file_type || null
  const size = node.file_info?.file_size || 0
  const thumbnail = node.file_info?.thumbnail_path || null

  // Handle potential null updated_at
  const modifiedDate = node.updated_at || node.created_at

  // Calculate days left (assuming 30 days retention period)
  const deletedDate = new Date(modifiedDate)
  const now = new Date()
  const daysSinceDeleted = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysLeft = Math.max(0, 30 - daysSinceDeleted)

  return {
    id: node.id,
    name: node.name,
    type: isFolder ? "folder" : "file",
    fileType: isFolder ? "folder" : getFileTypeCategory(fileType),
    size: isFolder ? "—" : formatFileSize(size),
    modified: formatRelativeTime(modifiedDate),
    icon: isFolder ? FolderIcon : getFileIcon(fileType),
    thumbnail,
    file_info: node.file_info || undefined,
    starred: false,
    shared: false,
    parentPath,
    variant: "deleted",
    deletedDate: deletedDate.toLocaleDateString(),
    deletedBy: "System", // This would need to be fetched from the API
    daysLeft,
    originalLocation: parentPath.length > 0 ? `/${parentPath.join('/')}` : "/",
    children: node.children ? node.children.map(child =>
      transformFileSystemNodeToDeletedFileItem(child, [...parentPath, node.name])
    ) : undefined,
  }
}

// Transform FileSystemNode array to DeletedFileItem array
export function transformFileSystemNodesToDeletedFileItems(nodes: FileSystemNode[]): DeletedFileItem[] {
  return nodes.map(node => transformFileSystemNodeToDeletedFileItem(node))
}
