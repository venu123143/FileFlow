"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FolderOpen, ChevronRight, Home, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import type { FileItem } from "@/types/file-manager"

interface MoveFileModalProps {
  isOpen: boolean
  onClose: () => void
  fileToMove: FileItem | null
  fileSystemTree: FileItem[]
  onMoveFile: (fileId: string, targetFolderId: string | null) => Promise<{ success: boolean; error?: string }>
}

interface FolderNode {
  id: string
  name: string
  type: "folder"
  children?: FolderNode[]
  parentPath: string[]
}

export function MoveFileModal({
  isOpen,
  onClose,
  fileToMove,
  fileSystemTree,
  onMoveFile
}: MoveFileModalProps) {
  const [currentPath, setCurrentPath] = useState<Array<{ id: string; name: string }>>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Transform FileItem tree to FolderNode tree (only folders)
  const folderTree = useMemo(() => {
    const transformToFolderTree = (items: FileItem[], parentPath: string[] = []): FolderNode[] => {
      return items
        .filter(item => item.type === "folder")
        .map(item => ({
          id: item.id,
          name: item.name,
          type: "folder" as const,
          parentPath,
          children: item.children ? transformToFolderTree(item.children, [...parentPath, item.name]) : undefined
        }))
    }
    return transformToFolderTree(fileSystemTree)
  }, [fileSystemTree])

  // Get current folder items based on current path
  const currentItems = useMemo(() => {
    let items: FolderNode[] = folderTree
    for (const folder of currentPath) {
      const foundFolder = items.find((item) => item.id === folder.id)
      if (foundFolder?.children) {
        items = foundFolder.children
      }
    }
    return items
  }, [currentPath, folderTree])

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return currentItems

    const searchLower = searchQuery.toLowerCase()
    const searchInTree = (items: FolderNode[]): FolderNode[] => {
      return items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchLower)
        const hasMatchingChildren = item.children ? searchInTree(item.children).length > 0 : false
        return matchesSearch || hasMatchingChildren
      }).map(item => ({
        ...item,
        children: item.children ? searchInTree(item.children) : undefined
      }))
    }

    return searchInTree(currentItems)
  }, [currentItems, searchQuery])

  const handleFolderClick = (folder: FolderNode) => {
    setCurrentPath([...currentPath, { id: folder.id, name: folder.name }])
    setSearchQuery("")
  }

  const handleBreadcrumbNavigate = (index: number) => {
    if (index === -1) {
      setCurrentPath([])
    } else {
      setCurrentPath(currentPath.slice(0, index + 1))
    }
    setSearchQuery("")
  }

  const handleMoveToFolder = async (targetFolderId: string | null) => {
    if (!fileToMove) return

    setIsLoading(true)
    setError("")

    try {
      const result = await onMoveFile(fileToMove.id, targetFolderId)
      if (result.success) {
        onClose()
        setCurrentPath([])
        setSearchQuery("")
      } else {
        setError(result.error || "Failed to move file")
      }
    } catch (error: any) {
      setError(error?.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setCurrentPath([])
    setSearchQuery("")
    setError("")
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose()
    }
  }

  const getCurrentPathString = () => {
    if (currentPath.length === 0) return "Root"
    return currentPath.map(folder => folder.name).join(" / ")
  }

  return (
    <AnimatePresence>
      {isOpen && fileToMove && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-background border border-border rounded-lg shadow-lg w-full max-w-4xl h-[85vh] sm:h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold">Move File</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    Moving: <span className="font-medium">{fileToMove.name}</span>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted flex-shrink-0"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="p-2 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-1 sm:gap-2 text-sm overflow-x-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBreadcrumbNavigate(-1)}
                  className="h-7 px-2 text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <Home className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Root</span>
                </Button>
                {currentPath.map((folder, index) => (
                  <div key={folder.id} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBreadcrumbNavigate(index)}
                      className="h-7 px-2 text-muted-foreground hover:text-foreground whitespace-nowrap"
                    >
                      {folder.name}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Folder List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {filteredItems.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {searchQuery ? "No folders found matching your search" : "No folders available"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredItems.map((folder) => (
                    <Card
                      key={folder.id}
                      className="group w-full cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
                      onClick={() => handleFolderClick(folder)}
                    >
                      <CardContent className="py-2 flex flex-col items-center text-center space-y-2  ">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-200">
                          <FolderOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="w-full min-w-0">
                          <p className="font-medium text-sm truncate" title={folder.name}>
                            {folder.name}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-1 sm:p-5 border-t border-border flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="text-sm text-muted-foreground min-w-0 flex-1">
                  <span className="hidden sm:inline">Current location: </span>
                  <span className="font-medium truncate block sm:inline">{getCurrentPathString()}</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleMoveToFolder(currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null)}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none"
                  >
                    {isLoading ? "Moving..." : "Move Here"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
