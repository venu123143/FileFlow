"use client"

import { useState, useMemo } from "react"
import type { FileItem, FileActionHandlers } from "@/types/file-manager"
import { mockFileSystem } from "@/data/mock-file-system"
import { FileManagerHeader } from "@/components/file-manager/FileManagerHeader"
import { BreadcrumbNavigation } from "@/components/file-manager/BreadcrumbNavigation"
import { Toolbar } from "@/components/file-manager/Toolbar"
import { BulkActionsBar } from "@/components/file-manager/BulkActionsBar"
import { FileManager } from "@/components/file-manager/FileManager"
import { standardPageConfig, defaultViewConfig } from "@/config/page-configs"
import { FolderIcon } from "lucide-react"

export default function AllFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<string[]>([])

  let currentItems = useMemo(() => {
    let items: FileItem[] = mockFileSystem
    for (const folder of currentPath) {
      const foundFolder = items.find((item) => item.name === folder && item.type === "folder")
      if (foundFolder?.children) {
        items = foundFolder.children
      }
    }
    return items
  }, [currentPath])

  const filteredFiles = useMemo(() => {
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
      setCurrentPath([...currentPath, item.name])
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

  const handleCreateFolder = (folderName: string) => {
    // Create a new folder object
    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name: folderName,
      type: "folder",
      variant: "standard",
      icon: FolderIcon,
      size: "0 items",
      modified: "Just now",
      parentPath: currentPath,
      children: [],
      starred: false,
      shared: false,
      fileType: undefined,
      thumbnail: undefined
    }

    // Add the new folder to the current directory
    const updatedItems = [...currentItems, newFolder]

    // Update the mock file system (in a real app, this would be an API call)
    // For now, we'll just update the local state
    console.log("Created new folder:", newFolder)

    // You would typically update the file system here
    currentItems = updatedItems
  }

  const actionHandlers: FileActionHandlers = {
    onFileSelect: toggleFileSelection,
    onItemClick: handleItemClick,
    onDownload: (file) => console.log("Download", file.name),
    onShare: (file) => console.log("Share", file.name),
    onStar: (file) => console.log("Star", file.name),
    onDelete: (file) => console.log("Delete", file.name),
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <FileManagerHeader
          currentPath={currentPath}
          filteredFilesCount={filteredFiles.length}
          onBackClick={handleBackClick}
          onCreateFolder={handleCreateFolder}
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
      </div>
    </div>
  )
}
