import type { FileItem } from "@/types/file-manager";
import { Card, CardContent } from "@/components/ui/card";
import { FileListItem } from "./FileListItem";

interface FileListProps {
    files: FileItem[];
    selectedFiles: string[];
    onFileSelect: (fileId: string) => void;
    onItemClick: (item: FileItem) => void;
}

export function FileList({ files, selectedFiles, onFileSelect, onItemClick }: FileListProps) {
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
                            onFileSelect={onFileSelect}
                            onItemClick={onItemClick}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}