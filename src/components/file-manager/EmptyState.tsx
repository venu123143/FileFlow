import { motion } from "framer-motion";
import { FolderIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  searchQuery: string;
  message?: string;
  icon?: LucideIcon;
}

export function EmptyState({ searchQuery, message, icon: CustomIcon }: EmptyStateProps) {
  const Icon = CustomIcon || FolderIcon;
  const defaultMessage = searchQuery ? "Try adjusting your search terms" : "This folder is empty";
  const displayMessage = message || defaultMessage;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">No files found</h3>
      <p className="text-muted-foreground">{displayMessage}</p>
    </motion.div>
  );
}
