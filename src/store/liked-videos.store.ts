import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VideoData } from '@/pages/videos-page'

const LIKED_VIDEOS_KEY = 'liked-videos'

export interface LikedVideo extends VideoData {
  likedAt: string
}

interface LikedVideosStore {
  likedVideos: LikedVideo[]
  isVideoLiked: (videoKey: string) => boolean
  toggleLike: (video: VideoData) => void
  removeLikedVideo: (videoKey: string) => void
  clearLikedVideos: () => void
}

function isLikedVideo(value: unknown): value is LikedVideo {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'key' in value &&
      typeof (value as { key: unknown }).key === 'string' &&
      'fileName' in value &&
      typeof (value as { fileName: unknown }).fileName === 'string' &&
      'cdnUrl' in value &&
      typeof (value as { cdnUrl: unknown }).cdnUrl === 'string' &&
      'likedAt' in value &&
      typeof (value as { likedAt: unknown }).likedAt === 'string'
  )
}

function sortLikedVideos(videos: LikedVideo[]) {
  return [...videos].sort(
    (a, b) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()
  )
}

function normalizeLikedVideos(value: unknown): LikedVideo[] {
  if (!Array.isArray(value)) {
    return []
  }

  return sortLikedVideos(value.filter(isLikedVideo))
}

export const useLikedVideosStore = create<LikedVideosStore>()(
  persist(
    (set, get) => ({
      likedVideos: [],
      isVideoLiked: (videoKey: string) =>
        get().likedVideos.some(likedVideo => likedVideo.key === videoKey),
      toggleLike: (video: VideoData) => {
        set(state => {
          const isLiked = state.likedVideos.some(likedVideo => likedVideo.key === video.key)

          if (isLiked) {
            return {
              likedVideos: state.likedVideos.filter(likedVideo => likedVideo.key !== video.key),
            }
          }

          const likedVideo: LikedVideo = {
            ...video,
            likedAt: new Date().toISOString(),
          }

          return {
            likedVideos: sortLikedVideos([...state.likedVideos, likedVideo]),
          }
        })
      },
      removeLikedVideo: (videoKey: string) => {
        set(state => ({
          likedVideos: state.likedVideos.filter(likedVideo => likedVideo.key !== videoKey),
        }))
      },
      clearLikedVideos: () => {
        set({ likedVideos: [] })
      },
    }),
    {
      name: LIKED_VIDEOS_KEY,
      partialize: state => ({ likedVideos: state.likedVideos }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        likedVideos:
          persistedState && typeof persistedState === 'object' && 'likedVideos' in persistedState
            ? normalizeLikedVideos((persistedState as { likedVideos?: unknown }).likedVideos)
            : [],
      }),
    }
  )
)

let hasInitializedLikedVideosStoreSync = false

export function initializeLikedVideosStoreSync() {
  if (hasInitializedLikedVideosStoreSync || typeof window === 'undefined') {
    return
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LIKED_VIDEOS_KEY) {
      void useLikedVideosStore.persist.rehydrate()
    }
  }

  window.addEventListener('storage', handleStorage)
  hasInitializedLikedVideosStoreSync = true
}
