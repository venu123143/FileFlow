"use client"

import { useEffect } from 'react'
import { useLikedVideosStore } from '@/store/liked-videos.store'

export type { LikedVideo } from '@/store/liked-videos.store'

export function useLikedVideos() {
  const likedVideos = useLikedVideosStore(state => state.likedVideos)
  const isLoading = useLikedVideosStore(state => state.isLoading)
  const error = useLikedVideosStore(state => state.error)
  const loadLikedVideos = useLikedVideosStore(state => state.loadLikedVideos)
  const isVideoLiked = useLikedVideosStore(state => state.isVideoLiked)
  const toggleLike = useLikedVideosStore(state => state.toggleLike)
  const removeLikedVideo = useLikedVideosStore(state => state.removeLikedVideo)
  const clearLikedVideos = useLikedVideosStore(state => state.clearLikedVideos)

  useEffect(() => {
    void loadLikedVideos()
  }, [loadLikedVideos])

  return {
    likedVideos,
    isLoading,
    error,
    loadLikedVideos,
    isVideoLiked,
    toggleLike,
    removeLikedVideo,
    clearLikedVideos,
  }
}
