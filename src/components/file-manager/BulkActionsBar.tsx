import { motion } from "framer-motion";
import { Download, FolderInput, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface BulkActionsBarProps {
  selectedFilesCount: number;
  totalFilesCount: number;
  onSelectAll: () => void;
  /** Omit a handler to leave that action out of the bar. */
  onMove?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  /** Disables every action while a bulk request is in flight. */
  isBusy?: boolean;
}

export function BulkActionsBar({
  selectedFilesCount,
  totalFilesCount,
  onSelectAll,
  onMove,
  onShare,
  onDelete,
  isBusy = false,
}: BulkActionsBarProps) {
  if (selectedFilesCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-muted rounded-lg"
    >
      <div className="flex items-center gap-3">
        <Checkbox checked={selectedFilesCount === totalFilesCount} onCheckedChange={onSelectAll} />
        <span className="text-sm font-medium">{selectedFilesCount} items selected</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {/* No bulk-download endpoint exists yet, so this stays inert. */}
        <Button variant="outline" size="sm" disabled>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        {onMove && (
          <Button variant="outline" size="sm" onClick={onMove} disabled={isBusy}>
            <FolderInput className="h-4 w-4 mr-2" />
            Move
          </Button>
        )}
        {onShare && (
          <Button variant="outline" size="sm" onClick={onShare} disabled={isBusy}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
        {onDelete && (
          <Button variant="outline" size="sm" onClick={onDelete} disabled={isBusy}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
    </motion.div>
  );
}
