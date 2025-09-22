import { useState } from "react";
import { VideoPlayer } from "./VideoPlayer";

// Modal Component with shadcn/ui
interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoName: string;
  poster?: string;
}

export function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  videoName,
  poster
}: VideoPlayerModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleReady = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = (err: any) => {
    setIsLoading(false);
    setError('Failed to load video. Please try again.');
    console.error('Video error:', err);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-[95vw] sm:w-[85vw] md:w-[75vw] lg:w-[65vw] xl:w-[55vw] max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black to-gray-900 border-b border-gray-800">
          <h2 className="text-white text-sm sm:text-base md:text-lg font-semibold truncate pr-4">
            {videoName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Video Container */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-white" />
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white text-lg mb-2">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          <VideoPlayer
            url={videoUrl}
            poster={poster}
            controls={true}
            autoplay={false}
            onReady={handleReady}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}