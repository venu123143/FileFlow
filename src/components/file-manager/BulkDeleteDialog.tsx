"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { FileItem } from "@/types/file-manager"

interface BulkDeleteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  filesToDelete: FileItem[]
  isDeleting: boolean
  onConfirm: () => void
}

/**
 * Confirmation for the one bulk action that destroys something. Items go to
 * trash rather than being erased, so the copy says so instead of warning about
 * permanent loss.
 */
export function BulkDeleteDialog({
  isOpen,
  onOpenChange,
  filesToDelete,
  isDeleting,
  onConfirm,
}: BulkDeleteDialogProps) {
  const count = filesToDelete.length
  const folderCount = filesToDelete.filter(f => f.type === "folder").length

  const summary = () => {
    if (count === 1) return <span className="font-medium">{filesToDelete[0]?.name}</span>
    if (folderCount === 0) return <span className="font-medium">{count} files</span>
    if (folderCount === count) return <span className="font-medium">{count} folders</span>
    return <span className="font-medium">{count} items ({folderCount} folders)</span>
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Move {count === 1 ? "this item" : `${count} items`} to trash?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {summary()} will be moved to trash. Folders take their contents with them.
            You can restore from trash until you empty it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Keep the dialog mounted while the request is in flight.
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Moving..." : "Move to trash"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
