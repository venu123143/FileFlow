"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Grid3X3,
  List,
  Search,
  Filter,
  SortAsc,
  Download,
  Trash2,
  Upload,
  Lock,
  EyeOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { FileManager } from "@/components/file-manager/FileManager"
import { BreadcrumbNavigation } from "@/components/file-manager/BreadcrumbNavigation"
import { privatePageConfig, defaultViewConfig } from "@/config/page-configs"
import { useFile } from "@/contexts/fileContext"
import { transformFileSystemNodesToPrivateFileItems } from "@/lib/utils"
import { toast } from "sonner"
import type { PrivateFileItem, FileActionHandlers, FileItem } from "@/types/file-manager"
import { VerifyPinModal } from "@/components/session/VerifyPin"
import { useAuth } from "@/contexts/useAuth"
import { useSocket } from "@/contexts/SocketContext"
import { ArrowLeft } from "lucide-react"
import { ACCESS_LEVEL, type AccessLevel } from "@/types/file.types"
import { AddNewFolder } from "@/components/file-manager/AddNewFolder"
import { useNavigate } from "react-router-dom"

export function PrivateFilesPage() {
  const { socket } = useSocket()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<Array<{ id: string, name: string }>>([])
  const [showSensitiveOnly, setShowSensitiveOnly] = useState(false)
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const hasCheckedSession = useRef(false)

  const { deleteFileOrFolder, privateFiles, createFolder, updateFileAccessLevel } = useFile()
  const { user, getPinSession } = useAuth()
  const navigate = useNavigate()

  // Check for active PIN session on mount (only once)
  useEffect(() => {
    // Prevent multiple calls
    if (hasCheckedSession.current) {
      return
    }

    const checkSession = async () => {
      hasCheckedSession.current = true

      if (!user?.pin_hash) {
        // If no PIN is set, allow access
        setIsPinVerified(true)
        setShowPinModal(false)
        setIsCheckingSession(false)
        return
      }

      try {
        // Try to get the current session
        const sessionResult = await getPinSession()

        if (sessionResult.success && sessionResult.session) {
          // Check if session is valid (within 20 minutes)
          const verifiedAt = new Date(sessionResult.session.verified_at)
          const now = new Date()
          const diffInMinutes = (now.getTime() - verifiedAt.getTime()) / (1000 * 60)
          const isValid = sessionResult.session.pin_verified && diffInMinutes <= 20

          if (isValid) {
            // Session is valid (within 20 minutes), auto-verify
            setIsPinVerified(true)
            setShowPinModal(false)
          } else {
            // Session expired, show PIN modal
            setIsPinVerified(false)
            setShowPinModal(true)
          }
        } else {
          // No valid session, show PIN modal
          setIsPinVerified(false)
          setShowPinModal(true)
        }
      } catch (error) {
        // If session check fails, show PIN modal
        setIsPinVerified(false)
        setShowPinModal(true)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [user, getPinSession])

  const handlePinVerified = () => {
    setIsPinVerified(true)
    setShowPinModal(false)
  }

  // Transform dynamic data to PrivateFileItem format
  const transformedPrivateFiles = useMemo(() => {
    return transformFileSystemNodesToPrivateFileItems(privateFiles)
  }, [privateFiles])

  // Get current items based on currentPath (similar to all-files-page)
  let currentItems = useMemo(() => {
    let items: PrivateFileItem[] = transformedPrivateFiles
    for (const folder of currentPath) {
      const foundFolder = items.find((item) => item.id === folder.id && item.type === "folder")
      if (foundFolder?.children) {
        items = foundFolder.children as PrivateFileItem[]
      }
    }
    return items
  }, [currentPath, transformedPrivateFiles])

  const filteredFiles = useMemo(() => {
    const matchesSearch = (file: PrivateFileItem) => file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSensitive = (file: PrivateFileItem) => !showSensitiveOnly || file.sensitive
    return currentItems.filter((file) => matchesSearch(file) && matchesSensitive(file))
  }, [currentItems, searchQuery, showSensitiveOnly])

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const selectAllFiles = () => {
    setSelectedFiles(selectedFiles.length === filteredFiles.length ? [] : filteredFiles.map((f) => f.id))
  }

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      setCurrentPath([...currentPath, { id: item.id, name: item.name }])
      setSelectedFiles([])
      setSearchQuery("")
    } else {
      if (!socket) return;
      socket?.emit("last_accessed", { file_id: item.id })
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

  const handleBackClick = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1))
      setSelectedFiles([])
    }
  }

  const encryptedCount = filteredFiles.filter((f) => f.encrypted).length
  const sensitiveCount = filteredFiles.filter((f) => f.sensitive).length

  const handleCreateFolder = async (folderName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Find the parent folder ID based on current path
      let parentId: string | undefined = undefined

      // Get the last folder in the current path as the parent
      if (currentPath.length > 0) {
        const lastFolder = currentPath[currentPath.length - 1]
        parentId = lastFolder.id
      }

      const result = await createFolder({
        name: folderName.trim(),
        parent_id: parentId,
        access_level: ACCESS_LEVEL.PRIVATE // Set access level to private for private files page
      })

      if (result.success) {
        toast.success("Private folder created successfully!")
      }

      return result
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to create folder'
      }
    }
  }

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

  const handleChangeAccessLevel = async (file: FileItem, accessLevel: string) => {
    try {
      const result = await updateFileAccessLevel(file.id, { access_level: accessLevel as AccessLevel });
      if (result.success) {
        toast.success("Access level updated successfully!");
      } else {
        toast.error(result.error || "Failed to update access level");
      }
    } catch (error: any) {
      console.error("Failed to update access level:", error);
      toast.error("An error occurred while updating access level");
    }
  }

  const actionHandlers: FileActionHandlers = {
    onFileSelect: toggleFileSelection,
    onItemClick: handleItemClick,
    onDownload: (file) => console.log("Download file:", file.name),
    onShare: (file) => console.log("Share file:", file.name),
    onDelete: handleDeleteFile,
    onChangeAccessLevel: handleChangeAccessLevel,
  }

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-sm sm:text-base text-muted-foreground">Checking session...</p>
        </div>
      </div>
    )
  }

  // Don't render content until PIN is verified (if PIN is set)
  if (user?.pin_hash && !isPinVerified) {
    return (
      <>
        <VerifyPinModal
          isOpen={showPinModal}
          onVerified={handlePinVerified}
          title="Verify PIN to Access Private Files"
          description="This page contains sensitive information. Please verify your PIN to continue."
          required={true}
        />
        <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto" />
            <p className="text-sm sm:text-base text-muted-foreground px-4">Please verify your PIN to access private files</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <VerifyPinModal
        isOpen={showPinModal && !isPinVerified}
        onVerified={handlePinVerified}
        title="Verify PIN to Access Private Files"
        description="This page contains sensitive information. Please verify your PIN to continue."
        required={true}
      />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {currentPath.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackClick}
                  className="p-2 flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
                  <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate">Private Files</h1>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  <span className="whitespace-nowrap">{filteredFiles.length} private items</span>
                  <span className="hidden sm:inline"> • </span>
                  <span className="block sm:inline">{encryptedCount} encrypted</span>
                  <span className="hidden sm:inline"> • </span>
                  <span className="block sm:inline">{sensitiveCount} sensitive</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const lastItem = currentPath[currentPath.length - 1];
                  const folderId = lastItem?.id ?? "root";
                  const folderName = lastItem?.name ?? "root";
                  navigate(`/all-files/${folderId}`, {
                    state: {
                      folder_id: folderId,
                      folder_name: folderName,
                      access_level: ACCESS_LEVEL.PRIVATE
                    }
                  });
                }}
                className="flex-1 sm:flex-initial"
              >
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Upload Private</span>
                <span className="sm:hidden">Upload</span>
              </Button>
              <AddNewFolder
                onAddFolder={handleCreateFolder}
                buttonText="New Private Folder"
              />
            </div>
          </div>
        </motion.div>

        {currentPath.length > 0 && (
          <BreadcrumbNavigation currentPath={currentPath} onNavigate={handleBreadcrumbNavigate} />
        )}



        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search private files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Button
                variant={showSensitiveOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSensitiveOnly(!showSensitiveOnly)}
                className="flex-1 sm:flex-initial"
              >
                <EyeOff className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sensitive Only</span>
                <span className="sm:hidden">Sensitive</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <Filter className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <SortAsc className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            {selectedFiles.length > 0 && (
              <Badge variant="secondary" className="sm:hidden">
                {selectedFiles.length}
              </Badge>
            )}
            {selectedFiles.length > 0 && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {selectedFiles.length} selected
              </Badge>
            )}
            <div className="flex items-center border rounded-lg ml-auto sm:ml-0">
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
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-muted rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Checkbox checked={selectedFiles.length === filteredFiles.length} onCheckedChange={selectAllFiles} />
              <span className="text-sm font-medium truncate">
                <span className="hidden sm:inline">{selectedFiles.length} private items selected</span>
                <span className="sm:hidden">{selectedFiles.length} selected</span>
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Unified File Manager */}
        <FileManager
          files={filteredFiles}
          selectedFiles={selectedFiles}
          pageConfig={privatePageConfig}
          viewConfig={defaultViewConfig}
          actionHandlers={actionHandlers}
          viewMode={viewMode}
          onCreateFolder={handleCreateFolder}
        />
      </div>
    </>
  )
}
