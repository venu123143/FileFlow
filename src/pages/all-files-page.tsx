"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Grid3X3,
  List,
  Search,
  Filter,
  SortAsc,
  MoreHorizontal,
  Download,
  Share2,
  Star,
  Trash2,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  FolderIcon,
  Plus,
  Upload,
  ArrowLeft,
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
import { Breadcrumb } from "@/components/custom/breadcrumb"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  fileType?: string
  size: string
  modified: string
  icon: any
  thumbnail?: string | null
  starred: boolean
  shared: boolean
  parentPath: string[]
  children?: FileItem[]
}

const mockFileSystem: FileItem[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    size: "25.4 MB",
    modified: "2 hours ago",
    icon: FolderIcon,
    starred: false,
    shared: true,
    parentPath: [],
    children: [
      {
        id: "1-1",
        name: "Project Proposal.pdf",
        type: "file",
        fileType: "pdf",
        size: "2.4 MB",
        modified: "2 hours ago",
        icon: FileText,
        thumbnail: null,
        starred: true,
        shared: false,
        parentPath: ["Documents"],
      },
      {
        id: "1-2",
        name: "Contracts",
        type: "folder",
        size: "8.2 MB",
        modified: "1 day ago",
        icon: FolderIcon,
        starred: false,
        shared: false,
        parentPath: ["Documents"],
        children: [
          {
            id: "1-2-1",
            name: "Client Agreement.pdf",
            type: "file",
            fileType: "pdf",
            size: "1.8 MB",
            modified: "1 day ago",
            icon: FileText,
            starred: false,
            shared: true,
            parentPath: ["Documents", "Contracts"],
          },
          {
            id: "1-2-2",
            name: "NDA Template.docx",
            type: "file",
            fileType: "document",
            size: "0.5 MB",
            modified: "3 days ago",
            icon: FileText,
            starred: false,
            shared: false,
            parentPath: ["Documents", "Contracts"],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Design Assets",
    type: "folder",
    size: "156.8 MB",
    modified: "4 hours ago",
    icon: FolderIcon,
    starred: true,
    shared: true,
    parentPath: [],
    children: [
      {
        id: "2-1",
        name: "Dashboard Mockup.fig",
        type: "file",
        fileType: "figma",
        size: "15.2 MB",
        modified: "4 hours ago",
        icon: ImageIcon,
        thumbnail: "/figma-mockup.png",
        starred: false,
        shared: true,
        parentPath: ["Design Assets"],
      },
      {
        id: "2-2",
        name: "Brand Assets",
        type: "folder",
        size: "45.8 MB",
        modified: "2 days ago",
        icon: FolderIcon,
        starred: false,
        shared: true,
        parentPath: ["Design Assets"],
        children: [
          {
            id: "2-2-1",
            name: "Logo.svg",
            type: "file",
            fileType: "image",
            size: "2.1 MB",
            modified: "2 days ago",
            icon: ImageIcon,
            starred: true,
            shared: false,
            parentPath: ["Design Assets", "Brand Assets"],
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Media",
    type: "folder",
    size: "245.7 MB",
    modified: "1 day ago",
    icon: FolderIcon,
    starred: false,
    shared: false,
    parentPath: [],
    children: [
      {
        id: "3-1",
        name: "Team Meeting.mp4",
        type: "file",
        fileType: "video",
        size: "124 MB",
        modified: "1 day ago",
        icon: Video,
        thumbnail: "/video-thumbnail.png",
        starred: false,
        shared: false,
        parentPath: ["Media"],
      },
      {
        id: "3-2",
        name: "Audio Recording.mp3",
        type: "file",
        fileType: "audio",
        size: "12.5 MB",
        modified: "1 week ago",
        icon: Music,
        thumbnail: null,
        starred: false,
        shared: false,
        parentPath: ["Media"],
      },
    ],
  },
  {
    id: "4",
    name: "Presentation.pptx",
    type: "file",
    fileType: "presentation",
    size: "8.1 MB",
    modified: "3 days ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
    shared: false,
    parentPath: [],
  },
  {
    id: "5",
    name: "Profile Photo.jpg",
    type: "file",
    fileType: "image",
    size: "3.2 MB",
    modified: "1 week ago",
    icon: ImageIcon,
    thumbnail: "/professional-headshot.png",
    starred: false,
    shared: false,
    parentPath: [],
  },
  {
    id: "6",
    name: "Archive.zip",
    type: "file",
    fileType: "archive",
    size: "67.3 MB",
    modified: "2 weeks ago",
    icon: Archive,
    thumbnail: null,
    starred: false,
    shared: false,
    parentPath: [],
  },
]

const getFileTypeColor = (type: string) => {
  switch (type) {
    case "pdf":
    case "presentation":
      return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
    case "image":
    case "figma":
      return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
    case "video":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
    case "audio":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
    case "folder":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
    case "document":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }
}

export default function AllFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<string[]>([])

  // Get current folder contents based on path
  const currentItems = useMemo(() => {
    let items = mockFileSystem

    // Navigate to current path
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
      // Navigate to root
      setCurrentPath([])
    } else {
      // Navigate to specific folder
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
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {currentPath.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleBackClick} className="shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                  {currentPath.length > 0 ? currentPath[currentPath.length - 1] : "All Files"}
                </h1>
                <p className="text-sm text-muted-foreground">{filteredFiles.length} items</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                <Upload className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
              <Button size="sm" className="text-xs sm:text-sm">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Folder</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Breadcrumb */}
        {currentPath.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-muted/50 rounded-lg p-3"
          >
            <Breadcrumb path={currentPath} onNavigate={handleBreadcrumbNavigate} />
          </motion.div>
        )}

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
              <SortAsc className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {selectedFiles.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedFiles.length} selected
              </Badge>
            )}
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
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-muted rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Checkbox checked={selectedFiles.length === filteredFiles.length} onCheckedChange={selectAllFiles} />
              <span className="text-sm font-medium">{selectedFiles.length} items selected</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </motion.div>
        )}

        {/* Files Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="w-full"
                >
                  <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                    <CardContent>
                      <div className="flex  w-full items-start justify-between">
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="h-4 w-4 mr-2" />
                              {file.starred ? "Unstar" : "Star"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div
                        className="flex flex-col items-center text-center space-y-2"
                        onClick={() => handleItemClick(file)}
                      >
                        {file.thumbnail ? (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={file.thumbnail || "/placeholder.svg"}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center">
                            <file.icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                          </div>
                        )}

                        <div className="w-full">
                          <p className="font-medium text-xs truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>

                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                          {file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getFileTypeColor(file.fileType || file.type)}`}
                          >
                            {file.fileType || file.type}
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
                      className="flex items-center gap-3 p-2 sm:p-3 hover:bg-muted/50 transition-colors group cursor-pointer"
                      onClick={() => handleItemClick(file)}
                    >
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <file.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span className="hidden sm:inline">{file.modified}</span>
                          {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                          {file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getFileTypeColor(file.fileType || file.type)} shrink-0`}
                      >
                        {file.fileType || file.type}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            {file.starred ? "Unstar" : "Star"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No files found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms" : "This folder is empty"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
