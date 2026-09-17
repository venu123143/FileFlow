"use client"
import { useState, useMemo } from "react"
import type { FileItem, FileActionHandlers } from "@/types/file-manager"
import { ACCESS_LEVEL, type SharePermission, type AccessLevel } from "@/types/file.types"
import { FileManagerHeader } from "@/components/file-manager/FileManagerHeader"
import { BreadcrumbNavigation } from "@/components/file-manager/BreadcrumbNavigation"
import { Toolbar } from "@/components/file-manager/Toolbar"
import { BulkActionsBar } from "@/components/file-manager/BulkActionsBar"
import { FileManager } from "@/components/file-manager/FileManager"
import { AddNewFolder } from "@/components/file-manager/AddNewFolder"
import { MoveFileModal } from "@/components/file-manager/MoveFileModal"
import { ShareFileModal } from "@/components/file-manager/ShareFileModal"
import { BulkDeleteDialog } from "@/components/file-manager/BulkDeleteDialog"
import { standardPageConfig, defaultViewConfig } from "@/config/page-configs"

import { useFile } from "@/contexts/fileContext"
import { transformFileSystemNodesToFileItems, quickSort, sizeToBytes } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { useSocket } from "@/contexts/SocketContext";
import { useFileDownload } from "@/hooks/useFileDownload";
import { toast } from "sonner";

