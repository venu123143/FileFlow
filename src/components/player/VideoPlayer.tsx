import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Custom Video.js theme styles
const customStyles = `
  .video-js {
    font-family: inherit;
    color: #fff;
  }
  
  .vjs-theme-custom {
    --vjs-theme-color: #ef4444;
  }
  
  .video-js .vjs-control-bar {
    background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.7), transparent);
    backdrop-filter: blur(10px);
    height: 3em;
  }
  
  .video-js .vjs-big-play-button {
    background-color: rgba(239, 68, 68, 0.8);
    border: none;
    border-radius: 50%;
    font-size: 3em;
    height: 1.5em;
    width: 1.5em;
    line-height: 1.5em;
    margin-top: -0.75em;
    margin-left: -0.75em;
  }
  
  .video-js:hover .vjs-big-play-button,
  .video-js .vjs-big-play-button:focus {
    background-color: rgba(239, 68, 68, 1);
  }
  
  .video-js .vjs-progress-holder .vjs-play-progress {
    background-color: #ef4444;
  }
  
  .video-js .vjs-volume-level {
    background-color: #ef4444;
  }
  
  /* Mobile optimizations */
  @media (max-width: 640px) {
    .video-js .vjs-control-bar {
      font-size: 14px;
      height: 2.5em;
    }
    
    .video-js .vjs-current-time,
    .video-js .vjs-duration {
      display: block;
      padding: 0 0.3em;
    }
    
    .video-js .vjs-time-divider {
      display: block;
      min-width: 0.5em;
      padding: 0;
    }
    
    .video-js .vjs-playback-rate {
      display: none;
    }
    
    .video-js .vjs-volume-panel {
      display: none;
    }
    
    .video-js .vjs-picture-in-picture-control {
      display: none;
    }
    
    .video-js .vjs-big-play-button {
      font-size: 2.5em;
    }
  }
  
  /* Tablet optimizations */
  @media (min-width: 641px) and (max-width: 1024px) {
    .video-js .vjs-control-bar {
      font-size: 16px;
    }
    
    .video-js .vjs-playback-rate {
      display: none;
    }
  }
  
  /* Fullscreen mode */
  .video-js.vjs-fullscreen .vjs-control-bar {
    font-size: 18px;
    height: 3.5em;
  }
`;

interface VideoPlayerProps {
  url: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
}

export function VideoPlayer({
  url,
  poster,
  autoplay = false,
  muted = false,
  controls = true,
  loop = false,
  preload = 'auto',
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Add custom styles to document
    if (!document.getElementById('video-js-custom-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'video-js-custom-styles';
      styleElement.textContent = customStyles;
      document.head.appendChild(styleElement);
    }

    if (!playerRef.current && videoRef.current) {
      // Initialize Video.js
      const player = videojs(videoRef.current, {
        autoplay,
        muted,
        controls,
        loop,
        preload,
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        controlBar: {
          playToggle: { order: 0 },
          currentTimeDisplay: { order: 1 },
          timeDivider: { order: 2 },
          durationDisplay: { order: 3 },
          progressControl: { order: 4 },
          remainingTimeDisplay: false,
          playbackRateMenuButton: {
            order: 5,
            playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2]
          },
          volumePanel: {
            order: 6,
            inline: false
          },
          pictureInPictureToggle: { order: 7 },
          fullscreenToggle: { order: 8 }
        },
        userActions: {
          hotkeys: true,
          click: true,
          doubleClick: true
        }
      }, () => {
        if (onReady) onReady();
      });

      player.addClass('vjs-theme-custom');

      // Set video source
      player.src({
        src: url,
        type: getVideoType(url)
      });

      if (poster) {
        player.poster(poster);
      }

      // Event listeners
      player.on('play', () => {
        if (onPlay) onPlay();
      });

      player.on('pause', () => {
        if (onPause) onPause();
      });

      player.on('ended', () => {
        if (onEnded) onEnded();
      });

      player.on('error', (error: any) => {
        console.error('Video error:', error);
        if (onError) onError(error);
      });

      // Keyboard shortcuts
      player.on('keydown', (e: any) => {
        const event = e as KeyboardEvent;
        const currentTime = player.currentTime();
        const duration = player.duration();

        switch (event.key) {
          case 'ArrowLeft':
            if (typeof currentTime === 'number') {
              player.currentTime(Math.max(0, currentTime - 10));
            }
            break;
          case 'ArrowRight':
            if (typeof currentTime === 'number') {
              player.currentTime(Math.min(typeof duration === 'number' ? duration : 0, currentTime + 10));
            }
            break;
          case 'ArrowUp':
            event.preventDefault();
            break;
          case 'ArrowDown':
            event.preventDefault();
            break;
          case ' ':
            event.preventDefault();
            if (player.paused()) {
              player.play();
            } else {
              player.pause();
            }
            break;
          case 'f':
          case 'F':
            event.preventDefault();
            if (!player.isFullscreen()) {
              player.requestFullscreen();
            } else {
              player.exitFullscreen();
            }
            break;
          case 'm':
          case 'M':
            event.preventDefault();
            player.muted(!player.muted());
            break;
        }
      });

      playerRef.current = player;
    }

    // Update source if URL changes
    if (playerRef.current && url) {
      playerRef.current.src({
        src: url,
        type: getVideoType(url)
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [url, autoplay, muted, controls, loop, preload, poster]);

  // Helper function to determine video type
  function getVideoType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'ogg':
      case 'ogv':
        return 'video/ogg';
      case 'm3u8':
        return 'application/x-mpegURL';
      default:
        return 'video/mp4';
    }
  }

  return (
    <div ref={containerRef} className="video-player-container" style={{ width: '100%', height: '100%' }}>
      <div data-vjs-player style={{ width: '100%', height: '100%' }}>
        <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-big-play-centered"
          playsInline
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

// Default export for compatibility
export default VideoPlayer;