import { motion } from "framer-motion";
import { ArrowLeft, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileManagerHeaderProps {
  currentPath: string[];
  filteredFilesCount: number;
  onBackClick: () => void;
}

export function FileManagerHeader({ currentPath, filteredFilesCount, onBackClick }: FileManagerHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {currentPath.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onBackClick} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {currentPath.length > 0 ? currentPath[currentPath.length - 1] : "All Files"}
            </h1>
            <p className="text-sm text-muted-foreground">{filteredFilesCount} items</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
            <Upload className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <Button size="sm" className="text-xs sm:text-sm">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Folder</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
