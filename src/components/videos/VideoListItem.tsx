"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoPlayerModal } from "@/components/player/VideoPlayerModal"
import type { VideoData } from "@/pages/videos-page"

interface VideoListItemProps {
  video: VideoData
  index: number
}

export function VideoListItem({ video, index }: VideoListItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const videoName = video.fileName

  // Check if image has already loaded when component mounts
  useEffect(() => {
    if (imgRef.current) {
      // If image is already loaded (cached by browser), set loaded to true
      if (imgRef.current.complete && imgRef.current.naturalHeight !== 0) {
        setLoaded(true)
      }
    }
  }, [])

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return ""
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsPlayerOpen(true)}
        className="group flex items-center gap-4 p-3 rounded-lg bg-card border hover:bg-muted/50 cursor-pointer transition-colors">
        {/* Thumbnail */}
        <div className="relative w-40 h-24 sm:w-48 sm:h-28 flex-shrink-0 rounded overflow-hidden bg-muted">
          {/* Skeleton shimmer until image loads */}
          {!loaded && (
            <Skeleton className="absolute inset-0 w-full h-full z-10" />
          )}

          <img
            ref={imgRef}
            src={video.cdnUrl}
            alt={videoName}
            className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              setLoaded(true)
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const placeholder = target.nextElementSibling as HTMLElement;
              if (placeholder) {
                placeholder.classList.remove('hidden');
                placeholder.classList.add('flex');
              }
            }}
          />
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 items-center justify-center hidden">
            <Play className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>

          {/* Play Overlay - only show after loaded */}
          {loaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <div className="bg-white/90 dark:bg-white rounded-full p-2 shadow-lg">
                <Play className="h-5 w-5 text-slate-900 fill-slate-900" />
              </div>
            </motion.div>
          )}

          {/* Duration Badge */}
          {loaded && (
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              <span>{formatDuration() || '--:--'}</span>
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
                {videoName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{video.formattedSize}</span>
                <span>•</span>
                <span>{video.formattedDate}</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        videoUrl={video.cdnUrl}
        videoName={videoName}
      />
    </>
  )
}
