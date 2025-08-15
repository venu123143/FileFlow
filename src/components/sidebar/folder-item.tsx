"use client"

import type React from "react"

import { ChevronRight, Folder, FolderOpen } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FileNode {
  id: string
  name: string
  type: "folder" | "file"
  extension?: string
  children?: FileNode[]
  size?: string
  modified?: string
}

interface FolderItemProps {
  folder: FileNode
  depth: number
  isExpanded: boolean
  onToggle: () => void
  renderChildren: () => React.ReactNode
}

export function FolderItem({ folder, depth, isExpanded, onToggle, renderChildren }: FolderItemProps) {
  return (
    <div>
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors group"
        style={{ paddingLeft: `${8 + depth * 16}px` } as React.CSSProperties}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        </motion.div>
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-blue-500" />
        ) : (
          <Folder className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground" />
        )}
        <span className="flex-1 text-left truncate">{folder.name}</span>
        {folder.children && <span className="text-xs text-muted-foreground">{folder.children.length}</span>}
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5">{renderChildren()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
