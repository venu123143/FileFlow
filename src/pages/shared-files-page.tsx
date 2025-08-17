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
  Video,
  FolderIcon,
  Users,
  Clock,
  UserPlus,
  Link,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileManager } from "@/components/file-manager/FileManager"
import { sharedPageConfig, defaultViewConfig } from "@/config/page-configs"
import type { SharedFileItem, FileActionHandlers } from "@/types/file-manager"

const mockSharedFiles: SharedFileItem[] = [
  {
    id: "1",
    name: "Marketing Campaign.pptx",
    type: "file",
    fileType: "presentation",
    size: "12.4 MB",
    modified: "2 hours ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
    shared: true,
    parentPath: [],
    variant: "shared",
    sharedBy: { name: "John Doe", avatar: "/john-avatar.png", initials: "JD" },
    sharedWith: [
      { name: "Alice Smith", avatar: "/alice-avatar.png", initials: "AS" },
      { name: "Bob Wilson", avatar: "/bob-avatar.png", initials: "BW" },
    ],
    permission: "edit",
    sharedDate: "2024-01-15",
    isOwner: false,
  },
  {
    id: "2",
    name: "Design Assets",
    type: "folder",
    fileType: "folder",
    size: "234 MB",
    modified: "1 day ago",
    icon: FolderIcon,
    thumbnail: null,
    starred: false,
    shared: true,
    parentPath: [],
    variant: "shared",
    sharedBy: { name: "Sophie Chamberlain", avatar: "/sophie-avatar.png", initials: "SC" },
    sharedWith: [
      { name: "Design Team", avatar: null, initials: "DT" },
      { name: "Marketing Team", avatar: null, initials: "MT" },
    ],
    permission: "view",
    sharedDate: "2024-01-10",
    isOwner: true,
  },
  {
    id: "3",
    name: "Project Demo.mp4",
    type: "file",
    fileType: "video",
    size: "89.2 MB",
    modified: "3 days ago",
    icon: Video,
    thumbnail: "/demo-thumbnail.png",
    starred: false,
    shared: true,
    parentPath: [],
    variant: "shared",
    sharedBy: { name: "Mike Johnson", avatar: "/mike-avatar.png", initials: "MJ" },
    sharedWith: [{ name: "Client Team", avatar: null, initials: "CT" }],
    permission: "view",
    sharedDate: "2024-01-08",
    isOwner: false,
  },
  {
    id: "4",
    name: "Brand Guidelines.pdf",
    type: "file",
    fileType: "pdf",
    size: "5.8 MB",
    modified: "1 week ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
    shared: true,
    parentPath: [],
    variant: "shared",
    sharedBy: { name: "Sophie Chamberlain", avatar: "/sophie-avatar.png", initials: "SC" },
    sharedWith: [{ name: "Everyone", avatar: null, initials: "EV" }],
    permission: "view",
    sharedDate: "2024-01-01",
    isOwner: true,
  },
]

const recentActivity = [
  {
    id: "1",
    action: "shared",
    file: "Marketing Campaign.pptx",
    user: "John Doe",
    time: "2 hours ago",
    avatar: "/john-avatar.png",
    initials: "JD",
  },
  {
    id: "2",
    action: "edited",
    file: "Design Assets",
    user: "Alice Smith",
    time: "4 hours ago",
    avatar: "/alice-avatar.png",
    initials: "AS",
  },
  {
    id: "3",
    action: "viewed",
    file: "Project Demo.mp4",
    user: "Client Team",
    time: "1 day ago",
    avatar: null,
    initials: "CT",
  },
]

const getPermissionColor = (permission: string) => {
  switch (permission) {
    case "edit":
      return "bg-green-100 text-green-700"
    case "view":
      return "bg-blue-100 text-blue-700"
    case "admin":
      return "bg-purple-100 text-purple-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export function SharedFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  const filteredFiles = mockSharedFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "shared-by-me" && file.isOwner) ||
      (activeTab === "shared-with-me" && !file.isOwner)
    return matchesSearch && matchesTab
  })

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const selectAllFiles = () => {
    setSelectedFiles(selectedFiles.length === filteredFiles.length ? [] : filteredFiles.map((f) => f.id))
  }

  const sharedByMeCount = mockSharedFiles.filter((f) => f.isOwner).length
  const sharedWithMeCount = mockSharedFiles.filter((f) => !f.isOwner).length

  const actionHandlers: FileActionHandlers = {
    onFileSelect: toggleFileSelection,
    onItemClick: (item) => console.log("Clicked on shared item:", item.name),
    onDownload: (file) => console.log("Download file:", file.name),
    onShare: (file) => console.log("Share file:", file.name),
    onStar: (file) => console.log("Toggle star:", file.name),
    onDelete: (file) => console.log("Remove access:", file.name),
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-semibold text-foreground">Shared with me</h1>
            </div>
            <p className="text-muted-foreground">
              {filteredFiles.length} shared items • {sharedByMeCount} shared by me • {sharedWithMeCount} shared with me
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Link className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite People
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Sharing Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Share2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shared by Me</p>
                <p className="text-xl font-bold">{sharedByMeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shared with Me</p>
                <p className="text-xl font-bold">{sharedWithMeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                <p className="text-xl font-bold">{recentActivity.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-6">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Shared</TabsTrigger>
              <TabsTrigger value="shared-by-me">Shared by Me</TabsTrigger>
              <TabsTrigger value="shared-with-me">Shared with Me</TabsTrigger>
            </TabsList>
          </Tabs>
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
                placeholder="Search shared files..."
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
            <span className="text-sm font-medium">{selectedFiles.length} shared items selected</span>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage Access
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Access
              </Button>
            </div>
          </motion.div>
        )}

        {/* Unified File Manager */}
        <FileManager
          files={filteredFiles}
          selectedFiles={selectedFiles}
          pageConfig={sharedPageConfig}
          viewConfig={defaultViewConfig}
          actionHandlers={actionHandlers}
          viewMode={viewMode}
        />
      </div>
    </div>
  )
}