export default function AllFilesPage() {
  const { socket } = useSocket();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<Array<{ id: string, name: string }>>([])
  // Rename popup state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null)
  // Move file popup state -- shared by the single-item and bulk flows
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [moveTargets, setMoveTargets] = useState<FileItem[]>([])
  const [moveIsBulk, setMoveIsBulk] = useState(false)
  // Share file popup state -- shared by the single-item and bulk flows
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [shareTargets, setShareTargets] = useState<FileItem[]>([])
  const [shareIsBulk, setShareIsBulk] = useState(false)
  // Bulk delete confirmation
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [isBulkBusy, setIsBulkBusy] = useState(false)
  const {
    createFolder, fileSystemTree, deleteFileOrFolder, renameFolder, moveFileOrFolder,
    shareFileOrFolder, updateFileAccessLevel,
    bulkDeleteFilesOrFolders, bulkMoveFilesOrFolders, bulkShareFilesOrFolders,
  } = useFile();
  const { downloadFile } = useFileDownload();
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
    // Search filter 
    let filtered = currentItems.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort using QuickSort algorithm
    filtered = quickSort(filtered, (a, b) => {
      // Folders always come first
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      // If both are folders or both are files, sort by size
      const sizeA = sizeToBytes(a.size);
      const sizeB = sizeToBytes(b.size);

      if (sortDirection === "ASC") {
        return sizeA - sizeB;
      } else {
        return sizeB - sizeA;
      }
    });

    return filtered;
  }, [currentItems, searchQuery, sortDirection])

  // The selection can outlive a folder change or a search, so resolve ids
  // against what is actually on screen before acting on them.
  const selectedItems = useMemo(
    () => filteredFiles.filter((file) => selectedFiles.includes(file.id)),
    [filteredFiles, selectedFiles]
  )

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
    } else {
      if (!socket) return;
      socket?.emit("last_accessed", { file_id: item.id })
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
        name: folderName.trim(),
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
      state: { folder_id: folderId, folder_name: folderName, access_level: ACCESS_LEVEL.PROTECTED }
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

  const handleMoveFile = (file: FileItem) => {
    setMoveTargets([file]);
    setMoveIsBulk(false);
    setIsMoveModalOpen(true);
  }

  const handleMoveFileToFolder = async (fileIds: string[], targetFolderId: string | null): Promise<{ success: boolean; error?: string }> => {
    const fileId = fileIds[0];
    if (!fileId) return { success: false, error: "No file selected" };
    try {
      const result = await moveFileOrFolder(fileId, {
        target_folder_id: targetFolderId
      });

      if (result.success) {
        // Remove from selected files if it was selected
        setSelectedFiles(prev => prev.filter(id => id !== fileId));
        return { success: true };
      } else {
        return { success: false, error: result.error || "Failed to move file" };
      }
    } catch (error: any) {
      return { success: false, error: error?.message || "An unexpected error occurred" };
    }
  }

  const handleCloseMoveModal = () => {
    setIsMoveModalOpen(false);
    setMoveTargets([]);
    setMoveIsBulk(false);
  }

  const handleShareFile = (file: FileItem) => {
    setShareTargets([file]);
    setShareIsBulk(false);
    setIsShareModalOpen(true);
  }

  const handleShareFileWithUsers = async (fileIds: string[], userIds: string[], permissionLevel: SharePermission): Promise<{ success: boolean; error?: string }> => {
    const fileId = fileIds[0];
    if (!fileId) return { success: false, error: "No file selected" };
    try {
      // Share the file with each selected user
      const sharePromises = userIds.map(userId =>
        shareFileOrFolder(fileId, {
          shared_with_user_id: userId,
          permission_level: permissionLevel
        })
      );

      const results = await Promise.all(sharePromises);

      // Check if any share operation failed
      const failedResults = results.filter(result => !result.success);
      if (failedResults.length > 0) {
        return {
          success: false,
          error: `Failed to share with ${failedResults.length} user(s). ${failedResults[0].error}`
        };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || "Failed to share file" };
    }
  }

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setShareTargets([]);
    setShareIsBulk(false);
  }

  const handleChangeAccessLevel = async (file: FileItem, accessLevel: string) => {
    await updateFileAccessLevel(file.id, { access_level: accessLevel as AccessLevel });
  }

  // ---------------------------------------------------------------------
  // Bulk actions. Each endpoint is all-or-nothing, so on failure the
  // selection is left intact for the user to retry or adjust.
  // ---------------------------------------------------------------------

  const handleBulkMoveClick = () => {
    if (selectedItems.length === 0) return;
    setMoveTargets(selectedItems);
    setMoveIsBulk(true);
    setIsMoveModalOpen(true);
  }

  const handleBulkMoveSubmit = async (fileIds: string[], targetFolderId: string | null): Promise<{ success: boolean; error?: string }> => {
    const result = await bulkMoveFilesOrFolders(fileIds, targetFolderId);
    if (result.success) {
      setSelectedFiles([]);
      toast.success(`${fileIds.length} item(s) moved`);
    } else {
      toast.error(result.error || "Failed to move the selected items");
    }
    return result;
  }

  const handleBulkShareClick = () => {
    if (selectedItems.length === 0) return;
    setShareTargets(selectedItems);
    setShareIsBulk(true);
    setIsShareModalOpen(true);
  }

  const handleBulkShareSubmit = async (fileIds: string[], userIds: string[], permissionLevel: SharePermission): Promise<{ success: boolean; error?: string }> => {
    const result = await bulkShareFilesOrFolders(fileIds, userIds, permissionLevel);
    if (result.success) {
      setSelectedFiles([]);
      toast.success(`${fileIds.length} item(s) shared with ${userIds.length} user(s)`);
    } else {
      toast.error(result.error || "Failed to share the selected items");
    }
    return result;
  }

  const handleBulkDeleteConfirm = async () => {
    const ids = selectedItems.map((file) => file.id);
    if (ids.length === 0) return;

    setIsBulkBusy(true);
    const result = await bulkDeleteFilesOrFolders(ids);
    setIsBulkBusy(false);

    if (result.success) {
      setSelectedFiles([]);
      setIsBulkDeleteOpen(false);
      toast.success(`${ids.length} item(s) moved to trash`);
    } else {
      toast.error(result.error || "Failed to delete the selected items");
    }
  }

  const actionHandlers: FileActionHandlers = {
    onFileSelect: toggleFileSelection,
    onItemClick: handleItemClick,
    onDownload: downloadFile,
    onShare: handleShareFile,
    onMove: handleMoveFile,
    onRename: handleRenameFile,
    onDelete: handleDeleteFile,
    onChangeAccessLevel: handleChangeAccessLevel,
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
          sortDirection={sortDirection}
          onSortChange={setSortDirection}
        />

        <BulkActionsBar
          selectedFilesCount={selectedFiles.length}
          totalFilesCount={filteredFiles.length}
          onSelectAll={selectAllFiles}
          onMove={handleBulkMoveClick}
          onShare={handleBulkShareClick}
          onDelete={() => setIsBulkDeleteOpen(true)}
          isBusy={isBulkBusy}
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

        {/* Move File Modal */}
        <MoveFileModal
          isOpen={isMoveModalOpen}
          onClose={handleCloseMoveModal}
          filesToMove={moveTargets}
          fileSystemTree={transformedFileSystem}
          onMoveFile={moveIsBulk ? handleBulkMoveSubmit : handleMoveFileToFolder}
        />

        {/* Share File Modal */}
        <ShareFileModal
          isOpen={isShareModalOpen}
          onClose={handleCloseShareModal}
          filesToShare={shareTargets}
          onShareFile={shareIsBulk ? handleBulkShareSubmit : handleShareFileWithUsers}
        />

        {/* Bulk Delete Confirmation */}
        <BulkDeleteDialog
          isOpen={isBulkDeleteOpen}
          onOpenChange={setIsBulkDeleteOpen}
          filesToDelete={selectedItems}
          isDeleting={isBulkBusy}
          onConfirm={handleBulkDeleteConfirm}
        />
      </div>
    </div>
  )
}
