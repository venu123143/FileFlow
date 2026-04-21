"use client"

import { useEffect } from 'react'
import {
  initializeLikedVideosStoreSync,
  useLikedVideosStore,
} from '@/store/liked-videos.store'

export type { LikedVideo } from '@/store/liked-videos.store'

export function useLikedVideos() {
  const likedVideos = useLikedVideosStore(state => state.likedVideos)
  const isVideoLiked = useLikedVideosStore(state => state.isVideoLiked)
  const toggleLike = useLikedVideosStore(state => state.toggleLike)
  const removeLikedVideo = useLikedVideosStore(state => state.removeLikedVideo)
  const clearLikedVideos = useLikedVideosStore(state => state.clearLikedVideos)

  useEffect(() => {
    initializeLikedVideosStoreSync()
  }, [])

  return {
    likedVideos,
    isVideoLiked,
    toggleLike,
    removeLikedVideo,
    clearLikedVideos,
  }
}
