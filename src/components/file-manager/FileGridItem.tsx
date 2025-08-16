import { motion } from "framer-motion";
import { getFileTypeColor } from "@/types/file-manager";
import type { FileItem } from "@/types/file-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download, Share2, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FileGridItemProps {
  file: FileItem;
  index: number;
  isSelected: boolean;
  onFileSelect: (fileId: string) => void;
  onItemClick: (item: FileItem) => void;
}

export function FileGridItem({ file, index, isSelected, onFileSelect, onItemClick }: FileGridItemProps) {
  return (
    <motion.div
      key={file.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="w-full"
    >
      <Card className="group px-0 py-1 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full">
        <CardContent className="p-2 flex flex-col flex-grow">
          <div className="flex w-full items-start justify-between">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onFileSelect(file.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
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
          </div>

          <div
            className="flex flex-col items-center text-center space-y-2 flex-grow justify-between"
            onClick={() => onItemClick(file)}
          >
            {file.thumbnail ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={file.thumbnail || "/placeholder.svg"}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <file.icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
            )}

            <div className="w-full h-10 flex flex-col justify-center">
              <p className="font-medium text-xs truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">{file.size}</p>
            </div>

            <div className="w-full h-9 flex items-center justify-center gap-1 flex-wrap">
              {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
              {file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
              <Badge
                variant="secondary"
                className={`text-xs ${getFileTypeColor(file.fileType || file.type)}`}
              >
                {file.fileType || file.type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
