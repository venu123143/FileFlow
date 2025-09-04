"use client"

import { motion } from "framer-motion"
import type { FileManagerProps } from "@/types/file-manager"
import { FileGrid } from "./FileGrid"
import { FileList } from "./FileList"
import { EmptyState } from "./EmptyState"
import { AddNewFolder } from "./AddNewFolder"

export function FileManager({
  files,
  selectedFiles,
  pageConfig,
  viewConfig,
  actionHandlers,
  viewMode,
  className = "",
  onCreateFolder
}: FileManagerProps & { onCreateFolder?: (folderName: string) => Promise<{ success: boolean; error?: string }> }) {
  if (files.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          searchQuery=""
          message={pageConfig.emptyStateMessage}
          icon={pageConfig.emptyStateIcon}
        />
        {onCreateFolder && (
          <div className="flex justify-center">
            <AddNewFolder
              onAddFolder={onCreateFolder}
              variant="card"
              buttonText="Create New Folder"
              placeholder="Enter folder name..."
              className="max-w-sm"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={className}
    >
      {viewMode === "grid" ? (
        <FileGrid
          files={files}
          selectedFiles={selectedFiles}
          pageConfig={pageConfig}
          viewConfig={viewConfig}
          actionHandlers={actionHandlers}
          onCreateFolder={onCreateFolder}
        />
      ) : (
        <FileList
          files={files}
          selectedFiles={selectedFiles}
          pageConfig={pageConfig}
          viewConfig={viewConfig}
          actionHandlers={actionHandlers}
        />
      )}
    </motion.div>
  )
}
