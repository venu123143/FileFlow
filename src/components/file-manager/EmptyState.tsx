import { motion } from "framer-motion";
import { FolderIcon } from "lucide-react";

interface EmptyStateProps {
  searchQuery: string;
}

export function EmptyState({ searchQuery }: EmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
      <FolderIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">No files found</h3>
      <p className="text-muted-foreground">
        {searchQuery ? "Try adjusting your search terms" : "This folder is empty"}
      </p>
    </motion.div>
  );
}
