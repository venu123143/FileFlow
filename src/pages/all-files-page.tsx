"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"

import type { FileItem } from "@/types/file-manager"
import { mockFileSystem } from "@/data/mock-file-system"
import { FileManagerHeader } from "@/components/file-manager/FileManagerHeader"
import { BreadcrumbNavigation } from "@/components/file-manager/BreadcrumbNavigation"
import { Toolbar } from "@/components/file-manager/Toolbar"
import { BulkActionsBar } from "@/components/file-manager/BulkActionsBar"
import { FileGrid } from "@/components/file-manager/FileGrid"
import { FileList } from "@/components/file-manager/FileList"
import { EmptyState } from "@/components/file-manager/EmptyState"

export default function AllFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<string[]>([])

  const currentItems = useMemo(() => {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <FileManagerHeader
          currentPath={currentPath}
          filteredFilesCount={filteredFiles.length}
          onBackClick={handleBackClick}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {filteredFiles.length > 0 ? (
            viewMode === "grid" ? (
              <FileGrid
                files={filteredFiles}
                selectedFiles={selectedFiles}
                onFileSelect={toggleFileSelection}
                onItemClick={handleItemClick}
              />
            ) : (
              <FileList
                files={filteredFiles}
                selectedFiles={selectedFiles}
                onFileSelect={toggleFileSelection}
                onItemClick={handleItemClick}
              />
            )
          ) : (
            <EmptyState searchQuery={searchQuery} />
          )}
        </motion.div>
      </div>
    </div>
  )
}
