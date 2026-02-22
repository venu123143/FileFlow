"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoPlayerModal } from "@/components/player/VideoPlayerModal"
import type { VideoData } from "@/pages/videos-page"

interface VideoCardProps {
  video: VideoData
  index: number
}

export function VideoCard({ video, index }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoName = video.fileName

  // Check if video has already loaded metadata when component mounts
  useEffect(() => {
    if (videoRef.current) {
      // readyState >= 2 means HAVE_CURRENT_DATA (metadata is loaded)
      if (videoRef.current.readyState >= 2) {
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group cursor-pointer"
        onClick={() => setIsPlayerOpen(true)}
      >
        <div className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
          {/* Thumbnail Container */}
          <div className="relative aspect-video bg-muted overflow-hidden">
            {/* Skeleton shimmer until video loads */}

            {/* Video Thumbnail - Using CDN URL as poster/thumbnail */}
            <video
              ref={videoRef}
              width="300"
              muted
              preload="metadata"
              onLoadedData={() => setLoaded(true)}
              onLoadedMetadata={() => setLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            >
              <source src={video.cdnUrl} type="video/mp4" />
            </video>
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 items-center justify-center hidden">
              <Play className="h-12 w-12 text-slate-400 dark:text-slate-500" />
            </div>
            {!loaded && (
              <Skeleton className="absolute inset-0 w-full h-full z-10" />
            )}
            {/* Play Button Overlay - only show after loaded */}
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
                  <Play className="h-8 w-8 text-slate-900 fill-slate-900" />
                </div>
              </motion.div>
            )}

            {/* Duration Badge */}
            {loaded && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration() || '--:--'}</span>
              </div>
            )}
          </div>

          {/* Video Info */}
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
