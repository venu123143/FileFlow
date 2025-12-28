import { useCallback } from 'react';
import { toast } from 'sonner';
import type { FileItem } from '@/types/file-manager';

/**
 * Custom hook for downloading files with proper naming and toast notifications
 * 
 * Features:
 * - Downloads files with timestamp-based naming (originalName_12345.ext)
 * - Shows toast notifications for folders (cannot be downloaded)
 * - Handles file download errors gracefully
 * - Works with CDN URLs from environment variables
 */
export const useFileDownload = () => {
  /**
   * Downloads a file with a timestamped filename
   * @param file - FileItem to download
   * @returns Promise<void>
   */
  const downloadFile = useCallback(async (file: FileItem): Promise<void> => {
    try {
      // Check if it's a folder
      if (file.type === 'folder') {
        toast.info('Cannot download folders', {
          description: 'Please download files individually from within the folder.',
          duration: 4000,
        });
        return;
      }

      // Check if file has storage path
      if (!file.file_info?.storage_path) {
        toast.error('Download failed', {
          description: 'File path not found. Please try again.',
          duration: 4000,
        });
        return;
      }

      // Generate timestamp (first 5 digits)
      const timestamp = Date.now().toString().slice(0, 5);

      // Extract file name and extension
      const fileName = file.name;
      const lastDotIndex = fileName.lastIndexOf('.');

      let nameWithoutExt: string;
      let extension: string;

      if (lastDotIndex !== -1) {
        nameWithoutExt = fileName.substring(0, lastDotIndex);
        extension = fileName.substring(lastDotIndex);
      } else {
        nameWithoutExt = fileName;
        extension = '';
      }

      // Create download filename with timestamp
      const downloadFileName = `${nameWithoutExt}_${timestamp}${extension}`;

      // Construct file URL
      const fileUrl = `${import.meta.env.VITE_API_CDN_URL}/${file.file_info.storage_path}`;

      // Show loading toast
      const loadingToast = toast.loading('Downloading...', {
        description: `Preparing ${file.name}`,
      });

      try {
        // Try to fetch the file (this works if CORS is properly configured)
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get blob from response
        const blob = await response.blob();

        // Create temporary download link
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = downloadFileName;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Download started', {
          description: `${downloadFileName}`,
          duration: 3000,
        });

      } catch (fetchError: any) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // If fetch fails (likely due to CORS), use direct download method
        console.warn('Fetch download failed, using direct download method:', fetchError);

        // Create a link element for direct download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = downloadFileName;
        link.target = '_blank'; // Fallback: open in new tab if download attribute doesn't work

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message (with note about browser download)
        toast.success('Download started', {
          description: `${file.name} - Check your browser's download folder`,
          duration: 4000,
        });
      }

    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Download failed', {
        description: error?.message || 'An error occurred while downloading the file. Please try again.',
        duration: 4000,
      });
    }
  }, []);

  /**
   * Downloads multiple files sequentially
   * @param files - Array of FileItems to download
   */
  const downloadMultipleFiles = useCallback(async (files: FileItem[]): Promise<void> => {
    // Filter out folders
    const downloadableFiles = files.filter(file => file.type === 'file');
    const folderCount = files.length - downloadableFiles.length;

    if (folderCount > 0) {
      toast.info(`Skipping ${folderCount} folder${folderCount > 1 ? 's' : ''}`, {
        description: 'Only files can be downloaded. Folders will be skipped.',
        duration: 4000,
      });
    }

    if (downloadableFiles.length === 0) {
      toast.error('No files to download', {
        description: 'Please select at least one file.',
        duration: 3000,
      });
      return;
    }

    toast.info(`Downloading ${downloadableFiles.length} file${downloadableFiles.length > 1 ? 's' : ''}`, {
      description: 'Your downloads will start shortly.',
      duration: 3000,
    });

    // Download files sequentially with a small delay to avoid overwhelming the browser
    for (let i = 0; i < downloadableFiles.length; i++) {
      await downloadFile(downloadableFiles[i]);

      // Add small delay between downloads (except for the last one)
      if (i < downloadableFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }, [downloadFile]);

  return {
    downloadFile,
    downloadMultipleFiles,
  };
};

