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
          {files.map((file, index) => (
            <FileListItem
              key={file.id}
              file={file}
              index={index}
              isSelected={selectedFiles.includes(file.id)}
              pageConfig={pageConfig}
              viewConfig={viewConfig}
              actionHandlers={actionHandlers}
            />
          ))}

        </div>
      </CardContent>
    </Card>
  );
}