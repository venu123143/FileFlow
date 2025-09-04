import { motion } from "framer-motion";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddNewFolder } from "./AddNewFolder";

interface FileManagerHeaderProps {
  currentPath: Array<{ id: string, name: string }>;
  filteredFilesCount: number;
  onBackClick: () => void;
  onCreateFolder?: (folderName: string) => Promise<{ success: boolean; error?: string }>;
  onUploadClick?: () => void;
}

export function FileManagerHeader({ currentPath, filteredFilesCount, onBackClick, onCreateFolder, onUploadClick }: FileManagerHeaderProps) {
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
              {currentPath.length > 0 ? currentPath[currentPath.length - 1]?.name : "All Files"}
            </h1>
            <p className="text-sm text-muted-foreground">{filteredFilesCount} items</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button onClick={onUploadClick} variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
            <Upload className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          {onCreateFolder && (
            <AddNewFolder
              onAddFolder={onCreateFolder}
              variant="button"
              buttonText="New Folder"
              className="shrink-0"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
