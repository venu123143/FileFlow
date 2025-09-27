import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  showDownload?: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  showDownload = true
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '=':
        case '+':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRotate();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.25, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.25, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Touch event handlers for mobile gestures
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches as unknown as TouchList));
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches as unknown as TouchList);
      if (lastTouchDistance > 0) {
        const ratio = currentDistance / lastTouchDistance;
        setScale(prev => Math.min(Math.max(prev * ratio, 0.1), 5));
      }
      setLastTouchDistance(currentDistance);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Header Controls */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <h2 className="text-white font-medium truncate text-sm sm:text-base max-w-32 sm:max-w-md">
              {imageName}
            </h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Hide zoom controls on mobile, show on tablets and up */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-white hover:bg-white/20 hover:text-white cursor-pointer w-8 h-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-white hover:bg-white/20 hover:text-white cursor-pointer w-8 h-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {/* Show rotate on mobile and up */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 hover:text-white cursor-pointer w-8 h-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleRotate();
              }}
            >
              <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            {/* Hide fullscreen on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-white hover:bg-white/20 hover:text-white cursor-pointer w-8 h-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            {/* Hide download on mobile */}
            {showDownload && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-white hover:bg-white/20 hover:text-white cursor-pointer w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            {/* Always show close button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 hover:text-white cursor-pointer w-8 h-8 p-0"
              onClick={onClose}
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Image Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative flex items-center justify-center w-full h-full p-4 sm:p-8 md:p-16"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        // style={{
        //   cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        //   touchAction: 'none' // Prevent default touch behaviors
        // }}
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent" />
            </div>
          )}

          {imageError && (
            <div className="text-white text-center">
              <p className="text-lg mb-2">Failed to load image</p>
              <p className="text-sm text-gray-300">Please try again or check the image URL</p>
            </div>
          )}

          <img
            src={imageUrl}
            alt={imageName}
            className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-pointer"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center'
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            onDoubleClick={handleReset}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </motion.div>

        {/* Bottom Controls */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1 sm:py-2 flex items-center gap-2 sm:gap-4 text-white text-xs sm:text-sm">
            {/* Mobile zoom controls */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden text-white hover:bg-white/20 hover:text-white cursor-pointer h-5 w-5 p-0"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>

            <span className="hidden sm:inline">Zoom: {Math.round(scale * 100)}%</span>
            <span className="sm:hidden">{Math.round(scale * 100)}%</span>

            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden text-white hover:bg-white/20 hover:text-white cursor-pointer h-5 w-5 p-0"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>

            <span className="hidden sm:inline">Rotation: {rotation}°</span>
            <span className="sm:hidden">{rotation}°</span>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 hover:text-white cursor-pointer h-5 sm:h-6 px-1 sm:px-2 text-xs"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </motion.div>

        {/* Keyboard Shortcuts Hint - Hide on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="hidden sm:block absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-10 text-white/70 text-xs space-y-1"
        >
          <div>ESC: Close</div>
          <div>+/-: Zoom</div>
          <div>R: Rotate</div>
          <div>F: Fullscreen</div>
          <div>Double-click: Reset</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};