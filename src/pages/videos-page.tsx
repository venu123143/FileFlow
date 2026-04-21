"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUpload } from "@/contexts/UploadContext"
import type { S3File } from "@/api/upload.api"
import { useInfiniteScroll } from "@/hooks/useIntersectionObserver"
import { VideoCard } from "@/components/videos/VideoCard"
import { VideoListItem } from "@/components/videos/VideoListItem"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Grid3x3, List } from "lucide-react"
import { formatFileSize, formatRelativeTime } from "@/lib/utils"
import { toast } from "sonner"

type ViewMode = 'grid' | 'list'

export interface VideoData extends S3File {
  fileName: string
  formattedSize: string
  formattedDate: string
}

export function VideosPage() {
  const { videos, getVideos, loadMoreVideos } = useUpload()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const hasInitialized = useRef(false)

  // Transform S3File to VideoData
  const transformVideo = useCallback((file: S3File): VideoData => {
    const fileName = file.key.split('/').pop() || file.key
    const lastModifiedDate = file.lastModified instanceof Date
      ? file.lastModified
      : new Date(file.lastModified)
    return {
      ...file,
      lastModified: lastModifiedDate,
      fileName,
      formattedSize: formatFileSize(file.size),
      formattedDate: formatRelativeTime(lastModifiedDate),
    }
  }, [])

  // Transform videos from context
  const transformedVideos = videos?.videos.map(transformVideo) || []
  const hasMore = videos?.pagination.hasMore || false
  const nextContinuationToken = videos?.pagination.nextContinuationToken || null

  // Load more videos handler
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextContinuationToken) return
    try {
      setLoadingMore(true)
      await loadMoreVideos()
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load more videos'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, loadingMore, nextContinuationToken, loadMoreVideos])

  // Infinite scroll
  const { ref: observerRef } = useInfiniteScroll({
    loadMore: handleLoadMore,
    hasMore,
    loading: loadingMore,
  })

  // Initial load - only fetch if no data exists
  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current) return
    hasInitialized.current = true

    const loadInitialVideos = async () => {
      try {
        setError(null)
        setIsInitialLoading(true)
        await getVideos(true) // Pass true to indicate initial load
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to load videos'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsInitialLoading(false)
      }
    }

    // Only fetch if we don't have videos data
    if (!videos || videos.videos.length === 0) {
      loadInitialVideos()
    }
  }, [videos, getVideos])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Videos
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
                Browse and watch your video collection
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="shrink-0"
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="shrink-0"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-6"
          >
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  setError(null)
                  await getVideos(true)
                } catch (err: any) {
                  const errorMessage = err?.message || 'Failed to load videos'
                  setError(errorMessage)
                  toast.error(errorMessage)
                }
              }}
              className="mt-2"
            >
              Retry
            </Button>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="w-full">
          {isInitialLoading && transformedVideos.length === 0 ? (
            <>
              {/* Loading Skeletons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-lg overflow-hidden border">
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : transformedVideos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">No videos found</h3>
              <p className="text-muted-foreground">
                Upload some videos to get started
              </p>
            </motion.div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {transformedVideos.map((video, index) => (
                      <VideoCard
                        key={video.key}
                        video={video}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <AnimatePresence mode="popLayout">
                    {transformedVideos.map((video, index) => (
                      <VideoListItem
                        key={video.key}
                        video={video}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Skeleton placeholders while loading more */}
              {loadingMore && (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={`skeleton-${i}`} className="bg-card rounded-lg overflow-hidden border shadow-sm">
                        <Skeleton className="aspect-video w-full" />
                        <div className="p-3 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={`skeleton-${i}`} className="flex items-center gap-4 p-3 rounded-lg bg-card border">
                        <Skeleton className="w-40 h-24 sm:w-48 sm:h-28 flex-shrink-0 rounded" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div
                  ref={observerRef}
                  className="h-1 w-full mt-8"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
