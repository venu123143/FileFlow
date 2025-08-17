"use client"

import { motion } from "framer-motion"
import type { FileItem, FileManagerProps } from "@/types/file-manager"
import { FileGrid } from "./FileGrid"
import { FileList } from "./FileList"
import { EmptyState } from "./EmptyState"

export function FileManager({
  files,
  selectedFiles,
  pageConfig,
  viewConfig,
  actionHandlers,
  viewMode,
  className = ""
}: FileManagerProps) {
  if (files.length === 0) {
    return (
      <EmptyState
        searchQuery=""
        message={pageConfig.emptyStateMessage}
        icon={pageConfig.emptyStateIcon}
      />
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
