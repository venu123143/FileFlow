// Video file extensions
const VIDEO_EXTENSIONS = [
  '.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v',
  '.3gp', '.ogv', '.ts', '.m2ts', '.vob', '.asf', '.rm', '.rmvb'
];

// MIME types for video files
const VIDEO_MIME_TYPES = [
  'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo',
  'video/x-ms-wmv', 'video/webm', 'video/x-flv', 'video/3gpp',
  'video/x-ms-asf', 'video/ogg', 'video/x-matroska'
];

/**
 * Check if a file is a video based on its name or file type
 */
export function isVideoFile(file: { name: string; fileType?: string }): boolean {
  // Check by file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (VIDEO_EXTENSIONS.includes(extension)) {
    return true;
  }

  // Check by MIME type
  if (file.fileType && VIDEO_MIME_TYPES.includes(file.fileType.toLowerCase())) {
    return true;
  }

  // Check by fileType property (for our app's file system)
  if (file.fileType === 'video') {
    return true;
  }

  return false;
}

/**
 * Get video file URL - this would typically come from your file API
 * For now, we'll use a placeholder that you can replace with actual file URLs
 */
export function getVideoFileUrl(fileName: string): string {
  return `${import.meta.env.VITE_API_CDN_URL}/${fileName}`
}
