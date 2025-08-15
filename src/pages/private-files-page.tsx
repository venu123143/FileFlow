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
  Music,
  Archive,
  FolderIcon,
  Plus,
  Upload,
  Lock,
  Shield,
  Eye,
  EyeOff,
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

const mockPrivateFiles = [
  {
    id: "1",
    name: "Personal Journal.docx",
    type: "document",
    size: "1.2 MB",
    modified: "1 hour ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
    encrypted: true,
    sensitive: true,
  },
  {
    id: "2",
    name: "Family Photos",
    type: "folder",
    size: "234 MB",
    modified: "3 hours ago",
    icon: FolderIcon,
    thumbnail: null,
    starred: false,
    encrypted: true,
    sensitive: false,
  },
  {
    id: "3",
    name: "Tax Documents 2024.pdf",
    type: "pdf",
    size: "5.8 MB",
    modified: "2 days ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
    encrypted: true,
    sensitive: true,
  },
  {
    id: "4",
    name: "Private Notes.txt",
    type: "text",
    size: "45 KB",
    modified: "1 week ago",
    icon: FileText,
    thumbnail: null,
    starred: false,
    encrypted: false,
    sensitive: false,
  },
  {
    id: "5",
    name: "Confidential Recording.mp3",
    type: "audio",
    size: "23.4 MB",
    modified: "2 weeks ago",
    icon: Music,
    thumbnail: null,
    starred: false,
    encrypted: true,
    sensitive: true,
  },
  {
    id: "6",
    name: "Personal Backup.zip",
    type: "archive",
    size: "156 MB",
    modified: "1 month ago",
    icon: Archive,
    thumbnail: null,
    starred: false,
    encrypted: true,
    sensitive: false,
  },
]

const getFileTypeColor = (type: string) => {
  switch (type) {
    case "pdf":
    case "document":
      return "bg-red-100 text-red-700"
    case "image":
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

export function PrivateFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showSensitiveOnly, setShowSensitiveOnly] = useState(false)

  const filteredFiles = mockPrivateFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSensitive = !showSensitiveOnly || file.sensitive
    return matchesSearch && matchesSensitive
  })

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const selectAllFiles = () => {
    setSelectedFiles(selectedFiles.length === filteredFiles.length ? [] : filteredFiles.map((f) => f.id))
  }

  const encryptedCount = mockPrivateFiles.filter((f) => f.encrypted).length
  const sensitiveCount = mockPrivateFiles.filter((f) => f.sensitive).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-semibold text-foreground">Private Files</h1>
            </div>
            <p className="text-muted-foreground">
              {filteredFiles.length} private items • {encryptedCount} encrypted • {sensitiveCount} sensitive
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Private
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Private Folder
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Privacy Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Encrypted Files</p>
                <p className="text-xl font-bold">{encryptedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sensitive Files</p>
                <p className="text-xl font-bold">{sensitiveCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Private</p>
                <p className="text-xl font-bold">{mockPrivateFiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search private files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showSensitiveOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSensitiveOnly(!showSensitiveOnly)}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Sensitive Only
          </Button>
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
          <span className="text-sm font-medium">{selectedFiles.length} private items selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Encrypt
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
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
        transition={{ duration: 0.3, delay: 0.3 }}
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
                            Share Privately
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            {file.encrypted ? "Decrypt" : "Encrypt"}
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
                      <div className="relative">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <file.icon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        {file.encrypted && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Lock className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="w-full">
                        <p className="font-medium text-sm truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                        <p className="text-xs text-muted-foreground">{file.modified}</p>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap justify-center">
                        {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {file.sensitive && (
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                            Sensitive
                          </Badge>
                        )}
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
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <file.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {file.encrypted && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Lock className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.modified}</span>
                        {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {file.sensitive && <Eye className="h-3 w-3 text-red-500" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.sensitive && (
                        <Badge variant="secondary" className="bg-red-100 text-red-700">
                          Sensitive
                        </Badge>
                      )}
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
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Privately
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          {file.encrypted ? "Decrypt" : "Encrypt"}
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
