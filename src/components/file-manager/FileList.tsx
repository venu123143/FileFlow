import type { FileItem, PageConfig, ViewConfig, FileActionHandlers } from "@/types/file-manager";
import { Card, CardContent } from "@/components/ui/card";
import { FileListItem } from "./FileListItem";

interface FileListProps {
  files: FileItem[];
  selectedFiles: string[];
  pageConfig: PageConfig;
  viewConfig: ViewConfig;
  actionHandlers: FileActionHandlers;
}

export function FileList({ files, selectedFiles, pageConfig, viewConfig, actionHandlers }: FileListProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {files.map((file, index) => {
            // Use share_id if available (for shared files) to ensure unique keys
            const uniqueKey = 'share_id' in file && file.share_id ? `${file.id}-${file.share_id}` : file.id;
            return (
              <FileListItem
                key={uniqueKey}
                file={file}
                index={index}
                isSelected={selectedFiles.includes(file.id)}
                pageConfig={pageConfig}
                viewConfig={viewConfig}
                actionHandlers={actionHandlers}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}