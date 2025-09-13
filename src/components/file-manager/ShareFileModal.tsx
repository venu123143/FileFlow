"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, Search, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/useAuth"
import type { FileItem } from "@/types/file-manager"
import type { IUserListItem } from "@/types/user.types"
import { SHARE_PERMISSION, type SharePermission } from "@/types/file.types"

interface ShareFileModalProps {
  isOpen: boolean
  onClose: () => void
  fileToShare: FileItem | null
  onShareFile: (fileId: string, userIds: string[], permissionLevel: SharePermission) => Promise<{ success: boolean; error?: string }>
}

export function ShareFileModal({
  isOpen,
  onClose,
  fileToShare,
  onShareFile
}: ShareFileModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<IUserListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const [users, setUsers] = useState<IUserListItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [permissionLevel, setPermissionLevel] = useState<SharePermission>(SHARE_PERMISSION.VIEW)

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { getAllUsers, user: currentUser } = useAuth()

  // Search users when query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await getAllUsers({
            search: searchQuery.trim(),
            page: 1,
            limit: 20,
            is_active: true,
            email_verified: true
          })
          setUsers(Array.isArray(result) ? result : [])
          setShowDropdown(true)
        } catch (error) {
          console.error("Error searching users:", error)
          setUsers([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    } else {
      setUsers([])
      setShowDropdown(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Filter out already selected users and current user
  const availableUsers = useMemo(() => {
    return users.filter(user =>
      !selectedUsers.some(selected => selected.id === user.id) &&
      user.id !== currentUser?.id
    )
  }, [users, selectedUsers, currentUser])

  const handleUserSelect = (user: IUserListItem) => {
    setSelectedUsers(prev => [...prev, user])
    setSearchQuery("")
    setShowDropdown(false)
  }

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId))
  }

  const handleShare = async () => {
    if (!fileToShare || selectedUsers.length === 0) return

    setIsLoading(true)
    setError("")

    try {
      const userIds = selectedUsers.map(user => user.id)
      const result = await onShareFile(fileToShare.id, userIds, permissionLevel)
      if (result.success) {
        onClose()
        setSelectedUsers([])
        setSearchQuery("")
        setPermissionLevel(SHARE_PERMISSION.VIEW)
      } else {
        setError(result.error || "Failed to share file")
      }
    } catch (error: any) {
      setError(error?.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setSelectedUsers([])
    setSearchQuery("")
    setError("")
    setIsLoading(false)
    setShowDropdown(false)
    setPermissionLevel(SHARE_PERMISSION.VIEW)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (showDropdown) {
        setShowDropdown(false)
        setSearchQuery("")
      } else {
        handleClose()
      }
    }
  }

  const handleClickOutside = () => {
    if (showDropdown) {
      setShowDropdown(false)
    }
  }

  const getSelectedUsersData = () => {
    return selectedUsers
  }

  return (
    <AnimatePresence>
      {isOpen && fileToShare && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold">Share File</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    Sharing: <span className="font-medium">{fileToShare.name}</span>
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

            {/* Search Section */}
            <div className="p-1 sm:p-2 border-b border-border flex-shrink-0 relative" onClick={handleClickOutside}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users to share with..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 h-10"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && availableUsers.length > 0 && (
                <div className="absolute z-20 left-4 right-4 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.display_name || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.display_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showDropdown && searchQuery.length >= 2 && availableUsers.length === 0 && !isSearching && (
                <div className="absolute z-20 left-4 right-4 mt-2 bg-background border border-border rounded-lg shadow-lg p-3">
                  <p className="text-sm text-muted-foreground text-center">No users found</p>
                </div>
              )}
            </div>

            {/* Permission Level Selector */}
            <div className="p-1 sm:p-2 border-b border-border flex-shrink-0">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Permission Level
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(SHARE_PERMISSION).map(([key, value]) => (
                    <Button
                      key={value}
                      variant={permissionLevel === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPermissionLevel(value)}
                      className="text-xs"
                    >
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {permissionLevel === SHARE_PERMISSION.VIEW && "Users can only view the file"}
                  {permissionLevel === SHARE_PERMISSION.EDIT && "Users can view and edit the file"}
                  {permissionLevel === SHARE_PERMISSION.ADMIN && "Users have full administrative access"}
                </p>
              </div>
            </div>

            {/* Selected Users */}
            <div className="flex-1 p-2 overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {selectedUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                      <Share2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        No users selected yet
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Search and select users to share this file with
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Selected Users ({selectedUsers.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getSelectedUsersData().map((user) => (
                      <Card key={user.id} className="group">
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.display_name || 'User'}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{user.display_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserRemove(user.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-border flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {selectedUsers.length > 0 && (
                    <span>
                      {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleShare}
                    disabled={isLoading || selectedUsers.length === 0}
                  >
                    {isLoading ? "Sharing..." : "Share File"}
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
