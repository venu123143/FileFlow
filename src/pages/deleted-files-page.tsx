"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Grid3X3,
  List,
  Search,
  Filter,
  SortAsc,
  RotateCcw,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileManager } from "@/components/file-manager/FileManager"
import { deletedPageConfig, defaultViewConfig } from "@/config/page-configs"
import { useFile } from "@/contexts/fileContext"
import { transformFileSystemNodesToDeletedFileItems } from "@/lib/utils"
import type { FileActionHandlers, FileItem } from "@/types/file-manager"


export function DeletedFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const { deleteFileOrFolder, trash, restoreFileOrFolder, emptyTrash } = useFile()

  // Transform dynamic data to DeletedFileItem format
  const transformedTrash = useMemo(() => {
    return transformFileSystemNodesToDeletedFileItems(trash)
  }, [trash])

  const filteredFiles = transformedTrash.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const selectAllFiles = () => {
    setSelectedFiles(selectedFiles.length === filteredFiles.length ? [] : filteredFiles.map((f) => f.id))
  }

  const totalSize = transformedTrash.reduce((acc, file) => {
    if (file.type === "folder") return acc
    const sizeNum = Number.parseFloat(file.size.split(" ")[0])
    const unit = file.size.split(" ")[1]
    const sizeInMB = unit === "GB" ? sizeNum * 1024 : sizeNum
    return acc + sizeInMB
  }, 0)

  const expiringFiles = transformedTrash.filter((f) => f.daysLeft <= 7).length

  const handleDeleteFile = async (file: FileItem) => {
    const result = await deleteFileOrFolder(file.id);
    console.log(result, "delete...");
    if (result.success) {
      // Remove from selected files if it was selected
      setSelectedFiles(prev => prev.filter(id => id !== file.id));
    }
  }

  const actionHandlers: FileActionHandlers = {
    onFileSelect: toggleFileSelection,
    onItemClick: (item) => console.log("Clicked on deleted item:", item.name),
    onRestore: (file) => restoreFileOrFolder(file.id),
    onDelete: handleDeleteFile,
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Deleted files</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {filteredFiles.length} deleted items • {(totalSize / 1024).toFixed(1)} GB total
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button onClick={emptyTrash} variant="destructive" size="sm" className="flex-1 sm:flex-initial">
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Empty Trash</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Warning Alert */}
      {expiringFiles > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {expiringFiles} file{expiringFiles > 1 ? "s" : ""} will be permanently deleted in 7 days or less. Restore
              them now to prevent permanent loss.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deleted files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <SortAsc className="h-4 w-4 mr-2" />
            Sort
          </Button>
          <Button variant="outline" size="sm" className="sm:hidden">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="sm:hidden">
            <SortAsc className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          {selectedFiles.length > 0 && <Badge variant="secondary" className="text-xs">{selectedFiles.length} selected</Badge>}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 bg-muted rounded-lg"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Checkbox checked={selectedFiles.length === filteredFiles.length} onCheckedChange={selectAllFiles} />
            <span className="text-sm font-medium">{selectedFiles.length} deleted items selected</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Restore</span>
            </Button>
            <Button variant="destructive" size="sm" className="flex-1 sm:flex-initial">
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete Forever</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Unified File Manager */}
      <FileManager
        files={filteredFiles}
        selectedFiles={selectedFiles}
        pageConfig={deletedPageConfig}
        viewConfig={defaultViewConfig}
        actionHandlers={actionHandlers}
        viewMode={viewMode}
      />
    </div>
  )
}
