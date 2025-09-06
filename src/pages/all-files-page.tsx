"use client"
import { useState, useMemo } from "react"
import type { FileItem, FileActionHandlers } from "@/types/file-manager"
import { FileManagerHeader } from "@/components/file-manager/FileManagerHeader"
import { BreadcrumbNavigation } from "@/components/file-manager/BreadcrumbNavigation"
import { Toolbar } from "@/components/file-manager/Toolbar"
import { BulkActionsBar } from "@/components/file-manager/BulkActionsBar"
import { FileManager } from "@/components/file-manager/FileManager"
import { AddNewFolder } from "@/components/file-manager/AddNewFolder"
import { standardPageConfig, defaultViewConfig } from "@/config/page-configs"

import { useFile } from "@/contexts/fileContext"
import { transformFileSystemNodesToFileItems } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

export default function AllFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<Array<{ id: string, name: string }>>([])
  // Rename popup state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null)

  const { createFolder, fileSystemTree, deleteFileOrFolder, renameFolder, moveFileOrFolder } = useFile();
  const navigate = useNavigate();

  // Transform dynamic data to FileItem format
  const transformedFileSystem = useMemo(() => {
    return transformFileSystemNodesToFileItems(fileSystemTree)
  }, [fileSystemTree])

  let currentItems = useMemo(() => {
    let items: FileItem[] = transformedFileSystem
    for (const folder of currentPath) {
      const foundFolder = items.find((item) => item.id === folder.id && item.type === "folder")
      if (foundFolder?.children) {
        items = foundFolder.children
      }
    }
    return items
  }, [currentPath, transformedFileSystem])

  const filteredFiles = useMemo(() => {
    // search filter 
    return currentItems.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [currentItems, searchQuery])

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const selectAllFiles = () => {
    setSelectedFiles(selectedFiles.length === filteredFiles.length ? [] : filteredFiles.map((f) => f.id))
  }

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      setCurrentPath([...currentPath, { id: item.id, name: item.name }])
      setSelectedFiles([])
      setSearchQuery("")
    }
  }

  const handleBreadcrumbNavigate = (index: number) => {
    if (index === -1) {
      setCurrentPath([])
    } else {
      setCurrentPath(currentPath.slice(0, index + 1))
    }
    setSelectedFiles([])
    setSearchQuery("")
  }

  const handleBackClick = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1))
      setSelectedFiles([])
    }
  }

  const handleCreateFolder = async (folderName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Find the parent folder ID based on current path
      let parentId: string | undefined = undefined

      // Get the last folder in the current path as the parent
      if (currentPath.length > 0) {
        const lastFolder = currentPath[currentPath.length - 1]
        parentId = lastFolder.id
      }

      const result = await createFolder({
        name: folderName,
        parent_id: parentId
      })

      return result
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to create folder'
      }
    }
  }

  const handleUploadClick = () => {
    const lastItem = currentPath[currentPath.length - 1];
    // If currentPath is empty → fallback to root
    const folderId = lastItem?.id ?? "root";
    const folderName = lastItem?.name ?? "root";
    navigate(`/all-files/${folderId}`, {
      state: { folder_id: folderId, folder_name: folderName }
    });
  }

  const handleDeleteFile = async (file: FileItem) => {
    // Remove from selected files if it was selected
    const result = await deleteFileOrFolder(file.id);
    if (result.success) {
      setSelectedFiles(prev => prev.filter(id => id !== file.id));
    }
  }

  const handleRenameFile = (file: FileItem) => {
    setFileToRename(file);
    setIsRenameModalOpen(true);
  }

  const handleRenameFolder = async (folderId: string, folderName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await renameFolder(folderId, { name: folderName });
      if (result.success) {
        setIsRenameModalOpen(false);
        setFileToRename(null);
      }
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to rename folder'
      };
    }
  }

  const handleCloseRenameModal = () => {
    setIsRenameModalOpen(false);
    setFileToRename(null);
  }

  const handleMoveFile = async (file: FileItem) => {
    try {
      // For now, we'll just log the move action
      // In a real implementation, you would open a folder picker modal
      console.log("Move file:", file.name);

      // Example: Move to root folder (you can implement a folder picker here)
      const result = await moveFileOrFolder(file.id, {
        target_folder_id: currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null
      });

      if (result.success) {
        console.log("File moved successfully");
        // Remove from selected files if it was selected
        setSelectedFiles(prev => prev.filter(id => id !== file.id));
      } else {
        console.error("Failed to move file:", result.error);
      }
    } catch (error) {
      console.error("Error moving file:", error);
    }
  }

  const actionHandlers: FileActionHandlers = {
    onFileSelect: toggleFileSelection,
    onItemClick: handleItemClick,
    onDownload: (file) => console.log("Download", file.name),
    onShare: (file) => console.log("Share", file.name),
    onMove: handleMoveFile,
    onRename: handleRenameFile,
    onDelete: handleDeleteFile,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <FileManagerHeader
          currentPath={currentPath}
          filteredFilesCount={filteredFiles.length}
          onBackClick={handleBackClick}
          onCreateFolder={handleCreateFolder}
          onUploadClick={handleUploadClick}
        />

        {currentPath.length > 0 && (
          <BreadcrumbNavigation currentPath={currentPath} onNavigate={handleBreadcrumbNavigate} />
        )}

        <Toolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilesCount={selectedFiles.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <BulkActionsBar
          selectedFilesCount={selectedFiles.length}
          totalFilesCount={filteredFiles.length}
          onSelectAll={selectAllFiles}
        />

        <FileManager
          files={filteredFiles}
          selectedFiles={selectedFiles}
          pageConfig={standardPageConfig}
          viewConfig={defaultViewConfig}
          actionHandlers={actionHandlers}
          viewMode={viewMode}
          onCreateFolder={handleCreateFolder}
        />

        {/* Rename Modal */}
        {fileToRename && (
          <AddNewFolder
            isEditMode={true}
            initialName={fileToRename.name}
            folderId={fileToRename.id}
            onEditFolder={handleRenameFolder}
            isOpen={isRenameModalOpen}
            onClose={handleCloseRenameModal}
            onAddFolder={async () => ({ success: false, error: "Not used in edit mode" })}
          />
        )}
      </div>
    </div>
  )
}
