"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, Download, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { DocumentData } from "@/pages/documents-page"

interface DocumentCardProps {
  document: DocumentData
  index: number
}

export function DocumentCard({ document, index }: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
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

  // Simulate "loaded" after a brief moment (documents don't have visual loading like images/videos)
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
      onClick={handleOpen}
    >
      <div className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
        {/* Document Icon Container */}
        <div className="relative aspect-[4/3] bg-muted/50 overflow-hidden flex items-center justify-center">
          {!loaded ? (
            <Skeleton className="absolute inset-0 w-full h-full z-10" />
          ) : (
            <>
              <div className="flex flex-col items-center gap-3">
                <div className={`p-4 rounded-xl ${getExtensionColor(extension)}`}>
                  <FileText className="h-10 w-10" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${getExtensionColor(extension)}`}>
                  {extension}
                </span>
              </div>

              {/* Action Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-sm"
              >
                <div className="bg-white/90 dark:bg-white rounded-full p-3 shadow-lg" title="Open">
                  <ExternalLink className="h-5 w-5 text-slate-900" />
                </div>
                <div
                  className="bg-white/90 dark:bg-white rounded-full p-3 shadow-lg"
                  title="Download"
                  onClick={handleDownload}
                >
                  <Download className="h-5 w-5 text-slate-900" />
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Document Info */}
        <div className="p-3">
          {!loaded ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {docName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{document.formattedSize}</span>
                <span>•</span>
                <span>{document.formattedDate}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

