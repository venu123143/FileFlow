"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUpload } from "@/contexts/UploadContext"
import type { S3File } from "@/api/upload.api"
import { VideoCard } from "@/components/videos/VideoCard"
import { VideoListItem } from "@/components/videos/VideoListItem"
import { VideosSearchBar } from "@/components/videos/VideosSearchBar"
import { VideosFilters } from "@/components/videos/VideosFilters"
import { VideosSidebar } from "@/components/videos/VideosSidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Grid3x3, List, Loader2 } from "lucide-react"
import { formatFileSize, formatRelativeTime } from "@/lib/utils"
import { toast } from "sonner"

type ViewMode = 'grid' | 'list'
type SortOption = 'date-desc' | 'date-asc' | 'size-desc' | 'size-asc' | 'name-asc' | 'name-desc'
type Category = 'all' | 'recent' | 'large' | 'small'

export interface VideoData extends S3File {
  fileName: string
  formattedSize: string
  formattedDate: string
}

// Infinite scroll hook
const useInfiniteScroll = (loadMore: () => Promise<void>, hasMore: boolean, loadingMore: boolean) => {
  const observerRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)

  useEffect(() => {
    const target = observerRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (
          entry.isIntersecting &&
          hasMore &&
          !loadingMore &&
          !isLoadingRef.current
        ) {
          isLoadingRef.current = true
          Promise.resolve(loadMore()).finally(() => {
            isLoadingRef.current = false
          })
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px 0px',
      }
    )

    observer.observe(target)

    return () => {
      observer.unobserve(target)
      observer.disconnect()
    }
  }, [hasMore, loadingMore, loadMore])

  return observerRef
}

export function VideosPage() {
  const { getAllFiles } = useUpload()
  
  // State
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextContinuationToken, setNextContinuationToken] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>('date-desc')
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [error, setError] = useState<string | null>(null)

  // Transform S3File to VideoData
  const transformVideo = useCallback((file: S3File): VideoData => {
    const fileName = file.key.split('/').pop() || file.key
    // Ensure lastModified is a Date object
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

  // Initial load
  const loadVideos = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      const result = await getAllFiles({
        folder: 'videos',
        maxKeys: 24,
        continuationToken: isInitial ? undefined : nextContinuationToken || undefined,
      })

      const transformedVideos = result.files.map(transformVideo)

      if (isInitial) {
        setVideos(transformedVideos)
      } else {
        setVideos(prev => [...prev, ...transformedVideos])
      } 

      setHasMore(result.pagination.hasMore)
      setNextContinuationToken(result.pagination.nextContinuationToken)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load videos'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [getAllFiles, nextContinuationToken, transformVideo])

  // Load more videos
  const loadMoreVideos = useCallback(async () => {
    if (!hasMore || loadingMore || !nextContinuationToken) return
    await loadVideos(false)
  }, [hasMore, loadingMore, nextContinuationToken, loadVideos])

  // Infinite scroll
  const observerRef = useInfiniteScroll(loadMoreVideos, hasMore, loadingMore)

  // Initial load
  useEffect(() => {
    loadVideos(true)
  }, [])

  // Filter and sort videos
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = [...videos]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(video => 
        video.fileName.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory === 'recent') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      filtered = filtered.filter(video => 
        new Date(video.lastModified) >= sevenDaysAgo
      )
    } else if (selectedCategory === 'large') {
      filtered = filtered.filter(video => video.size > 100 * 1024 * 1024) // > 100MB
    } else if (selectedCategory === 'small') {
      filtered = filtered.filter(video => video.size < 10 * 1024 * 1024) // < 10MB
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        case 'date-asc':
          return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
        case 'size-desc':
          return b.size - a.size
        case 'size-asc':
          return a.size - b.size
        case 'name-asc':
          return a.fileName.localeCompare(b.fileName)
        case 'name-desc':
          return b.fileName.localeCompare(a.fileName)
        default:
          return 0
      }
    })

    return filtered
  }, [videos, searchQuery, selectedCategory, sortOption])

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

          {/* Search Bar */}
          <VideosSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Filters */}
          <VideosFilters
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
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
              onClick={() => loadVideos(true)}
              className="mt-2"
            >
              Retry
            </Button>
          </motion.div>
        )}

        {/* Category Tabs */}
        <VideosSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Main Content */}
        <div className="w-full">
            {loading && videos.length === 0 ? (
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
            ) : filteredAndSortedVideos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Upload some videos to get started'}
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
                      {filteredAndSortedVideos.map((video, index) => (
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
                      {filteredAndSortedVideos.map((video, index) => (
                        <VideoListItem
                          key={video.key}
                          video={video}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                  <div
                    ref={observerRef}
                    className="h-1 w-full mt-8"
                  />
                )}

                {/* Loading More Indicator */}
                {loadingMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-8"
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">Loading more videos...</span>
                  </motion.div>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  )
}

