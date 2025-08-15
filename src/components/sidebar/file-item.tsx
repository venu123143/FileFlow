"use client"

import { File, FileText, ImageIcon, Code, FileSpreadsheet, Presentation, Archive } from "lucide-react"
import { motion } from "framer-motion"

interface FileNode {
  id: string
  name: string
  type: "folder" | "file"
  extension?: string
  children?: FileNode[]
  size?: string
  modified?: string
}

interface FileItemProps {
  file: FileNode
  depth: number
}

const getFileIcon = (extension?: string) => {
  if (!extension) return File

  switch (extension.toLowerCase()) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return ImageIcon
    case "tsx":
    case "ts":
    case "js":
    case "jsx":
    case "css":
    case "html":
    case "dart":
      return Code
    case "pdf":
    case "doc":
    case "docx":
    case "txt":
      return FileText
    case "xls":
    case "xlsx":
    case "csv":
      return FileSpreadsheet
    case "ppt":
    case "pptx":
      return Presentation
    case "zip":
    case "rar":
    case "tar":
      return Archive
    default:
      return File
  }
}

const getFileColor = (extension?: string) => {
  if (!extension) return "text-muted-foreground"

  switch (extension.toLowerCase()) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return "text-green-500"
    case "tsx":
    case "ts":
      return "text-blue-500"
    case "js":
    case "jsx":
      return "text-yellow-500"
    case "css":
      return "text-purple-500"
    case "html":
      return "text-orange-500"
    case "pdf":
      return "text-red-500"
    case "doc":
    case "docx":
      return "text-blue-600"
    case "xls":
    case "xlsx":
      return "text-green-600"
    case "ppt":
    case "pptx":
      return "text-orange-600"
    default:
      return "text-muted-foreground"
  }
}

export function FileItem({ file, depth }: FileItemProps) {
  const IconComponent = getFileIcon(file.extension)
  const iconColor = getFileColor(file.extension)

  return (
    <motion.div
      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors cursor-pointer group"
      style={{ paddingLeft: `${24 + depth * 16}px` } as React.CSSProperties}
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
    >
      <IconComponent className={`w-4 h-4 ${iconColor}`} />
      <span className="flex-1 text-left truncate group-hover:text-sidebar-accent-foreground">{file.name}</span>
      {file.size && (
        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {file.size}
        </span>
      )}
    </motion.div>
  )
}
