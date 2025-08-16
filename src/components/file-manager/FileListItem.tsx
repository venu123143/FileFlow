import { motion } from "framer-motion";
import { getFileTypeColor } from "@/types/file-manager";
import type { FileItem } from "@/types/file-manager";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download, Share2, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FileListItemProps {
  file: FileItem;
  index: number;
  isSelected: boolean;
  onFileSelect: (fileId: string) => void;
  onItemClick: (item: FileItem) => void;
}

export function FileListItem({ file, index, isSelected, onFileSelect, onItemClick }: FileListItemProps) {
  return (
    <motion.div
      key={file.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="flex items-center gap-3 p-2 sm:p-3 hover:bg-muted/50 transition-colors group cursor-pointer h-16"
      onClick={() => onItemClick(file)}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onFileSelect(file.id)}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <file.icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-sm whitespace-nowrap">{file.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{file.size}</span>
          <span>•</span>
          <span className="hidden sm:inline">{file.modified}</span>
          {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
          {file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
        </div>
      </div>
      <Badge
        variant="secondary"
        className={`text-xs ${getFileTypeColor(file.fileType || file.type)} shrink-0`}
      >
        {file.fileType || file.type}
      </Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Star className="h-4 w-4 mr-2" />
            {file.starred ? "Unstar" : "Star"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
