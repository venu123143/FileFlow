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

const mockFiles = [
  {
    id: "1",
    name: "Project Proposal.pdf",
    type: "pdf",
    size: "2.4 MB",
    modified: "2 hours ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
    shared: false,
  },
  {
    id: "2",
    name: "Dashboard Mockup.fig",
    type: "figma",
    size: "15.2 MB",
    modified: "4 hours ago",
    icon: ImageIcon,
    thumbnail: "/figma-mockup.png",
    starred: false,
    shared: true,
  },
  {
    id: "3",
    name: "Team Meeting.mp4",
    type: "video",
    size: "124 MB",
    modified: "1 day ago",
    icon: Video,
    thumbnail: "/video-thumbnail.png",
    starred: false,
    shared: false,
  },
  {
    id: "4",
    name: "Brand Assets",
    type: "folder",
    size: "45.8 MB",
    modified: "2 days ago",
    icon: FolderIcon,
    thumbnail: null,
    starred: false,
    shared: true,
  },
  {
    id: "5",
    name: "Presentation.pptx",
    type: "presentation",
    size: "8.1 MB",
    modified: "3 days ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
    shared: false,
  },
  {
    id: "6",
    name: "Profile Photo.jpg",
    type: "image",
    size: "3.2 MB",
    modified: "1 week ago",
    icon: ImageIcon,
    thumbnail: "/professional-headshot.png",
    starred: false,
    shared: false,
  },
  {
    id: "7",
    name: "Audio Recording.mp3",
    type: "audio",
    size: "12.5 MB",
    modified: "1 week ago",
    icon: Music,
    thumbnail: null,
    starred: false,
    shared: false,
  },
  {
    id: "8",
    name: "Archive.zip",
    type: "archive",
    size: "67.3 MB",
    modified: "2 weeks ago",
    icon: Archive,
    thumbnail: null,
    starred: false,
    shared: false,
  },
]

const getFileTypeColor = (type: string) => {
  switch (type) {
    case "pdf":
    case "presentation":
      return "bg-red-100 text-red-700"
    case "image":
    case "figma":
      return "bg-green-100 text-green-700"
    case "video":
      return "bg-purple-100 text-purple-700"
    case "audio":
      return "bg-orange-100 text-orange-700"
    case "folder":
      return "bg-blue-100 text-blue-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export function AllFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const filteredFiles = mockFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const selectAllFiles = () => {
    setSelectedFiles(selectedFiles.length === filteredFiles.length ? [] : filteredFiles.map((f) => f.id))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">All Files</h1>
            <p className="text-muted-foreground">{filteredFiles.length} items</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
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
          <span className="text-sm font-medium">{selectedFiles.length} items selected</span>
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

                    <div className="flex flex-col items-center text-center space-y-3">
                      {file.thumbnail ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={file.thumbnail || "/placeholder.svg"}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <file.icon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      <div className="w-full">
                        <p className="font-medium text-sm truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                        <p className="text-xs text-muted-foreground">{file.modified}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
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
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <file.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.modified}</span>
                        {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
                      </div>
                    </div>
                    <Badge variant="secondary" className={`${getFileTypeColor(file.type)}`}>
                      {file.type}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
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
    </div>
  )
}
