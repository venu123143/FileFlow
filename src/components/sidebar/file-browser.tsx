"use client"

import { useState } from "react"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { FileItem } from "./file-item"
import { FolderItem } from "./folder-item"

interface FileNode {
  id: string
  name: string
  type: "folder" | "file"
  extension?: string
  children?: FileNode[]
  size?: string
  modified?: string
}

const fileStructure: FileNode[] = [
  {
    id: "sophie",
    name: "Sophie's files",
    type: "folder",
    children: [
      {
        id: "sophie-1",
        name: "Profile Photos",
        type: "folder",
        children: [
          { id: "sophie-1-1", name: "headshot-2024.jpg", type: "file", extension: "jpg", size: "2.4 MB" },
          { id: "sophie-1-2", name: "team-photo.png", type: "file", extension: "png", size: "1.8 MB" },
        ],
      },
      {
        id: "sophie-2",
        name: "Documents",
        type: "folder",
        children: [
          { id: "sophie-2-1", name: "resume.pdf", type: "file", extension: "pdf", size: "245 KB" },
          { id: "sophie-2-2", name: "contract.docx", type: "file", extension: "docx", size: "89 KB" },
        ],
      },
      { id: "sophie-3", name: "presentation.pptx", type: "file", extension: "pptx", size: "12.3 MB" },
    ],
  },
  {
    id: "dashboard",
    name: "Dashboard UI",
    type: "folder",
    children: [
      {
        id: "dash-1",
        name: "Components",
        type: "folder",
        children: [
          { id: "dash-1-1", name: "sidebar.tsx", type: "file", extension: "tsx", size: "4.2 KB" },
          { id: "dash-1-2", name: "header.tsx", type: "file", extension: "tsx", size: "2.1 KB" },
        ],
      },
      {
        id: "dash-2",
        name: "Assets",
        type: "folder",
        children: [
          { id: "dash-2-1", name: "logo.svg", type: "file", extension: "svg", size: "1.2 KB" },
          { id: "dash-2-2", name: "icons.png", type: "file", extension: "png", size: "856 KB" },
        ],
      },
      { id: "dash-3", name: "styles.css", type: "file", extension: "css", size: "15.7 KB" },
    ],
  },
  {
    id: "websites",
    name: "Websites",
    type: "folder",
    children: [
      {
        id: "web-1",
        name: "Portfolio",
        type: "folder",
        children: [
          { id: "web-1-1", name: "index.html", type: "file", extension: "html", size: "3.4 KB" },
          { id: "web-1-2", name: "style.css", type: "file", extension: "css", size: "8.9 KB" },
        ],
      },
      {
        id: "web-2",
        name: "Landing Pages",
        type: "folder",
        children: [
          { id: "web-2-1", name: "saas-landing.html", type: "file", extension: "html", size: "12.1 KB" },
          { id: "web-2-2", name: "product-page.html", type: "file", extension: "html", size: "9.7 KB" },
        ],
      },
    ],
  },
  {
    id: "mobile",
    name: "Mobile apps",
    type: "folder",
    children: [
      {
        id: "mob-1",
        name: "React Native",
        type: "folder",
        children: [
          { id: "mob-1-1", name: "App.tsx", type: "file", extension: "tsx", size: "6.8 KB" },
          { id: "mob-1-2", name: "package.json", type: "file", extension: "json", size: "2.3 KB" },
        ],
      },
      {
        id: "mob-2",
        name: "Flutter",
        type: "folder",
        children: [
          { id: "mob-2-1", name: "main.dart", type: "file", extension: "dart", size: "4.1 KB" },
          { id: "mob-2-2", name: "pubspec.yaml", type: "file", extension: "yaml", size: "1.8 KB" },
        ],
      },
    ],
  },
]

export function FileBrowser() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isMainExpanded, setIsMainExpanded] = useState(true)

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFileNode = (node: FileNode, depth = 0) => {
    if (node.type === "folder") {
      return (
        <FolderItem
          key={node.id}
          folder={node}
          depth={depth}
          isExpanded={expandedFolders.has(node.id)}
          onToggle={() => toggleFolder(node.id)}
          renderChildren={() => node.children?.map((child) => renderFileNode(child, depth + 1))}
        />
      )
    } else {
      return <FileItem key={node.id} file={node} depth={depth} />
    }
  }

  return (
    <div className="px-4 pb-4  ">
      <div className="border-t border-sidebar-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">FILE BROWSER</span>
          <button className="text-muted-foreground hover:text-sidebar-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <motion.button
          onClick={() => setIsMainExpanded(!isMainExpanded)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <motion.div animate={{ rotate: isMainExpanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
          <span>Folders</span>
        </motion.button>

        <AnimatePresence>
          {isMainExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-2 mt-1 space-y-0.5">{fileStructure.map((node) => renderFileNode(node, 0))}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
