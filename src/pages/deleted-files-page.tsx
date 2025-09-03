"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Grid3X3,
  List,
  Search,
  Filter,
  SortAsc,
  RotateCcw,
  Trash2,
  FileText,
  Video,
  Music,
  Archive,
  FolderIcon,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileManager } from "@/components/file-manager/FileManager"
import { deletedPageConfig, defaultViewConfig } from "@/config/page-configs"
import type { DeletedFileItem, FileActionHandlers } from "@/types/file-manager"
import { useFile } from "@/contexts/fileContext"
const mockDeletedFiles: DeletedFileItem[] = [
  {
    id: "1",
    name: "Old Project Files",
    type: "folder",
    fileType: "folder",
    size: "45.8 MB",
    modified: "2024-01-10",
    icon: FolderIcon,
    thumbnail: null,
    starred: false,
    shared: false,
    parentPath: [],
    variant: "deleted",
    deletedDate: "2024-01-10",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 25,
    originalLocation: "/Projects/Archive",
  },
  {
    id: "2",
    name: "Draft Presentation.pptx",
    type: "file",
    fileType: "presentation",
    size: "12.4 MB",
    modified: "2024-01-12",
    icon: FileText,
    thumbnail: null,
    starred: false,
    shared: false,
    parentPath: [],
    variant: "deleted",
    deletedDate: "2024-01-12",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 23,
    originalLocation: "/Documents/Work",
  },
  {
    id: "3",
    name: "Unused Images",
    type: "folder",
    fileType: "folder",
    size: "234 MB",
    modified: "2024-01-08",
    icon: FolderIcon,
    thumbnail: null,
    starred: false,
    shared: false,
    parentPath: [],
    variant: "deleted",
    deletedDate: "2024-01-08",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 27,
    originalLocation: "/Media/Archive",
  },
  {
    id: "4",
    name: "Recording_old.mp3",
    type: "file",
    fileType: "audio",
    size: "23.4 MB",
    modified: "2024-01-15",
    icon: Music,
    thumbnail: null,
    starred: false,
    shared: false,
    parentPath: [],
    variant: "deleted",
    deletedDate: "2024-01-15",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 20,
    originalLocation: "/Audio/Recordings",
  },
  {
    id: "5",
    name: "Backup_2023.zip",
    type: "file",
    fileType: "archive",
    size: "156 MB",
    modified: "2024-01-05",
    icon: Archive,
    thumbnail: null,
    starred: false,
    shared: false,
    parentPath: [],
    variant: "deleted",
    deletedDate: "2024-01-05",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 30,
    originalLocation: "/Backups",
  },
  {
    id: "6",
    name: "Test_video.mp4",
    type: "file",
    fileType: "video",
    size: "89.2 MB",
    modified: "2024-01-18",
    icon: Video,
    thumbnail: "/test-video-thumb.png",
    starred: false,
    shared: false,
    parentPath: [],
    variant: "deleted",
    deletedDate: "2024-01-18",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 17,
    originalLocation: "/Videos/Tests",
  },
]

export function DeletedFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const { getTrash } = useFile()

  useEffect(() => {
    getTrash()
  }, [])

  const filteredFiles = mockDeletedFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const selectAllFiles = () => {
    setSelectedFiles(selectedFiles.length === filteredFiles.length ? [] : filteredFiles.map((f) => f.id))
  }

  const totalSize = mockDeletedFiles.reduce((acc, file) => {
    const sizeNum = Number.parseFloat(file.size.split(" ")[0])
    const unit = file.size.split(" ")[1]
    const sizeInMB = unit === "GB" ? sizeNum * 1024 : sizeNum
    return acc + sizeInMB
  }, 0)

  const expiringFiles = mockDeletedFiles.filter((f) => f.daysLeft <= 7).length

  const actionHandlers: FileActionHandlers = {
    onFileSelect: toggleFileSelection,
    onItemClick: (item) => console.log("Clicked on deleted item:", item.name),
    onRestore: (file) => console.log("Restore file:", file.name),
    onDelete: (file) => console.log("Delete forever:", file.name),
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-semibold text-foreground">Deleted files</h1>
            </div>
            <p className="text-muted-foreground">
              {filteredFiles.length} deleted items • {(totalSize / 1024).toFixed(1)} GB total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Empty Trash
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

      {/* Trash Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deleted Items</p>
                <p className="text-xl font-bold">{mockDeletedFiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-xl font-bold">{expiringFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Archive className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                <p className="text-xl font-bold">{(totalSize / 1024).toFixed(1)} GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deleted files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <SortAsc className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {selectedFiles.length > 0 && <Badge variant="secondary">{selectedFiles.length} selected</Badge>}
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
          className="flex items-center gap-3 p-4 bg-muted rounded-lg"
        >
          <Checkbox checked={selectedFiles.length === filteredFiles.length} onCheckedChange={selectAllFiles} />
          <span className="text-sm font-medium">{selectedFiles.length} deleted items selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Forever
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
