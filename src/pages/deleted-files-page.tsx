"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Grid3X3,
  List,
  Search,
  Filter,
  SortAsc,
  MoreHorizontal,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

const mockDeletedFiles = [
  {
    id: "1",
    name: "Old Project Files",
    type: "folder",
    size: "45.8 MB",
    deletedDate: "2024-01-10",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 25,
    icon: FolderIcon,
    thumbnail: null,
    originalLocation: "/Projects/Archive",
  },
  {
    id: "2",
    name: "Draft Presentation.pptx",
    type: "presentation",
    size: "12.4 MB",
    deletedDate: "2024-01-12",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 23,
    icon: FileText,
    thumbnail: null,
    originalLocation: "/Documents/Work",
  },
  {
    id: "3",
    name: "Unused Images",
    type: "folder",
    size: "234 MB",
    deletedDate: "2024-01-08",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 27,
    icon: FolderIcon,
    thumbnail: null,
    originalLocation: "/Media/Archive",
  },
  {
    id: "4",
    name: "Recording_old.mp3",
    type: "audio",
    size: "23.4 MB",
    deletedDate: "2024-01-15",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 20,
    icon: Music,
    thumbnail: null,
    originalLocation: "/Audio/Recordings",
  },
  {
    id: "5",
    name: "Backup_2023.zip",
    type: "archive",
    size: "156 MB",
    deletedDate: "2024-01-05",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 30,
    icon: Archive,
    thumbnail: null,
    originalLocation: "/Backups",
  },
  {
    id: "6",
    name: "Test_video.mp4",
    type: "video",
    size: "89.2 MB",
    deletedDate: "2024-01-18",
    deletedBy: "Sophie Chamberlain",
    daysLeft: 17,
    icon: Video,
    thumbnail: "/test-video-thumb.png",
    originalLocation: "/Videos/Tests",
  },
]

const getDaysLeftColor = (days: number) => {
  if (days <= 7) return "bg-red-100 text-red-700"
  if (days <= 14) return "bg-orange-100 text-orange-700"
  return "bg-green-100 text-green-700"
}

const getFileTypeColor = (type: string) => {
  switch (type) {
    case "presentation":
      return "bg-red-100 text-red-700"
    case "image":
      return "bg-green-100 text-green-700"
    case "video":
      return "bg-purple-100 text-purple-700"
    case "audio":
      return "bg-orange-100 text-orange-700"
    case "folder":
      return "bg-blue-100 text-blue-700"
    case "archive":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export function DeletedFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

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

      {/* Files Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Forever
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center opacity-60">
                          <file.icon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                          <Trash2 className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      <div className="w-full">
                        <p className="font-medium text-sm truncate opacity-75" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                        <p className="text-xs text-muted-foreground">Deleted {file.deletedDate}</p>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap justify-center">
                        <Badge variant="secondary" className={`text-xs ${getDaysLeftColor(file.daysLeft)}`}>
                          {file.daysLeft} days left
                        </Badge>
                        <Badge variant="secondary" className={`text-xs ${getFileTypeColor(file.type)}`}>
                          {file.type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group"
                  >
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                    />
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center opacity-60">
                        <file.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                        <Trash2 className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate opacity-75">{file.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>Deleted {file.deletedDate}</span>
                        <span>•</span>
                        <span className="truncate">From {file.originalLocation}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`${getDaysLeftColor(file.daysLeft)}`}>
                        {file.daysLeft} days left
                      </Badge>
                      <Badge variant="secondary" className={`${getFileTypeColor(file.type)}`}>
                        {file.type}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Forever
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No deleted files</h3>
          <p className="text-muted-foreground">Your trash is empty. Deleted files will appear here.</p>
        </motion.div>
      )}
    </div>
  )
}
