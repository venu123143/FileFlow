"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ZoomIn } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageViewer } from "@/components/custom/ImageViewer"
import type { ImageData } from "@/pages/images-page"

interface ImageListItemProps {
  image: ImageData
  index: number
}

export function ImageListItem({ image, index }: ImageListItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const imageName = image.fileName

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsViewerOpen(true)}
        className="group flex items-center gap-4 p-3 rounded-lg bg-card border hover:bg-muted/50 cursor-pointer transition-colors"
      >
        {/* Thumbnail */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded overflow-hidden bg-muted">
          {/* Skeleton shimmer until image loads */}
          {!loaded && (
            <Skeleton className="absolute inset-0 w-full h-full z-10" />
          )}

          <img
            src={image.cdnUrl}
            alt={imageName}
            className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
          />

          {/* Zoom Overlay - only show after loaded */}
          {loaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <div className="bg-white/90 dark:bg-white rounded-full p-2 shadow-lg">
                <ZoomIn className="h-5 w-5 text-slate-900" />
              </div>
            </motion.div>
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
                {imageName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{image.formattedSize}</span>
                <span>•</span>
                <span>{image.formattedDate}</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        imageUrl={image.cdnUrl}
        imageName={imageName}
      />
    </>
  )
}

