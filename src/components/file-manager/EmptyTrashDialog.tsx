"use client"

import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface EmptyTrashDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  itemCount: number
  isEmptying: boolean
  error?: string
  onConfirm: () => void
}

/** Confirmation for emptying trash, which permanently deletes everything in it. */
export function EmptyTrashDialog({
  isOpen,
  onOpenChange,
  itemCount,
  isEmptying,
  error,
  onConfirm,
}: EmptyTrashDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isEmptying && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Empty trash?</AlertDialogTitle>
          <AlertDialogDescription>
            {itemCount === 1 ? "1 item" : `${itemCount} items`} will be permanently deleted.
            You can't undo this or restore them afterwards.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isEmptying}>Cancel</AlertDialogCancel>
          {/* A plain Button, not AlertDialogAction, so the dialog stays open while the request runs. */}
          <Button variant="destructive" onClick={onConfirm} disabled={isEmptying}>
            {isEmptying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEmptying ? "Emptying trash" : "Empty trash"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
