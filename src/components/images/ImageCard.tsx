"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ZoomIn } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageViewer } from "@/components/custom/ImageViewer"
import type { ImageData } from "@/pages/images-page"

interface ImageCardProps {
  image: ImageData
  index: number
}

export function ImageCard({ image, index }: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const imageName = image.fileName

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group cursor-pointer"
        onClick={() => setIsViewerOpen(true)}
      >
        <div className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
          {/* Thumbnail Container */}
          <div className="relative aspect-square bg-muted overflow-hidden">
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 0.8
                }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              >
                <div className="bg-white/90 dark:bg-white rounded-full p-4 shadow-lg">
                  <ZoomIn className="h-8 w-8 text-slate-900" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Image Info */}
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

