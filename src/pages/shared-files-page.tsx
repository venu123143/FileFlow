"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Grid3X3,
  List,
  Search,
  Filter,
  SortAsc,
  Download,
  Trash2,
  FileText,
  Video,
  FolderIcon,
  Users,
  UserPlus,
  Link,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileManager } from "@/components/file-manager/FileManager"
import { sharedPageConfig, defaultViewConfig } from "@/config/page-configs"
import { useFile } from "@/contexts/fileContext"
import { toast } from "sonner"
import type { SharedFileItem, FileActionHandlers, FileItem } from "@/types/file-manager"

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

export function SharedFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const { getAllSharedFilesWithMe, getAllSharedFilesByMe, getAllSharedFiles, deleteFileOrFolder } = useFile()

  useEffect(() => {
    getAllSharedFilesWithMe()
    getAllSharedFilesByMe()
    getAllSharedFiles()
  }, [])

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

  const handleDeleteFile = async (file: FileItem) => {
    try {
      const result = await deleteFileOrFolder(file.id);
      if (result.success) {
        toast.success(`${file.type === 'folder' ? 'Folder' : 'File'} deleted successfully!`);
        // Remove from selected files if it was selected
        setSelectedFiles(prev => prev.filter(id => id !== file.id));
      } else {
        toast.error(result.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting the item');
    }
  }

  const actionHandlers: FileActionHandlers = {
    onFileSelect: toggleFileSelection,
    onItemClick: (item) => console.log("Clicked on shared item:", item.name),
    onDownload: (file) => console.log("Download file:", file.name),
    onShare: (file) => console.log("Share file:", file.name),
    onDelete: handleDeleteFile,
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
