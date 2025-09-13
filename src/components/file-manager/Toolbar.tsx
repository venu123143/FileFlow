import { motion } from "framer-motion";
import { Search, SortDesc, SortAsc, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilesCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function Toolbar({ searchQuery, onSearchChange, selectedFilesCount, viewMode, onViewModeChange }: ToolbarProps) {
  const [sort, setSort] = useState<"ASC" | "DESC">("ASC")
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setSort(sort === "ASC" ? "DESC" : "ASC")} variant="outline" size="sm" className="shrink-0 bg-transparent">
          {
            sort === "ASC" ?
              <>
                <SortAsc className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sort</span>

              </> :
              <>
                <SortDesc className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sort</span>
              </>
          }
        </Button>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2">
        {selectedFilesCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedFilesCount} selected
          </Badge>
        )}
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="rounded-r-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
