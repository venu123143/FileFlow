// Image file extensions
const IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.tif',
  '.ico', '.avif', '.heic', '.heif'
];

// MIME types for image files
const IMAGE_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
  'image/svg+xml', 'image/tiff', 'image/x-icon', 'image/avif',
  'image/heic', 'image/heif'
];

/**
 * Check if a file is an image based on its name or file type
 */
export function isImageFile(file: { name: string; fileType?: string }): boolean {
  // Check by file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (IMAGE_EXTENSIONS.includes(extension)) {
    return true;
  }

  // Check by MIME type
  if (file.fileType && IMAGE_MIME_TYPES.includes(file.fileType.toLowerCase())) {
    return true;
  }

  // Check by fileType property (for our app's file system)
  if (file.fileType === 'image') {
    return true;
  }

  return false;
}

/**
 * Get image file URL
 */
export function getImageFileUrl(fileName: string): string {
  return `${import.meta.env.VITE_API_CDN_URL}/${fileName}`;
}