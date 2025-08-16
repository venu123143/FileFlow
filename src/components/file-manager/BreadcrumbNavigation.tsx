import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/custom/breadcrumb";

interface BreadcrumbNavigationProps {
  currentPath: string[];
  onNavigate: (index: number) => void;
}

export function BreadcrumbNavigation({ currentPath, onNavigate }: BreadcrumbNavigationProps) {
  if (currentPath.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-muted/50 rounded-lg p-3"
    >
      <Breadcrumb path={currentPath} onNavigate={onNavigate} />
    </motion.div>
  );
}
