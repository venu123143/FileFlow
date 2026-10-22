"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, User, Loader2, AlertCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/useAuth"
import type { FileItem } from "@/types/file-manager"
import { formatFileSize } from "@/lib/utils"
import type { IUserListItem } from "@/types/user.types"
import { SHARE_PERMISSION, type SharePermission } from "@/types/file.types"

interface ShareFileModalProps {
  isOpen: boolean
  onClose: () => void
  /** One item for the single-file flow, many for the bulk flow. */
  filesToShare: FileItem[]
  onShareFile: (fileIds: string[], userIds: string[], permissionLevel: SharePermission) => Promise<{ success: boolean; error?: string }>
}

const PERMISSION_HINTS: Record<SharePermission, string> = {
  [SHARE_PERMISSION.VIEW]: "Can view only",
  [SHARE_PERMISSION.EDIT]: "Can view and edit",
  [SHARE_PERMISSION.ADMIN]: "Full access, including sharing",
}

const MIN_QUERY_LENGTH = 2

/** Total bytes and file count, including everything inside shared folders. */
function measure(items: FileItem[]): { bytes: number; files: number } {
  let bytes = 0
  let files = 0
  for (const item of items) {
    if (item.type === "folder") {
      const inner = measure(item.children ?? [])
      bytes += inner.bytes
      files += inner.files
    } else {
      bytes += item.file_info?.file_size ?? 0
      files += 1
    }
  }
  return { bytes, files }
}

function UserAvatar({ user, className = "h-8 w-8" }: { user: IUserListItem; className?: string }) {
  return (
    <span className={`${className} rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden`}>
      {user.avatar_url ? (
        <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <User className="h-4 w-4 text-muted-foreground" />
      )}
    </span>
  )
}

export function ShareFileModal({
  isOpen,
  onClose,
  filesToShare,
  onShareFile
}: ShareFileModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<IUserListItem[]>([])
  const [users, setUsers] = useState<IUserListItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [permissionLevel, setPermissionLevel] = useState<SharePermission>(SHARE_PERMISSION.VIEW)

  const searchRef = useRef<HTMLInputElement>(null)
  const { getAllUsers, user: currentUser } = useAuth()

  const query = searchQuery.trim()
  const isSearchActive = query.length >= MIN_QUERY_LENGTH

  // Debounced user search. `cancelled` drops responses that arrive after the query changed.
  useEffect(() => {
    if (!isSearchActive) {
      setUsers([])
      setIsSearching(false)
      return
    }
    let cancelled = false
    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const result = await getAllUsers({
          search: query,
          page: 1,
          limit: 20,
          is_active: true,
          email_verified: false
        })
        if (!cancelled) setUsers(Array.isArray(result) ? result : [])
      } catch {
        if (!cancelled) setUsers([])
      } finally {
        if (!cancelled) setIsSearching(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const availableUsers = useMemo(
    () => users.filter(u => u.id !== currentUser?.id && !selectedUsers.some(s => s.id === u.id)),
    [users, selectedUsers, currentUser]
  )

  const count = filesToShare.length
  const title = count === 1 ? `Share "${filesToShare[0]?.name}"` : `Share ${count} items`
  const { bytes: totalBytes, files: totalFiles } = useMemo(() => measure(filesToShare), [filesToShare])
  const sizeSummary = `${formatFileSize(totalBytes)} · ${totalFiles} ${totalFiles === 1 ? "file" : "files"}`
  const noun = count === 1 ? "this item" : "these items"

  const reset = () => {
    setSelectedUsers([])
    setSearchQuery("")
    setError("")
    setIsLoading(false)
    setPermissionLevel(SHARE_PERMISSION.VIEW)
  }

  const handleClose = () => {
    if (isLoading) return
    onClose()
    reset()
  }

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      // First Escape clears the search, the next one closes.
      if (searchQuery) setSearchQuery("")
      else handleClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isLoading, searchQuery])

  useEffect(() => {
    if (isOpen) searchRef.current?.focus()
  }, [isOpen])

  const addUser = (user: IUserListItem) => {
    setSelectedUsers(prev => [...prev, user])
    setSearchQuery("")
    searchRef.current?.focus()
  }

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleShare = async () => {
    if (count === 0 || selectedUsers.length === 0) return
    setIsLoading(true)
    setError("")
    try {
      const result = await onShareFile(filesToShare.map(f => f.id), selectedUsers.map(u => u.id), permissionLevel)
      if (result.success) {
        onClose()
        reset()
      } else {
        setError(result.error || "Couldn't share. Try again.")
      }
    } catch (err: any) {
      setError(err?.message || "Couldn't share. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const shareLabel = selectedUsers.length === 0
    ? "Share"
    : `Share with ${selectedUsers.length} ${selectedUsers.length === 1 ? "person" : "people"}`

  return (
    <AnimatePresence>
      {isOpen && count > 0 && (
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
              <div className="min-w-0">
                <h2 className="text-base font-semibold truncate" title={title}>{title}</h2>
                <p className="text-xs text-muted-foreground">{sizeSummary}</p>
              </div>
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

            {/* Search + chosen people */}
            <div className="px-4 pb-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people by name or email"
                  aria-label="Search people"
                  className="w-full h-10 sm:h-9 pl-9 pr-9 rounded-md border border-input bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" aria-label="Searching" />
                )}
              </div>

              {selectedUsers.length > 0 && (
                <ul className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto" aria-label="Selected people">
                  {selectedUsers.map(u => (
                    <li
                      key={u.id}
                      className="inline-flex items-center gap-1.5 max-w-full rounded-full bg-muted pl-1 pr-1 py-1 text-sm"
                    >
                      <UserAvatar user={u} className="h-5 w-5" />
                      <span className="truncate max-w-[10rem]">{u.display_name || u.email}</span>
                      <button
                        type="button"
                        onClick={() => removeUser(u.id)}
                        aria-label={`Remove ${u.display_name || u.email}`}
                        className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Results / hint */}
            <div className="flex-1 min-h-0 overflow-y-auto border-y border-border px-2 py-1">
              {isSearchActive ? (
                availableUsers.length > 0 ? (
                  <ul aria-label="Search results">
                    {availableUsers.map(u => (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => addUser(u)}
                          className="w-full min-h-12 flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <UserAvatar user={u} className="h-9 w-9" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm truncate">{u.display_name}</span>
                            <span className="block text-xs text-muted-foreground truncate">{u.email}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex items-center justify-center text-center px-6">
                    <p className="text-sm text-muted-foreground" role="status">
                      {isSearching ? "Searching…" : `No people match "${query}"`}
                    </p>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <Users className="h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {selectedUsers.length === 0
                      ? `Search for people to share ${noun} with.`
                      : "Search to add more people."}
                  </p>
                </div>
              )}
            </div>

            {/* Permission + actions */}
            <div className="px-4 pt-3 pb-4 sm:pb-3 space-y-3">
              <div>
                <div role="radiogroup" aria-label="Permission" className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                  {Object.entries(SHARE_PERMISSION).map(([key, value]) => {
                    const active = permissionLevel === value
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setPermissionLevel(value)}
                        className={`h-8 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                          active ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{PERMISSION_HINTS[permissionLevel]}</p>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-2 sm:justify-end [&>button]:flex-1 sm:[&>button]:flex-none">
                <Button variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleShare} disabled={isLoading || selectedUsers.length === 0}>
                  {isLoading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                  {isLoading ? "Sharing" : shareLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
