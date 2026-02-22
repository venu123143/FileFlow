"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Download, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DocumentData } from "@/pages/documents-page"

interface DocumentListItemProps {
  document: DocumentData
  index: number
}

export function DocumentListItem({ document, index }: DocumentListItemProps) {
  const [loaded, setLoaded] = useState(false)

  const docName = document.fileName
  const extension = docName.split('.').pop()?.toUpperCase() || 'FILE'

  // Determine color based on extension
  const getExtensionColor = (ext: string): string => {
    switch (ext.toLowerCase()) {
      case 'pdf': return 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
      case 'doc': case 'docx': return 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
      case 'xls': case 'xlsx': return 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400'
      case 'ppt': case 'pptx': return 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
      case 'txt': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
      case 'csv': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
      case 'zip': case 'rar': case '7z': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400'
      default: return 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
    }
  }

  const handleOpen = () => {
    window.open(document.cdnUrl, '_blank')
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(document.cdnUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = blobUrl
      link.download = docName
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  // Simulate "loaded" after a brief moment
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={handleOpen}
      className="group flex items-center gap-4 p-3 rounded-lg bg-card border hover:bg-muted/50 cursor-pointer transition-colors"
    >
      {/* Document Icon */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-muted/50">
        {!loaded ? (
          <Skeleton className="absolute inset-0 w-full h-full z-10" />
        ) : (
          <div className={`p-3 rounded-lg ${getExtensionColor(extension)}`}>
            <FileText className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {!loaded ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {docName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getExtensionColor(extension)}`}>
                {extension}
              </span>
              <span>{document.formattedSize}</span>
              <span>•</span>
              <span>{document.formattedDate}</span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {loaded && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={(e) => { e.stopPropagation(); handleOpen() }}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

