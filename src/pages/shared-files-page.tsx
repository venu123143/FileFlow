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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockSharedFiles = [
  {
    id: "1",
    name: "Marketing Campaign.pptx",
    type: "presentation",
    size: "12.4 MB",
    modified: "2 hours ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
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
    size: "234 MB",
    modified: "1 day ago",
    icon: FolderIcon,
    thumbnail: null,
    starred: false,
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
    type: "video",
    size: "89.2 MB",
    modified: "3 days ago",
    icon: Video,
    thumbnail: "/demo-thumbnail.png",
    starred: false,
    sharedBy: { name: "Mike Johnson", avatar: "/mike-avatar.png", initials: "MJ" },
    sharedWith: [{ name: "Client Team", avatar: null, initials: "CT" }],
    permission: "view",
    sharedDate: "2024-01-08",
    isOwner: false,
  },
  {
    id: "4",
    name: "Brand Guidelines.pdf",
    type: "pdf",
    size: "5.8 MB",
    modified: "1 week ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
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

const getFileTypeColor = (type: string) => {
  switch (type) {
    case "pdf":
    case "presentation":
      return "bg-red-100 text-red-700"
    case "image":
      return "bg-green-100 text-green-700"
    case "video":
      return "bg-purple-100 text-purple-700"
    case "folder":
      return "bg-blue-100 text-blue-700"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

          {/* Files Grid/List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                                <Settings className="h-4 w-4 mr-2" />
                                Manage Access
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                {file.starred ? "Unstar" : "Star"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                            <file.icon className="h-8 w-8 text-muted-foreground" />
                          </div>

                          <div className="w-full">
                            <p className="font-medium text-sm truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                            <p className="text-xs text-muted-foreground">{file.modified}</p>
                          </div>

                          <div className="w-full space-y-2">
                            <div className="flex items-center justify-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={file.sharedBy.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">{file.sharedBy.initials}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {file.isOwner ? "You shared" : `${file.sharedBy.name}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 flex-wrap justify-center">
                              {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                              <Badge variant="secondary" className={`text-xs ${getPermissionColor(file.permission)}`}>
                                {file.permission}
                              </Badge>
                              <Badge variant="secondary" className={`text-xs ${getFileTypeColor(file.type)}`}>
                                {file.type}
                              </Badge>
                            </div>
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
                            <span>•</span>
                            <span>{file.isOwner ? "You shared" : `Shared by ${file.sharedBy.name}`}</span>
                            {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {file.sharedWith.slice(0, 3).map((user, i) => (
                              <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
                              </Avatar>
                            ))}
                            {file.sharedWith.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs">+{file.sharedWith.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary" className={`${getPermissionColor(file.permission)}`}>
                            {file.permission}
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
                              <Settings className="h-4 w-4 mr-2" />
                              Manage Access
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="h-4 w-4 mr-2" />
                              {file.starred ? "Unstar" : "Star"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Access
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

        {/* Recent Activity Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.6 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{activity.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium">{activity.file}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
