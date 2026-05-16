"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { VideoCard } from "@/components/videos/VideoCard"
import { VideoListItem } from "@/components/videos/VideoListItem"
import { Button } from "@/components/ui/button"
import { Grid3x3, List, Heart, Trash2 } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { toast } from "sonner"
import { useLikedVideos, type LikedVideo } from "@/hooks/useLikedVideos"

type ViewMode = 'grid' | 'list'

export function LikedVideosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const { likedVideos, isLoading, error, loadLikedVideos, removeLikedVideo, clearLikedVideos } = useLikedVideos()

  const handleRemoveLikedVideo = async (videoKey: string) => {
    try {
      await removeLikedVideo(videoKey)
      toast.success("Video removed from liked videos")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to remove liked video")
    }
  }

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to remove all liked videos?")) {
      try {
        await clearLikedVideos()
        toast.success("All liked videos cleared")
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to clear liked videos")
      }
    }
  }

  const transformLikedVideo = (likedVideo: LikedVideo) => {
    return {
      ...likedVideo,
      formattedDate: formatRelativeTime(new Date(likedVideo.likedAt)),
    }
  }

  const transformedLikedVideos = useMemo(
    () => likedVideos.map(transformLikedVideo),
    [likedVideos]
  )

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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400 fill-current" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                  Liked Videos
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                  {likedVideos.length > 0
                    ? `${likedVideos.length} video${likedVideos.length !== 1 ? 's' : ''} you liked`
                    : "No liked videos yet"
                  }
                </p>
              </div>
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
              {likedVideos.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="shrink-0 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:border-red-800 dark:hover:border-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="w-full">
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
                onClick={() => void loadLikedVideos(true)}
                className="mt-2"
              >
                Retry
              </Button>
            </motion.div>
          )}

          {isLoading && likedVideos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
            </motion.div>
          ) : likedVideos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="text-6xl mb-4">{'<3'}</div>
              <h3 className="text-xl font-semibold mb-2">No liked videos yet</h3>
              <p className="text-muted-foreground mb-4">
                Start liking videos to see them here
              </p>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
              >
                Browse Videos
              </Button>
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
                    {transformedLikedVideos.map((video, index) => (
                      <div key={video.key} className="relative group">
                        <VideoCard
                          video={video}
                          index={index}
                        />
                        {/* Remove button overlay */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: 0,
                            scale: 0.8
                          }}
                          whileHover={{
                            opacity: 1,
                            scale: 1
                          }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-2 left-2 z-10"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleRemoveLikedVideo(video.key)
                            }}
                            className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-sm hover:bg-red-100 dark:hover:bg-red-900/80 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
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
                    {transformedLikedVideos.map((video, index) => (
                      <div key={video.key} className="relative group">
                        <VideoListItem
                          video={video}
                          index={index}
                        />
                        {/* Remove button */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{
                            opacity: 0,
                            x: 20
                          }}
                          whileHover={{
                            opacity: 1,
                            x: 0
                          }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleRemoveLikedVideo(video.key)
                            }}
                            className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-sm hover:bg-red-100 dark:hover:bg-red-900/80 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
