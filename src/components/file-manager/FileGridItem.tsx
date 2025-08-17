import { motion } from "framer-motion";
import { isDeletedFile, isPrivateFile, isSharedFile } from "@/types/file-manager";
import type { FileItem, PageConfig, FileActionHandlers } from "@/types/file-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download, Share2, Star, Trash2, RotateCcw, Lock, Unlock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FileGridItemProps {
  file: FileItem;
  index: number;
  isSelected: boolean;
  pageConfig: PageConfig;
  actionHandlers: FileActionHandlers;
}

export function FileGridItem({
  file,
  index,
  isSelected,
  pageConfig,
  actionHandlers
}: FileGridItemProps) {
  const {
    onFileSelect,
    onItemClick,
    onDownload,
    onShare,
    onStar,
    onDelete,
    onRestore,
    onEncrypt,
    onDecrypt,
    onCustomAction
  } = actionHandlers;

  const renderCustomActions = () => {
    if (!pageConfig.customActions) return null;

    return pageConfig.customActions.map((action, idx) => (
      <DropdownMenuItem
        key={idx}
        onClick={() => onCustomAction?.(action.label, file)}
        className={action.variant === "destructive" ? "text-red-600" : ""}
      >
        <action.icon className="h-4 w-4 mr-2" />
        {action.label}
      </DropdownMenuItem>
    ));
  };

  const renderPageSpecificInfo = () => {
    switch (pageConfig.variant) {
      case "deleted":
        if (isDeletedFile(file)) {
          return (
            <div className="w-full h-9 flex items-center justify-center gap-1 flex-wrap">
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                {file.daysLeft} days left
              </Badge>
            </div>
          );
        }
        // Fallback for deleted files that don't match the type guard
        return (
          <div className="w-full h-9 flex items-center justify-center gap-1 flex-wrap">
            {/* No badges for non-deleted files */}
          </div>
        );

      default:
        return (
          <div className="w-full h-9 flex items-center justify-center gap-1 flex-wrap">
            {pageConfig.showStarred && file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
            {pageConfig.showShared && file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
          </div>
        );
    }
  };

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
          {/* Header with checkbox and menu */}
          <div className="flex w-full items-start justify-between mb-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onFileSelect(file.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center gap-1">
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
                  {onDownload && (
                    <DropdownMenuItem onClick={() => onDownload(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  )}
                  {onShare && (
                    <DropdownMenuItem onClick={() => onShare(file)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  )}
                  {onStar && (
                    <DropdownMenuItem onClick={() => onStar(file)}>
                      <Star className="h-4 w-4 mr-2" />
                      {file.starred ? "Unstar" : "Star"}
                    </DropdownMenuItem>
                  )}
                  {onRestore && isDeletedFile(file) && (
                    <DropdownMenuItem onClick={() => onRestore(file)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </DropdownMenuItem>
                  )}
                  {onEncrypt && isPrivateFile(file) && !file.encrypted && (
                    <DropdownMenuItem onClick={() => onEncrypt(file)}>
                      <Lock className="h-4 w-4 mr-2" />
                      Encrypt
                    </DropdownMenuItem>
                  )}
                  {onDecrypt && isPrivateFile(file) && file.encrypted && (
                    <DropdownMenuItem onClick={() => onDecrypt(file)}>
                      <Unlock className="h-4 w-4 mr-2" />
                      Decrypt
                    </DropdownMenuItem>
                  )}
                  {renderCustomActions()}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(file)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main content area */}
          <div
            className="flex flex-col items-center text-center space-y-2 flex-grow justify-between"
            onClick={() => onItemClick(file)}
          >
            {/* Icon/Thumbnail with status overlay */}
            <div className="relative">
              {pageConfig.showThumbnails && file.thumbnail ? (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <file.icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>
              )}

              {pageConfig.variant === "shared" && isSharedFile(file) && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="h-3 w-3 text-white" />
                </div>
              )}
              {pageConfig.variant === "private" && isPrivateFile(file) && (
                <>
                  {file.encrypted && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Lock className="h-3 w-3 text-white" />
                    </div>
                  )}
                </>
              )}
              {pageConfig.variant === "standard" && (
                <>
                  {pageConfig.showStarred && file.starred && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="h-2.5 w-2.5 text-white fill-current" />
                    </div>
                  )}
                  {pageConfig.showShared && file.shared && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Share2 className="h-3 w-3 text-white" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* File name and metadata */}
            <div className="w-full min-h-[2.5rem] flex flex-col justify-center">
              <p className="font-medium text-xs truncate" title={file.name}>
                {file.name}
              </p>
              {pageConfig.showSize && (
                <p className="text-xs text-muted-foreground">{file.size}</p>
              )}
              {pageConfig.showModified && (
                <p className="text-xs text-muted-foreground">{file.modified}</p>
              )}
            </div>
            {renderPageSpecificInfo()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
