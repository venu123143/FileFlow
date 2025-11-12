"use client"

import { useState, useEffect, useRef } from "react"
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
  Music,
  Archive,
  FolderIcon,
  Plus,
  Upload,
  Lock,
  Shield,
  EyeOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { FileManager } from "@/components/file-manager/FileManager"
import { privatePageConfig, defaultViewConfig } from "@/config/page-configs"
import { useFile } from "@/contexts/fileContext"
import { toast } from "sonner"
import type { PrivateFileItem, FileActionHandlers, FileItem } from "@/types/file-manager"
import { VerifyPinModal } from "@/components/session/VerifyPin"
import { useAuth } from "@/contexts/useAuth"

const mockPrivateFiles: PrivateFileItem[] = [
  {
    id: "1",
    name: "Personal Journal.docx",
    type: "file",
    fileType: "document",
    size: "1.2 MB",
    modified: "1 hour ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
    shared: false,
    parentPath: [],
    variant: "private",
    encrypted: true,
    sensitive: true,
  },
  {
    id: "2",
    name: "Family Photos",
    type: "folder",
    fileType: "folder",
    size: "234 MB",
    modified: "3 hours ago",
    icon: FolderIcon,
    thumbnail: null,
    starred: false,
    shared: false,
    parentPath: [],
    variant: "private",
    encrypted: true,
    sensitive: false,
  },
  {
    id: "3",
    name: "Tax Documents 2024.pdf",
    type: "file",
    fileType: "pdf",
    size: "5.8 MB",
    modified: "2 days ago",
    icon: FileText,
    thumbnail: null,
    starred: true,
    shared: false,
    parentPath: [],
    variant: "private",
    encrypted: true,
    sensitive: true,
  },
  {
    id: "4",
    name: "Private Notes.txt",
    type: "file",
    fileType: "text",
    size: "45 KB",
    modified: "1 week ago",
    icon: FileText,
    thumbnail: null,
    starred: false,
    shared: false,
    parentPath: [],
    variant: "private",
    encrypted: false,
    sensitive: false,
  },
  {
    id: "5",
    name: "Confidential Recording.mp3",
    type: "file",
    fileType: "audio",
    size: "23.4 MB",
    modified: "2 weeks ago",
    icon: Music,
    thumbnail: null,
    starred: false,
    shared: false,
    parentPath: [],
    variant: "private",
    encrypted: true,
    sensitive: true,
  },
  {
    id: "6",
    name: "Personal Backup.zip",
    type: "file",
    fileType: "archive",
    size: "156 MB",
    modified: "1 month ago",
    icon: Archive,
    thumbnail: null,
    starred: false,
    shared: false,
    parentPath: [],
    variant: "private",
    encrypted: true,
    sensitive: false,
  },
]

export function PrivateFilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showSensitiveOnly, setShowSensitiveOnly] = useState(false)
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const hasCheckedSession = useRef(false)

  const { deleteFileOrFolder } = useFile()
  const { user, getPinSession } = useAuth()

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
    onItemClick: (item) => console.log("Clicked on private item:", item.name),
    onDownload: (file) => console.log("Download file:", file.name),
    onShare: (file) => console.log("Share file:", file.name),
    onDelete: handleDeleteFile,
    onEncrypt: (file) => console.log("Encrypt file:", file.name),
    onDecrypt: (file) => console.log("Decrypt file:", file.name),
  }

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground">Checking session...</p>
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
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Please verify your PIN to access private files</p>
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

        {/* Unified File Manager */}
        <FileManager
          files={filteredFiles}
          selectedFiles={selectedFiles}
          pageConfig={privatePageConfig}
          viewConfig={defaultViewConfig}
          actionHandlers={actionHandlers}
          viewMode={viewMode}
        />
      </div>
    </>
  )
}
