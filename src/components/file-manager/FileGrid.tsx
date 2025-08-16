import type { FileItem } from "@/types/file-manager";
import { FileGridItem } from "./FileGridItem";

interface FileGridProps {
    files: FileItem[];
    selectedFiles: string[];
    onFileSelect: (fileId: string) => void;
    onItemClick: (item: FileItem) => void;
}

export function FileGrid({ files, selectedFiles, onFileSelect, onItemClick }: FileGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {files.map((file, index) => (
                <FileGridItem
                    key={file.id}
                    file={file}
                    index={index}
                    isSelected={selectedFiles.includes(file.id)}
                    onFileSelect={onFileSelect}
                    onItemClick={onItemClick}
                />
            ))}
        </div>
    );
}
