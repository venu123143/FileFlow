import type { FileItem, PageConfig, ViewConfig, FileActionHandlers } from "@/types/file-manager";
import { FileGridItem } from "./FileGridItem";
import { AddNewFolder } from "./AddNewFolder";

interface FileGridProps {
  files: FileItem[];
  selectedFiles: string[];
  pageConfig: PageConfig;
  viewConfig: ViewConfig;
  actionHandlers: FileActionHandlers;
  onCreateFolder?: (folderName: string) => void;
}

export function FileGrid({ files, selectedFiles, pageConfig, viewConfig, actionHandlers, onCreateFolder }: FileGridProps) {
  const { columns, gap, itemHeight } = viewConfig.grid;
  
  // Use proper Tailwind classes instead of dynamic strings
  const getGridColsClass = () => {
    const smCols = columns.sm;
    const mdCols = columns.md;
    const lgCols = columns.lg;
    const xlCols = columns.xl;
    const twoXlCols = columns["2xl"];
    
    // Map to actual Tailwind classes
    const colMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2", 
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
      9: "grid-cols-9",
      10: "grid-cols-10",
      11: "grid-cols-11",
      12: "grid-cols-12"
    };
    
    return `${colMap[smCols] || 'grid-cols-2'} ${colMap[mdCols] || 'sm:grid-cols-3'} ${colMap[lgCols] || 'md:grid-cols-4'} ${colMap[xlCols] || 'lg:grid-cols-5'} ${colMap[twoXlCols] || '2xl:grid-cols-6'}`;
  };
  
  const getGapClass = () => {
    // Map gap values to actual Tailwind classes
    const gapMap: Record<string, string> = {
      "gap-2": "gap-2",
      "gap-3": "gap-3", 
      "gap-4": "gap-4",
      "gap-5": "gap-5",
      "gap-6": "gap-6",
      "gap-8": "gap-8",
      "gap-10": "gap-10",
      "gap-12": "gap-12"
    };
    
    return gapMap[gap] || "gap-4";
  };
  
  return (
    <div className={`grid ${getGridColsClass()} ${getGapClass()} ${itemHeight ? itemHeight : ''}`}>
      {files.map((file, index) => (
        <FileGridItem
          key={file.id}
          file={file}
          index={index}
          isSelected={selectedFiles.includes(file.id)}
          pageConfig={pageConfig}
          actionHandlers={actionHandlers}
        />
      ))}
      {onCreateFolder && <AddNewFolder onAddFolder={onCreateFolder} variant="card" />}
    </div>
  );
}
