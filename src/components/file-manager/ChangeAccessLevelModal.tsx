"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Shield, Lock, Globe, Users } from "lucide-react"
import { ACCESS_LEVEL, type AccessLevel } from "@/types/file.types"
import type { FileItem } from "@/types/file-manager"

interface ChangeAccessLevelModalProps {
  isOpen: boolean
  onClose: () => void
  file: FileItem | null
  currentAccessLevel?: string
  onConfirm: (fileId: string, accessLevel: AccessLevel) => Promise<{ success: boolean; error?: string }>
}

const accessLevelOptions = [
  {
    value: ACCESS_LEVEL.PUBLIC,
    label: "Public",
    description: "Anyone can access this file",
    icon: Globe,
    color: "text-green-600 dark:text-green-400"
  },
  {
    value: ACCESS_LEVEL.PROTECTED,
    label: "Protected",
    description: "Only users you share with can access",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    value: ACCESS_LEVEL.PRIVATE,
    label: "Private",
    description: "Only you can access this file",
    icon: Lock,
    color: "text-red-600 dark:text-red-400"
  }
]

export function ChangeAccessLevelModal({
  isOpen,
  onClose,
  file,
  currentAccessLevel,
  onConfirm
}: ChangeAccessLevelModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<AccessLevel | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set initial selected level when modal opens
  useEffect(() => {
    if (isOpen && currentAccessLevel) {
      setSelectedLevel(currentAccessLevel as AccessLevel)
    } else if (isOpen && file?.access_level) {
      setSelectedLevel(file.access_level as AccessLevel)
    }
  }, [isOpen, currentAccessLevel, file])

  const handleConfirm = async () => {
    if (!file || !selectedLevel) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await onConfirm(file.id, selectedLevel)
      if (result.success) {
        onClose()
        setSelectedLevel(null)
      } else {
        setError(result.error || "Failed to update access level")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedLevel(null)
    setError(null)
    onClose()
  }

  if (!file) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change Access Level
          </DialogTitle>
          <DialogDescription>
            Select a new access level for <span className="font-medium">{file.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            {accessLevelOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedLevel === option.value
              const isCurrent = currentAccessLevel === option.value

              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedLevel(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }`}
                  disabled={isLoading}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${option.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        {isCurrent && (
                          <span className="text-xs text-muted-foreground">(Current)</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading || !selectedLevel || selectedLevel === currentAccessLevel}
            >
              {isLoading ? "Updating..." : "Update Access Level"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

