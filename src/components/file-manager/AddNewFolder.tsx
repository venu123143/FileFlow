"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, FolderPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface AddNewFolderProps {
  onAddFolder: (folderName: string) => Promise<{ success: boolean; error?: string }>
  className?: string
  variant?: "button" | "card"
  placeholder?: string
  buttonText?: string
  // Edit mode props
  isEditMode?: boolean
  initialName?: string
  onEditFolder?: (folderId: string, folderName: string) => Promise<{ success: boolean; error?: string }>
  folderId?: string
  isOpen?: boolean
  onClose?: () => void
}

export function AddNewFolder({
  onAddFolder,
  className = "",
  variant = "button",
  placeholder = "Enter folder name...",
  buttonText = "New Folder",
  // Edit mode props
  isEditMode = false,
  initialName = "",
  onEditFolder,
  folderId,
  isOpen = false,
  onClose
}: AddNewFolderProps) {
  const [isModalOpen, setIsModalOpen] = useState(isOpen)
  const [folderName, setFolderName] = useState(initialName)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Handle external open/close state
  useEffect(() => {
    setIsModalOpen(isOpen)
  }, [isOpen])

  useEffect(() => {
    setFolderName(initialName)
  }, [initialName])

  const handleCreateClick = () => {
    setIsModalOpen(true)
    setFolderName("")
    setIsError(false)
    setErrorMessage("")
    setIsLoading(false)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    if (!isEditMode) {
      setFolderName("")
    } else {
      setFolderName(initialName)
    }
    setIsError(false)
    setErrorMessage("")
    setIsLoading(false)
    onClose?.()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = folderName.trim()

    if (!trimmedName) {
      setIsError(true)
      setErrorMessage("Folder name is required")
      return
    }

    if (trimmedName.includes("/") || trimmedName.includes("\\")) {
      setIsError(true)
      setErrorMessage("Invalid folder name")
      return
    }

    // Check if name changed in edit mode
    if (isEditMode && trimmedName === initialName) {
      handleClose()
      return
    }

    setIsLoading(true)
    setIsError(false)
    setErrorMessage("")

    try {
      let result: { success: boolean; error?: string }

      if (isEditMode && onEditFolder && folderId) {
        result = await onEditFolder(folderId, trimmedName)
      } else {
        result = await onAddFolder(trimmedName)
      }

      if (result.success) {
        handleClose()
      } else {
        setIsError(true)
        setErrorMessage(result.error || `Failed to ${isEditMode ? 'rename' : 'create'} folder`)
      }
    } catch (error) {
      setIsError(true)
      setErrorMessage("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose()
    }
  }

  return (
    <>
      {/* Trigger Button/Card - Only show when not in edit mode */}
      {!isEditMode && variant === "card" ? (
        <div className={className}>
          <Card
            className="group h-full cursor-pointer hover:shadow-md transition-all duration-200 border-dashed border-2 border-muted-foreground/30 hover:bg-amber-50 hover:border-muted-foreground/50"
            onClick={handleCreateClick}
          >
            <CardContent className="p-6  flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{buttonText}</p>
                <p className="text-xs text-muted-foreground">Click to create a new folder</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : !isEditMode ? (
        <div className={className}>
          <Button
            onClick={handleCreateClick}
            // variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {buttonText}
          </Button>
        </div>
      ) : null}

      {/* Modal Popup */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderPlus className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {isEditMode ? "Rename Folder" : "Create New Folder"}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="folderName" className="block text-sm font-medium text-foreground mb-2">
                      {isEditMode ? "New Folder Name" : "Folder Name"}
                    </label>
                    <Input
                      id="folderName"
                      type="text"
                      value={folderName}
                      onChange={(e) => {
                        setFolderName(e.target.value)
                        if (isError) setIsError(false)
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={placeholder}
                      maxLength={50}
                      className={`w-full ${isError ? 'border-red-500 focus:border-red-500' : ''}`}
                      autoFocus
                    />
                    <div className="flex items-center justify-between mt-2">
                      {isError && (
                        <p className="text-xs text-red-500">
                          {errorMessage}
                        </p>
                      )}
                      <p className={`text-xs ml-auto ${folderName.length > 40 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                        {folderName.length}/50
                      </p>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (isEditMode ? "Renaming..." : "Creating...") : (isEditMode ? "Rename Folder" : "Create Folder")}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
