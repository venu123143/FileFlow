import { useState, useEffect, useRef, useCallback } from 'react';
import { VideoPlayer } from './VideoPlayer';
import type { TextTrackOption } from './VideoPlayer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoName: string;
  poster?: string;
  textTracks?: TextTrackOption[];
  /** Remember playback position across opens (in-memory, resets on page refresh) */
  rememberPosition?: boolean;
  autoRotateOnFullscreen?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  videoName,
  poster,
  textTracks = [],
  rememberPosition = true,
  autoRotateOnFullscreen = true,
}: VideoPlayerModalProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const scrollRestoreRef = useRef<{ container: HTMLElement | null; y: number }>({
    container: null,
    y: 0,
  });
  const savedPositionRef = useRef<number>(0);
  const playerInstanceRef = useRef<any>(null);
  const wasOpenRef = useRef(false);

  // ── Scroll lock / restore ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      setStatus('loading');
      setErrorMsg(null);

      const main = document.querySelector('main') as HTMLElement | null;
      if (main) {
        scrollRestoreRef.current = { container: main, y: main.scrollTop };
        main.style.overflow = 'hidden';
      } else {
        scrollRestoreRef.current = { container: null, y: window.scrollY };
      }
      document.body.style.overflow = 'hidden';
    }

    if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      restoreScroll();
    }

    return () => {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        restoreScroll();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const restoreScroll = useCallback(() => {
    const { container, y } = scrollRestoreRef.current;
    document.body.style.overflow = '';

    // Use double-rAF + timeout to survive orientation changes
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setTimeout(() => {
          if (container) {
            container.style.overflow = '';
            container.scrollTop = y;
          } else {
            window.scrollTo(0, y);
          }
        }, 60)
      )
    );
  }, []);

  // ── Keyboard: Escape to close ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleReady = useCallback((player: any) => {
    playerInstanceRef.current = player;
    setStatus('ready');
    if (rememberPosition && savedPositionRef.current > 0) {
      player.currentTime(savedPositionRef.current);
    }
  }, [rememberPosition]);

  const handleTimeUpdate = useCallback((t: number) => {
    if (rememberPosition) savedPositionRef.current = t;
  }, [rememberPosition]);

  const handleError = useCallback((err: any) => {
    setStatus('error');
    setErrorMsg(err?.message ?? 'Failed to load video. Please try again.');
  }, []);

  const handleClose = useCallback(() => {
    restoreScroll();
    onClose();
  }, [restoreScroll, onClose]);

  const handleRetry = useCallback(() => {
    setStatus('loading');
    setErrorMsg(null);
    setRetryKey(k => k + 1);
  }, []);

  // ── Backdrop click closes modal ───────────────────────────────────────────
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={videoName}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 flex flex-col bg-black rounded-xl overflow-hidden shadow-2xl
                   w-[96vw] sm:w-[88vw] md:w-[78vw] lg:w-[68vw] xl:w-[58vw] max-w-5xl
                   animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-gray-950 to-gray-900 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Dot indicator */}
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${status === 'ready' ? 'bg-green-500' :
                status === 'error' ? 'bg-red-500' :
                  'bg-yellow-500 animate-pulse'
                }`}
            />
            <h2 className="text-white text-sm sm:text-base font-semibold truncate">
              {videoName}
            </h2>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* PiP button (desktop, if supported) */}
            {typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && (
              <button
                onClick={() => {
                  const p = playerInstanceRef.current;
                  if (!p) return;
                  const vid = p.el()?.querySelector('video') as HTMLVideoElement | undefined;
                  if (!vid) return;
                  if (document.pictureInPictureElement) {
                    document.exitPictureInPicture().catch(() => { });
                  } else {
                    vid.requestPictureInPicture().catch(() => { });
                  }
                }}
                title="Picture in Picture"
                className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                aria-label="Picture in Picture"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
                  <rect x="12" y="11" width="8" height="5" rx="1" strokeWidth={1.5} fill="currentColor" stroke="none" />
                </svg>
              </button>
            )}

            {/* Close */}
            <button
              onClick={handleClose}
              title="Close (Esc)"
              className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Video area ────────────────────────────────────────────────────── */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          {/* Loading spinner */}
          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-10 gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-red-500 animate-spin" />
                <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-red-400 animate-spin absolute top-2 left-2" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
              </div>
              <p className="text-gray-500 text-sm">Loading video…</p>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
              <div className="text-center px-6 max-w-xs">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white font-medium mb-1">Playback error</p>
                <p className="text-gray-400 text-sm mb-5">{errorMsg}</p>
                <button
                  onClick={handleRetry}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Player */}
          <VideoPlayer
            key={retryKey}
            url={videoUrl}
            poster={poster}
            controls
            autoplay={false}
            textTracks={textTracks}
            autoRotateOnFullscreen={autoRotateOnFullscreen}
            onReady={handleReady}
            onTimeUpdate={handleTimeUpdate}
            onError={handleError}
          />
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="px-4 py-2 bg-gray-950 border-t border-white/5 flex items-center justify-between flex-shrink-0">
          <p className="text-gray-600 text-xs hidden sm:block">
            Space/K&nbsp;·&nbsp;play &nbsp;|&nbsp; ←/→&nbsp;·&nbsp;{10}s &nbsp;|&nbsp; ↑/↓&nbsp;·&nbsp;volume &nbsp;|&nbsp; F&nbsp;·&nbsp;fullscreen &nbsp;|&nbsp; C&nbsp;·&nbsp;captions &nbsp;|&nbsp; M&nbsp;·&nbsp;mute
          </p>
          <p className="text-gray-600 text-xs sm:hidden">
            Double-tap to skip · Swipe up/down for volume
          </p>
          {rememberPosition && savedPositionRef.current > 0 && (
            <button
              onClick={() => {
                savedPositionRef.current = 0;
                playerInstanceRef.current?.currentTime(0);
              }}
              className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              Restart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerModal;