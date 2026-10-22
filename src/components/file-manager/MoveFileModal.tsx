"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Folder, ChevronRight, Home, X, Search, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FileItem } from "@/types/file-manager"

interface MoveFileModalProps {
  isOpen: boolean
  onClose: () => void
  /** One item for the single-file flow, many for the bulk flow. */
  filesToMove: FileItem[]
  fileSystemTree: FileItem[]
  onMoveFile: (fileIds: string[], targetFolderId: string | null) => Promise<{ success: boolean; error?: string }>
}

interface FolderNode {
  id: string
  name: string
  children: FolderNode[]
}

interface PathEntry {
  id: string
  name: string
}

export function MoveFileModal({
  isOpen,
  onClose,
  filesToMove,
  fileSystemTree,
  onMoveFile
}: MoveFileModalProps) {
  const [currentPath, setCurrentPath] = useState<PathEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  // A folder in the selection cannot be its own destination (nor can anything inside it);
  // the server rejects this too, but hiding it avoids an avoidable round trip.
  const movingIds = useMemo(() => new Set(filesToMove.map(f => f.id)), [filesToMove])

  // Folders only, with the moving items and their subtrees pruned out.
  const folderTree = useMemo(() => {
    const toFolders = (items: FileItem[]): FolderNode[] =>
      items
        .filter(item => item.type === "folder" && !movingIds.has(item.id))
        .map(item => ({ id: item.id, name: item.name, children: toFolders(item.children ?? []) }))
    return toFolders(fileSystemTree)
  }, [fileSystemTree, movingIds])

  // Every folder with its full path, used for searching across all levels.
  const flatFolders = useMemo(() => {
    const out: Array<{ node: FolderNode; path: PathEntry[] }> = []
    const walk = (nodes: FolderNode[], path: PathEntry[]) => {
      for (const node of nodes) {
        const nodePath = [...path, { id: node.id, name: node.name }]
        out.push({ node, path: nodePath })
        walk(node.children, nodePath)
      }
    }
    walk(folderTree, [])
    return out
  }, [folderTree])

  const currentFolders = useMemo(() => {
    let items = folderTree
    for (const step of currentPath) {
      items = items.find(item => item.id === step.id)?.children ?? []
    }
    return items
  }, [currentPath, folderTree])

  const query = searchQuery.trim().toLowerCase()
  const searchResults = useMemo(
    () => (query ? flatFolders.filter(({ node }) => node.name.toLowerCase().includes(query)) : []),
    [flatFolders, query]
  )

  const title = filesToMove.length === 1 ? `Move "${filesToMove[0].name}"` : `Move ${filesToMove.length} items`
  const destinationName = currentPath.length > 0 ? currentPath[currentPath.length - 1].name : "All files"

  const reset = () => {
    setCurrentPath([])
    setSearchQuery("")
    setError("")
    setIsLoading(false)
  }

  const handleClose = () => {
    if (isLoading) return
    onClose()
    reset()
  }

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", onKey)
    searchRef.current?.focus()
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isLoading])

  const openFolder = (path: PathEntry[]) => {
    setCurrentPath(path)
    setSearchQuery("")
    setError("")
  }

  const goToCrumb = (index: number) => openFolder(currentPath.slice(0, index + 1))

  const handleMove = async () => {
    if (filesToMove.length === 0) return
    setIsLoading(true)
    setError("")
    try {
      const targetId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null
      const result = await onMoveFile(filesToMove.map(f => f.id), targetId)
      if (result.success) {
        onClose()
        reset()
      } else {
        setError(result.error || "Couldn't move the items. Try again.")
      }
    } catch (err: any) {
      setError(err?.message || "Couldn't move the items. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const rows = query
    ? searchResults.map(({ node, path }) => ({
        node,
        path,
        hint: path.length > 1 ? path.slice(0, -1).map(p => p.name).join(" / ") : "All files",
      }))
    : currentFolders.map(node => ({
        node,
        path: [...currentPath, { id: node.id, name: node.name }],
        hint: node.children.length > 0 ? `${node.children.length} ${node.children.length === 1 ? "folder" : "folders"}` : "",
      }))

  return (
    <AnimatePresence>
      {isOpen && filesToMove.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="bg-background border border-border shadow-xl w-full sm:max-w-md h-[85dvh] sm:h-[34rem] max-h-[100dvh] rounded-t-2xl sm:rounded-xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
              <h2 className="text-base font-semibold truncate" title={title}>{title}</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground"
                onClick={handleClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all folders"
                  className="w-full h-10 sm:h-9 pl-9 pr-3 rounded-md border border-input bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring"
                />
              </div>
            </div>

            {/* Breadcrumb */}
            {!query && (
              <nav aria-label="Folder path" className="px-4 pb-2 flex items-center gap-0.5 text-sm overflow-x-auto whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => openFolder([])}
                  className={`inline-flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-muted ${currentPath.length === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                >
                  <Home className="h-3.5 w-3.5" />
                  All files
                </button>
                {currentPath.map((step, index) => (
                  <span key={step.id} className="inline-flex items-center gap-0.5">
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => goToCrumb(index)}
                      className={`rounded px-1.5 py-1 hover:bg-muted max-w-[10rem] truncate ${index === currentPath.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                    >
                      {step.name}
                    </button>
                  </span>
                ))}
              </nav>
            )}

            {/* Folder list */}
            <div className="flex-1 min-h-[12rem] overflow-y-auto border-y border-border px-2 py-1">
              {rows.length === 0 ? (
                <div className="h-full min-h-[12rem] flex flex-col items-center justify-center text-center px-6">
                  <Folder className="h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {query
                      ? `No folders match "${searchQuery.trim()}"`
                      : "No folders here. You can still move your items into this location."}
                  </p>
                </div>
              ) : (
                <ul>
                  {rows.map(({ node, path, hint }) => (
                    <li key={node.id}>
                      <button
                        type="button"
                        onClick={() => openFolder(path)}
                        className="group w-full min-h-12 flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Folder className="h-4.5 w-4.5 text-primary" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm truncate" title={node.name}>{node.name}</span>
                          {hint && <span className="block text-xs text-muted-foreground truncate">{hint}</span>}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground sm:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pt-3 pb-4 sm:pb-3 space-y-3">
              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-muted-foreground min-w-0 truncate">
                  Move to <span className="font-medium text-foreground">{destinationName}</span>
                </p>
                <div className="flex items-center gap-2 flex-shrink-0 [&>button]:flex-1 sm:[&>button]:flex-none">
                  <Button variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleMove} disabled={isLoading}>
                    {isLoading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    {isLoading ? "Moving" : "Move here"}
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
