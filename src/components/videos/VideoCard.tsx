"use client"

import { useState, useRef, useEffect, lazy, Suspense } from "react"
import { motion } from "framer-motion"
import { Play, Clock, Heart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { VideoData } from "@/pages/videos-page"
import { useLikedVideos } from "@/hooks/useLikedVideos"

// Lazy load VideoPlayerModal to avoid bundling video.js until needed
const VideoPlayerModal = lazy(() => import("@/components/player/VideoPlayerModal").then(module => ({ default: module.VideoPlayerModal })))

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
  const [duration, setDuration] = useState<number | null>(
    video.duration ?? null
  )
  const { isVideoLiked, toggleLike } = useLikedVideos()
  const isLiked = isVideoLiked(video.key)
  // Check if video has already loaded metadata when component mounts
  useEffect(() => {
    if (videoRef.current) {
      // readyState >= 2 means HAVE_CURRENT_DATA (metadata is loaded)
      if (videoRef.current.readyState >= 2) {
        setLoaded(true)
      }
    }
  }, [])

  const formatDuration = (): string => {
    const seconds = duration;
    if (!seconds) return ""
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleLike(video)
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
              playsInline
              onLoadedData={() => setLoaded(true)}
              onLoadedMetadata={(e) => {
                const duration = e.currentTarget.duration;
                setDuration(duration);
                setLoaded(true)
              }}
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

            {/* Like Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8
              }}
              transition={{ duration: 0.2 }}
              className="absolute top-2 right-2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                className={`h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-sm hover:bg-white dark:hover:bg-black/90 transition-colors ${
                  isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </motion.div>
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

      {/* Video Player Modal - Lazy loaded */}
      {isPlayerOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-white" />
          </div>
        }>
          <VideoPlayerModal
            isOpen={isPlayerOpen}
            onClose={() => setIsPlayerOpen(false)}
            videoUrl={video.cdnUrl}
            videoName={videoName}
          />
        </Suspense>
      )}
    </>
  )
}
