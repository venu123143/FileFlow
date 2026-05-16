import { create } from 'zustand'
import type { VideoData } from '@/pages/videos-page'
import favoriteApi, { type FavoriteRecord } from '@/api/favorite.api'
import type { FileSystemNode } from '@/types/file.types'

export interface LikedVideo extends VideoData {
  favoriteId: string
  fileId: string
  likedAt: string
}

interface LikedVideosStore {
  likedVideos: LikedVideo[]
  isLoading: boolean
  hasLoaded: boolean
  error: string | null
  isVideoLiked: (videoKey: string) => boolean
  loadLikedVideos: (force?: boolean) => Promise<void>
  toggleLike: (video: VideoData) => Promise<void>
  removeLikedVideo: (videoKey: string) => Promise<void>
  clearLikedVideos: () => Promise<void>
}

function sortLikedVideos(videos: LikedVideo[]) {
  return [...videos].sort(
    (a, b) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()
  )
}

function isVideoFile(file?: FileSystemNode) {
  const fileType = file?.file_info?.file_type || ''
  const storagePath = file?.file_info?.storage_path || ''
  return fileType.startsWith('video/') || storagePath.startsWith('videos/')
}

function getCdnUrl(storagePath: string) {
  const baseUrl = import.meta.env.VITE_API_CDN_URL || ''
  return baseUrl ? `${baseUrl}/${storagePath}` : storagePath
}

function favoriteToLikedVideo(favorite: FavoriteRecord): LikedVideo | null {
  const file = favorite.file
  const storagePath = file?.file_info?.storage_path

  if (!file || !storagePath || !isVideoFile(file)) {
    return null
  }

  return {
    key: storagePath,
    size: file.file_info?.file_size ?? 0,
    lastModified: new Date(file.updated_at || file.created_at),
    etag: favorite.id,
    cdnUrl: getCdnUrl(storagePath),
    fileName: file.name || storagePath.split('/').pop() || storagePath,
    formattedSize: '',
    formattedDate: '',
    duration: file.file_info?.duration ?? undefined,
    favoriteId: favorite.id,
    fileId: favorite.file_id,
    likedAt: favorite.created_at,
  }
}

export const useLikedVideosStore = create<LikedVideosStore>()((set, get) => ({
  likedVideos: [],
  isLoading: false,
  hasLoaded: false,
  error: null,
  isVideoLiked: (videoKey: string) =>
    get().likedVideos.some(likedVideo => likedVideo.key === videoKey),
  loadLikedVideos: async (force = false) => {
    if (get().isLoading || (get().hasLoaded && !force)) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const favorites = await favoriteApi.getAllFavorites({ limit: 100, sortBy: 'created_at', sortOrder: 'DESC' })
      const likedVideos = sortLikedVideos(
        favorites
          .map(favoriteToLikedVideo)
          .filter((video): video is LikedVideo => Boolean(video))
      )

      set({ likedVideos, isLoading: false, hasLoaded: true })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || error?.message || 'Failed to load liked videos',
      })
    }
  },
  toggleLike: async (video: VideoData) => {
    const existingFavorite = get().likedVideos.find(likedVideo => likedVideo.key === video.key)

    if (existingFavorite) {
      await favoriteApi.deleteFavorite(existingFavorite.favoriteId)
      set(state => ({
        likedVideos: state.likedVideos.filter(likedVideo => likedVideo.key !== video.key),
      }))
      return
    }

    const favorite = await favoriteApi.createFavorite({ storage_path: video.key })
    const likedVideo = favoriteToLikedVideo(favorite) || {
      ...video,
      favoriteId: favorite.id,
      fileId: favorite.file_id,
      likedAt: favorite.created_at,
    }

    set(state => ({
      likedVideos: sortLikedVideos([...state.likedVideos, likedVideo]),
    }))
  },
  removeLikedVideo: async (videoKey: string) => {
    const existingFavorite = get().likedVideos.find(likedVideo => likedVideo.key === videoKey)
    if (!existingFavorite) {
      return
    }

    await favoriteApi.deleteFavorite(existingFavorite.favoriteId)
    set(state => ({
      likedVideos: state.likedVideos.filter(likedVideo => likedVideo.key !== videoKey),
    }))
  },
  clearLikedVideos: async () => {
    const favorites = get().likedVideos
    await Promise.all(favorites.map(favorite => favoriteApi.deleteFavorite(favorite.favoriteId)))
    set({ likedVideos: [] })
  },
}))
