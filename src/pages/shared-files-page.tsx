"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Grid3X3,
  List,
  Search,
  Filter,
  SortAsc,
  Download,
  Users,
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
import type { FileActionHandlers, FileItem } from "@/types/file-manager"
import { transformSharedFileSystemNodesToSharedFileItems } from "@/lib/utils"
import { useAuth } from "@/contexts/useAuth"
import { BreadcrumbNavigation } from "@/components/file-manager/BreadcrumbNavigation"



export function SharedFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [currentPath, setCurrentPath] = useState<Array<{ id: string, name: string }>>([])
  const {
    getAllSharedFilesWithMe,
    getAllSharedFilesByMe,
    getAllSharedFiles,
    sharedFiles,
    sharedFilesByMe,
    sharedFilesWithMe,
  } = useFile()
  const { user } = useAuth()

  useEffect(() => {
    getAllSharedFilesWithMe()
    getAllSharedFilesByMe()
    getAllSharedFiles()
  }, [])

  // Reset path when tab changes
  useEffect(() => {
    setCurrentPath([])
  }, [activeTab])

  const transformedFiles = useMemo(() => {
    let filesToTransform: any[] = [];

    if (activeTab === "all") {
      filesToTransform = sharedFiles;
    } else if (activeTab === "shared-by-me") {
      filesToTransform = sharedFilesByMe;
    } else if (activeTab === "shared-with-me") {
      filesToTransform = sharedFilesWithMe;
    }

    return transformSharedFileSystemNodesToSharedFileItems(filesToTransform).map(file => ({
      ...file,
      isOwner: file.sharedBy.name === user?.display_name // Simple check, ideally check ID
    }));
  }, [sharedFiles, sharedFilesByMe, sharedFilesWithMe, activeTab, user]);

  const currentItems = useMemo(() => {
    let items: FileItem[] = transformedFiles
    for (const folder of currentPath) {
      const foundFolder = items.find((item) => item.id === folder.id && item.type === "folder")
      if (foundFolder?.children) {
        items = foundFolder.children
      }
    }
    return items
  }, [currentPath, transformedFiles])

  const filteredFiles = useMemo(() => {
    return currentItems.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [currentItems, searchQuery])

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const selectAllFiles = () => {
    setSelectedFiles(selectedFiles.length === filteredFiles.length ? [] : filteredFiles.map((f) => f.id))
  }

  const sharedByMeCount = sharedFilesByMe.length
  const sharedWithMeCount = sharedFilesWithMe.length

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      setCurrentPath([...currentPath, { id: item.id, name: item.name }])
      setSelectedFiles([])
      setSearchQuery("")
    }
  }

  const handleBreadcrumbNavigate = (index: number) => {
    if (index === -1) {
      setCurrentPath([])
    } else {
      setCurrentPath(currentPath.slice(0, index + 1))
    }
    setSelectedFiles([])
    setSearchQuery("")
  }

  const actionHandlers: FileActionHandlers = {
    onFileSelect: toggleFileSelection,
    onItemClick: handleItemClick,
    onDownload: (file) => console.log("Download file:", file.name),
    onShare: (file) => console.log("Share file:", file.name),
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-semibold text-foreground">Shared with me</h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              {filteredFiles.length} shared items • {sharedByMeCount} shared by me • {sharedWithMeCount} shared with me
            </p>
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

        {currentPath.length > 0 && (
          <BreadcrumbNavigation currentPath={currentPath} onNavigate={handleBreadcrumbNavigate} />
        )}

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:flex-1">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shared files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {selectedFiles.length > 0 && <Badge variant="secondary">{selectedFiles.length} selected</Badge>}
            <div className="flex items-center border rounded-lg ml-auto md:ml-0">
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
            <div className="flex items-center gap-2">
              <Checkbox checked={selectedFiles.length === filteredFiles.length} onCheckedChange={selectAllFiles} />
              <span className="text-sm font-medium">{selectedFiles.length} shared items selected</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Settings className="h-4 w-4 mr-2" />
                Manage Access
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Download
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
