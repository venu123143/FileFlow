"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUpload } from "@/contexts/UploadContext"
import type { S3File } from "@/api/upload.api"
import { useInfiniteScroll } from "@/hooks/useIntersectionObserver"
import { ImageCard } from "@/components/images/ImageCard"
import { ImageListItem } from "@/components/images/ImageListItem"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Grid3x3, List } from "lucide-react"
import { formatFileSize, formatRelativeTime } from "@/lib/utils"
import { toast } from "sonner"

type ViewMode = 'grid' | 'list'

export interface ImageData extends S3File {
  fileName: string
  formattedSize: string
  formattedDate: string
}

interface ImagesState {
  images: ImageData[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  nextContinuationToken: string | null
  viewMode: ViewMode
  error: string | null
}

const initialState: ImagesState = {
  images: [],
  loading: true,
  loadingMore: false,
  hasMore: false,
  nextContinuationToken: null,
  viewMode: 'grid',
  error: null,
}

export function ImagesPage() {
  const { getAllFiles } = useUpload()

  const [state, setState] = useState<ImagesState>(initialState)
  const { images, loading, loadingMore, hasMore, nextContinuationToken, viewMode, error } = state

  // Transform S3File to ImageData
  const transformImage = useCallback((file: S3File): ImageData => {
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

  // Load images
  const loadImages = useCallback(async (isInitial = false) => {
    try {
      setState(prev => ({
        ...prev,
        ...(isInitial
          ? { loading: true, error: null }
          : { loadingMore: true }),
      }))

      const result = await getAllFiles({
        folder: 'files',
        maxKeys: 24,
        continuationToken: isInitial ? undefined : nextContinuationToken || undefined,
      })

      const transformedImages = result.files.map(transformImage)

      setState(prev => ({
        ...prev,
        images: isInitial ? transformedImages : [...prev.images, ...transformedImages],
        hasMore: result.pagination.hasMore,
        nextContinuationToken: result.pagination.nextContinuationToken,
        loading: false,
        loadingMore: false,
      }))
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load images'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        loadingMore: false,
      }))
      toast.error(errorMessage)
    }
  }, [getAllFiles, nextContinuationToken, transformImage])

  // Load more images
  const loadMoreImages = useCallback(async () => {
    if (!hasMore || loadingMore || !nextContinuationToken) return
    await loadImages(false)
  }, [hasMore, loadingMore, nextContinuationToken, loadImages])

  // Infinite scroll
  const { ref: observerRef } = useInfiniteScroll({
    loadMore: loadMoreImages,
    hasMore,
    loading: loadingMore,
  })

  // Initial load
  useEffect(() => {
    loadImages(true)
  }, [])

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
                Images
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
                Browse and view your image collection
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                className="shrink-0"
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
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
              onClick={() => loadImages(true)}
              className="mt-2"
            >
              Retry
            </Button>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="w-full">
          {loading && images.length === 0 ? (
            <>
              {/* Loading Skeletons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-lg overflow-hidden border">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : images.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold mb-2">No images found</h3>
              <p className="text-muted-foreground">
                Upload some images to get started
              </p>
            </motion.div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {images.map((image, index) => (
                      <ImageCard
                        key={image.key}
                        image={image}
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
                    {images.map((image, index) => (
                      <ImageListItem
                        key={image.key}
                        image={image}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Skeleton placeholders while loading more */}
              {loadingMore && (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={`skeleton-${i}`} className="bg-card rounded-lg overflow-hidden border shadow-sm">
                        <Skeleton className="aspect-square w-full" />
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
                        <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded" />
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

