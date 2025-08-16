import { motion } from "framer-motion";
import { Download, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface BulkActionsBarProps {
  selectedFilesCount: number;
  totalFilesCount: number;
  onSelectAll: () => void;
}

export function BulkActionsBar({ selectedFilesCount, totalFilesCount, onSelectAll }: BulkActionsBarProps) {
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
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </motion.div>
  );
}
