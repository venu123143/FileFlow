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

interface VideoListItemProps {
  video: VideoData
  index: number
}

export function VideoListItem({ video, index }: VideoListItemProps) {
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

        {/* Like Button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeClick}
            className={`h-8 w-8 p-0 rounded-full transition-colors ${
              isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
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
