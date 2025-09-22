import { motion } from "framer-motion";
import { useState } from "react";
import { isDeletedFile, isPrivateFile, isSharedFile } from "@/types/file-manager";
import type { FileItem, PageConfig, ViewConfig, FileActionHandlers } from "@/types/file-manager";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayerModal } from "@/components/player/VideoPlayerModal";
import { isVideoFile, getVideoFileUrl } from "@/lib/video-utils";
import { MoreHorizontal, Download, Share2, Edit, Trash2, RotateCcw, Lock, Unlock, Users, Shield, Play, FolderOpen } from "lucide-react";

interface FileListItemProps {
  file: FileItem;
  index: number;
  isSelected: boolean;
  pageConfig: PageConfig;
  viewConfig: ViewConfig;
  actionHandlers: FileActionHandlers;
}

export function FileListItem({
  file,
  index,
  isSelected,
  pageConfig,
  viewConfig,
  actionHandlers
}: FileListItemProps) {
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  const {
    onFileSelect,
    onItemClick,
    onDownload,
    onShare,
    onRename,
    onDelete,
    onRestore,
    onEncrypt,
    onDecrypt,
    onCustomAction,
    onMove
  } = actionHandlers;

  const isVideo = isVideoFile(file);

  const handleItemClick = (file: FileItem, event: React.MouseEvent) => {
    // Only open video player if clicking directly on the file item, not on child elements
    if (event.target === event.currentTarget || (event.target as HTMLElement).closest('.file-item-content')) {
      if (isVideo) {
        setIsVideoPlayerOpen(true);
      } else {
        onItemClick(file);
      }
    }
  };

  const handleVideoPlayerClose = () => {
    setIsVideoPlayerOpen(false);
  };

  const { itemHeight } = viewConfig.list;

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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Deleted {file.deletedDate}</span>
              <span>•</span>
              <span>by {file.deletedBy}</span>
              <span>•</span>
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                {file.daysLeft} days left
              </Badge>
            </div>
          );
        }
        break;

      case "private":
        if (isPrivateFile(file)) {
          return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {pageConfig.showSize && <span>{file.size}</span>}
              {pageConfig.showSize && pageConfig.showModified && <span>•</span>}
              {pageConfig.showModified && <span>{file.modified}</span>}
              {file.encrypted && <Lock className="h-3 w-3 text-blue-500" />}
              {file.sensitive && <Shield className="h-3 w-3 text-red-500" />}
            </div>
          );
        }
        break;

      case "shared":
        if (isSharedFile(file)) {
          return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Shared by {file.sharedBy.name}</span>
              <span>•</span>
              <span>{file.sharedDate}</span>
              <span>•</span>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {file.permission}
              </Badge>
            </div>
          );
        }
        break;

      default:
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {pageConfig.showSize && <span>{file.size}</span>}
            {pageConfig.showSize && pageConfig.showModified && <span>•</span>}
            {pageConfig.showModified && <span>{file.modified}</span>}
            {pageConfig.showShared && file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
          </div>
        );
    }
  };

  const renderPageSpecificBadges = () => {
    switch (pageConfig.variant) {
      case "deleted":
        if (isDeletedFile(file)) {
          return (
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                {file.daysLeft} days left
              </Badge>
            </div>
          );
        }
        break;

      case "private":
        if (isPrivateFile(file)) {
          return (
            <div className="flex items-center gap-2 shrink-0">
              {file.encrypted && <Lock className="h-4 w-4 text-blue-500" />}
              {file.sensitive && <Shield className="h-4 w-4 text-red-500" />}
            </div>
          );
        }
        break;

      case "shared":
        if (isSharedFile(file)) {
          return (
            <div className="flex items-center gap-2 shrink-0">
              <Users className="h-4 w-4 text-blue-500" />
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {file.permission}
              </Badge>
            </div>
          );
        }
        break;

      default:
        return (
          <div className="flex items-center gap-2 shrink-0">
            {/* No badges for standard files */}
          </div>
        );
    }
  };

  return (
    <motion.div
      key={file.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={`flex items-center gap-3 p-2 sm:p-3 hover:bg-muted/50 transition-colors group cursor-pointer ${itemHeight}`}
      onClick={(e) => handleItemClick(file, e)}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onFileSelect(file.id)}
        onClick={(e) => e.stopPropagation()}
      />

      {pageConfig.showThumbnails && file.thumbnail ? (
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
          <img
            src={`${import.meta.env.VITE_API_CDN_URL}/${file.thumbnail}`}
            alt={file.name}
            className="w-full h-full object-cover"
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 relative">
          <file.icon className="h-4 w-4 text-muted-foreground" />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <Play className="h-2 w-2 text-white" />
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0 file-item-content">
        <p className="font-medium truncate text-sm whitespace-nowrap">{file.name}</p>
        {renderPageSpecificInfo()}
      </div>

      {renderPageSpecificBadges()}

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
          {isVideo && (
            <DropdownMenuItem onClick={() => setIsVideoPlayerOpen(true)}>
              <Play className="h-4 w-4 mr-2" />
              Play Video
            </DropdownMenuItem>
          )}
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
          {onMove && ( // Add move option for standard variant
            <DropdownMenuItem onClick={() => onMove(file)}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Move
            </DropdownMenuItem>
          )}
          {onRename && (
            <DropdownMenuItem onClick={() => onRename(file)}>
              <Edit className="h-4 w-4 mr-2" />
              Rename
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

      {/* Video Player Modal */}
      {isVideo && (
        <VideoPlayerModal
          isOpen={isVideoPlayerOpen}
          onClose={handleVideoPlayerClose}
          videoUrl={getVideoFileUrl(file.file_info?.storage_path || "")}
          videoName={file.name}
        />
      )}
    </motion.div>
  );
}