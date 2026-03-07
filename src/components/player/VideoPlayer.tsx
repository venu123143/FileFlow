import { useEffect, useRef, useCallback } from 'react';

// ─── Custom Styles ────────────────────────────────────────────────────────────
const customStyles = `
  .video-js {
    font-family: inherit;
    color: #fff;
  }

  .vjs-theme-custom {
    --vjs-theme-color: #ef4444;
  }

  /* Control bar */
  .video-js .vjs-control-bar {
    background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6), transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    height: 3em;
    transition: opacity 0.3s ease;
  }

  /* Big play button */
  .video-js .vjs-big-play-button {
    background-color: rgba(239, 68, 68, 0.85);
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 50%;
    font-size: 3em;
    height: 1.5em;
    width: 1.5em;
    line-height: 1.5em;
    margin-top: -0.75em;
    margin-left: -0.75em;
    transition: background-color 0.2s, transform 0.15s;
  }

  .video-js:hover .vjs-big-play-button,
  .video-js .vjs-big-play-button:focus {
    background-color: #ef4444;
    transform: scale(1.08);
  }

  /* Progress bar */
  .video-js .vjs-progress-holder .vjs-play-progress {
    background-color: #ef4444;
  }
  .video-js .vjs-progress-holder .vjs-play-progress::before {
    color: #ef4444;
  }
  .video-js .vjs-slider:focus {
    box-shadow: 0 0 0 2px rgba(239,68,68,0.5);
  }

  /* Volume */
  .video-js .vjs-volume-level {
    background-color: #ef4444;
  }
  .video-js .vjs-volume-level::before {
    color: #ef4444;
  }

  /* Timer always visible */
  .video-js .vjs-current-time,
  .video-js .vjs-duration {
    display: inline-block !important;
    padding: 0 0.5em;
  }
  .video-js .vjs-time-divider {
    display: inline-block !important;
    padding: 0 0.2em;
  }

  /* Buffered */
  .video-js .vjs-load-progress {
    background: rgba(255,255,255,0.25);
  }
  .video-js .vjs-load-progress div {
    background: rgba(255,255,255,0.15);
  }

  /* Skip indicator */
  .video-skip-indicator {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    padding: 8px 14px;
    border-radius: 8px;
    background: rgba(0,0,0,0.55);
    font-size: 1.1em;
    font-weight: bold;
    color: white;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
    pointer-events: none;
    z-index: 1000;
    animation: skipFadeOut 0.6s ease-out forwards;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .video-skip-indicator.left { left: 15%; }
  .video-skip-indicator.right { right: 15%; }

  @keyframes skipFadeOut {
    0%   { opacity: 1; transform: translateY(-50%) scale(1.1); }
    60%  { opacity: 1; transform: translateY(-50%) scale(1);   }
    100% { opacity: 0; transform: translateY(-50%) scale(0.95); }
  }

  /* Gesture zone ripple */
  .vjs-gesture-zone {
    position: absolute;
    top: 0; bottom: 0;
    width: 40%;
    pointer-events: none;
    z-index: 5;
  }
  .vjs-gesture-zone.left  { left: 0; }
  .vjs-gesture-zone.right { right: 0; }

  /* Volume OSD */
  .video-volume-osd {
    position: absolute;
    top: 12%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 8px;
    padding: 10px 18px;
    color: white;
    font-size: 0.95em;
    font-weight: 600;
    pointer-events: none;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 130px;
    animation: osdFadeOut 1.4s ease-out forwards;
  }
  .video-volume-osd .osd-bar {
    flex: 1;
    height: 4px;
    background: rgba(255,255,255,0.25);
    border-radius: 2px;
    overflow: hidden;
  }
  .video-volume-osd .osd-fill {
    height: 100%;
    background: #ef4444;
    border-radius: 2px;
    transition: width 0.1s;
  }

  @keyframes osdFadeOut {
    0%   { opacity: 1; }
    70%  { opacity: 1; }
    100% { opacity: 0; }
  }

  /* Keyboard shortcut toast */
  .video-shortcut-toast {
    position: absolute;
    bottom: 4em;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: white;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.85em;
    pointer-events: none;
    z-index: 1000;
    white-space: nowrap;
    animation: toastFade 1.2s ease-out forwards;
  }
  @keyframes toastFade {
    0%   { opacity: 0; transform: translateX(-50%) translateY(6px); }
    15%  { opacity: 1; transform: translateX(-50%) translateY(0);   }
    75%  { opacity: 1; }
    100% { opacity: 0; }
  }

  /* Landscape fullscreen */
  .video-js.vjs-fullscreen .vjs-control-bar {
    font-size: 18px;
    height: 3.5em;
  }

  /* Mobile */
  @media (max-width: 640px) {
    .video-js .vjs-control-bar { font-size: 13px; height: 2.5em; }
    .video-js .vjs-playback-rate,
    .video-js .vjs-picture-in-picture-control,
    .video-js .vjs-volume-panel { display: none; }
    .video-js .vjs-big-play-button { font-size: 2.5em; }
  }

  /* Tablet */
  @media (min-width: 641px) and (max-width: 1024px) {
    .video-js .vjs-playback-rate { display: none; }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TextTrackOption {
  src: string;
  srclang: string;
  label: string;
  default?: boolean;
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
}

export interface VideoPlayerProps {
  url: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  /** Skip seconds for double-tap / arrow keys (default: 10) */
  skipSeconds?: number;
  /** Subtitle / caption tracks */
  textTracks?: TextTrackOption[];
  /** Auto-rotate to landscape on fullscreen (mobile). Requires Permissions API support. */
  autoRotateOnFullscreen?: boolean;
  /** Called once the player is ready */
  onReady?: (player: any) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onError?: (error: any) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVideoType(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    m3u8: 'application/x-mpegURL',
    mpd: 'application/dash+xml',
  };
  return map[ext ?? ''] ?? 'video/mp4';
}

function injectStyles(id: string, css: string) {
  if (!document.getElementById(id)) {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }
}

function showOSD(
  playerEl: HTMLElement,
  type: 'skip' | 'volume' | 'toast',
  payload: { text: string; side?: 'left' | 'right'; pct?: number }
) {
  if (type === 'skip') {
    const existing = playerEl.querySelector('.video-skip-indicator');
    existing?.remove();
    const el = document.createElement('div');
    el.className = `video-skip-indicator ${payload.side ?? 'right'}`;
    el.textContent = payload.text;
    playerEl.appendChild(el);
    setTimeout(() => el.remove(), 650);
  } else if (type === 'volume') {
    const existing = playerEl.querySelector('.video-volume-osd');
    existing?.remove();
    const pct = Math.round((payload.pct ?? 0) * 100);
    const el = document.createElement('div');
    el.className = 'video-volume-osd';
    el.innerHTML = `<span>${pct === 0 ? '🔇' : pct < 50 ? '🔉' : '🔊'}</span>
      <div class="osd-bar"><div class="osd-fill" style="width:${pct}%"></div></div>
      <span style="min-width:32px;text-align:right">${pct}%</span>`;
    playerEl.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  } else if (type === 'toast') {
    const existing = playerEl.querySelector('.video-shortcut-toast');
    existing?.remove();
    const el = document.createElement('div');
    el.className = 'video-shortcut-toast';
    el.textContent = payload.text;
    playerEl.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VideoPlayer({
  url,
  poster,
  autoplay = false,
  muted = false,
  controls = true,
  loop = false,
  preload = 'auto',
  skipSeconds = 10,
  textTracks = [],
  autoRotateOnFullscreen = true,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  // Stable callback refs — avoids tearing down the player on every render
  const onReadyRef = useRef(onReady);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onEndedRef = useRef(onEnded);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onErrorRef = useRef(onError);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onPlayRef.current = onPlay; }, [onPlay]);
  useEffect(() => { onPauseRef.current = onPause; }, [onPause]);
  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);
  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate; }, [onTimeUpdate]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  // ── Orientation helpers ──────────────────────────────────────────────────
  const lockLandscape = useCallback(async () => {
    if (!autoRotateOnFullscreen) return;
    try {
      // Legacy webkit
      const so = screen as any;
      // Modern API
      if (so?.orientation?.lock) {
        await so.orientation.lock('landscape');
        return;
      }
      if (so.lockOrientation) { so.lockOrientation('landscape'); return; }
      if (so.mozLockOrientation) { so.mozLockOrientation('landscape'); return; }
      if (so.msLockOrientation) { so.msLockOrientation('landscape'); return; }
    } catch {
      // Permission denied or not supported — silently ignore
    }
  }, [autoRotateOnFullscreen]);

  const unlockOrientation = useCallback(() => {
    if (!autoRotateOnFullscreen) return;
    try {
      if (screen?.orientation?.unlock) { screen.orientation.unlock(); return; }
      const so = screen as any;
      if (so.unlockOrientation) { so.unlockOrientation(); return; }
      if (so.mozUnlockOrientation) { so.mozUnlockOrientation(); return; }
      if (so.msUnlockOrientation) { so.msUnlockOrientation(); return; }
    } catch { /* ignore */ }
  }, [autoRotateOnFullscreen]);

  // ── Player init (runs once per URL change) ───────────────────────────────
  useEffect(() => {
    let isMounted = true;
    cleanupRef.current = [];

    const init = async () => {
      try {
        const [videojs] = await Promise.all([
          import('video.js'),
          import('video.js/dist/video-js.css'),
        ]);
        if (!isMounted || !videoRef.current) return;

        injectStyles('vjs-custom-theme', customStyles);

        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null;
        }

        const player = videojs.default(videoRef.current, {
          autoplay,
          muted,
          controls,
          loop,
          preload,
          fluid: true,
          responsive: true,
          playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
          html5: {
            vhs: { overrideNative: true },
            nativeAudioTracks: false,
            nativeVideoTracks: false,
          },
          controlBar: {
            playToggle: { order: 0 },
            currentTimeDisplay: { order: 1 },
            timeDivider: { order: 2 },
            durationDisplay: { order: 3 },
            progressControl: { order: 4 },
            remainingTimeDisplay: false,
            playbackRateMenuButton: { order: 5 },
            volumePanel: { order: 6, inline: false },
            subsCapsButton: { order: 7 },
            pictureInPictureToggle: { order: 8 },
            fullscreenToggle: { order: 9 },
          },
        }, () => {
          if (!isMounted) return;
          onReadyRef.current?.(player);
        });

        player.addClass('vjs-theme-custom');

        // Set source
        player.src({ src: url, type: getVideoType(url) });
        if (poster) player.poster(poster);

        // Text tracks
        textTracks.forEach(t => {
          player.addRemoteTextTrack({
            src: t.src,
            srclang: t.srclang,
            label: t.label,
            kind: t.kind ?? 'subtitles',
            default: t.default ?? false,
          }, false);
        });

        // ── Event wiring ────────────────────────────────────────────────────
        player.on('play', () => onPlayRef.current?.());
        player.on('pause', () => onPauseRef.current?.());
        player.on('ended', () => onEndedRef.current?.());
        player.on('error', (e: any) => onErrorRef.current?.(e));
        player.on('timeupdate', () => {
          const t = player.currentTime();
          if (typeof t === 'number') onTimeUpdateRef.current?.(t);
        });

        // ── Fullscreen + orientation lock ───────────────────────────────────
        player.on('fullscreenchange', () => {
          if (player.isFullscreen()) {
            lockLandscape();
          } else {
            unlockOrientation();
          }
        });

        // ── Skip helper ─────────────────────────────────────────────────────
        const skip = (x: number, playerEl: HTMLElement) => {
          const rect = playerEl.getBoundingClientRect();
          const isLeft = (x - rect.left) < rect.width / 2;
          const ct = player.currentTime() as number;
          const dur = player.duration() as number;
          if (!isFinite(ct) || !isFinite(dur)) return;
          const newTime = isLeft
            ? Math.max(0, ct - skipSeconds)
            : Math.min(dur, ct + skipSeconds);
          player.currentTime(newTime);
          showOSD(playerEl, 'skip', {
            text: isLeft ? `⏪ ${skipSeconds}s` : `⏩ ${skipSeconds}s`,
            side: isLeft ? 'left' : 'right',
          });
        };

        // ── Double-click (desktop) ──────────────────────────────────────────
        const handleDblClick = (e: MouseEvent) => {
          const el = player.el() as HTMLElement;
          skip(e.clientX, el);
        };

        // ── Double-tap (mobile) ─────────────────────────────────────────────
        const tapState = { lastTime: 0, lastX: 0, lastY: 0, timer: 0 };
        const handleTouchStart = (e: TouchEvent) => {
          const el = player.el() as HTMLElement;
          const touch = e.touches[0];
          if (!touch) return;
          const now = Date.now();
          const dt = now - tapState.lastTime;
          const dx = Math.abs(touch.clientX - tapState.lastX);
          const dy = Math.abs(touch.clientY - tapState.lastY);
          if (dt < 300 && dx < 60 && dy < 60) {
            e.preventDefault();
            clearTimeout(tapState.timer);
            skip(touch.clientX, el);
            tapState.lastTime = 0;
          } else {
            tapState.lastTime = now;
            tapState.lastX = touch.clientX;
            tapState.lastY = touch.clientY;
            tapState.timer = window.setTimeout(() => { tapState.lastTime = 0; }, 310);
          }
        };

        // ── Vertical swipe → volume (mobile) ───────────────────────────────
        let swipeStartY = 0;
        let swipeStartVol = 0;
        let isSwiping = false;

        const handleTouchStartSwipe = (e: TouchEvent) => {
          if (e.touches.length !== 1) return;
          swipeStartY = e.touches[0].clientY;
          swipeStartVol = player.volume() as number;
          isSwiping = true;
        };

        const handleTouchMove = (e: TouchEvent) => {
          if (!isSwiping || e.touches.length !== 1) return;
          const dy = swipeStartY - e.touches[0].clientY;
          // 200px swipe = full volume range
          const delta = dy / 200;
          const newVol = Math.min(1, Math.max(0, swipeStartVol + delta));
          player.volume(newVol);
          player.muted(newVol === 0);
          const el = player.el() as HTMLElement;
          showOSD(el, 'volume', { text: '', pct: newVol });
        };

        const handleTouchEnd = () => { isSwiping = false; };

        // ── Keyboard shortcuts ──────────────────────────────────────────────
        const handleKeydown = (e: KeyboardEvent) => {
          const el = player.el() as HTMLElement;
          const ct = player.currentTime() as number;
          const dur = player.duration() as number;
          const vol = player.volume() as number;

          switch (e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              player.currentTime(Math.max(0, ct - skipSeconds));
              showOSD(el, 'skip', { text: `⏪ ${skipSeconds}s`, side: 'left' });
              break;
            case 'ArrowRight':
              e.preventDefault();
              player.currentTime(Math.min(isFinite(dur) ? dur : ct, ct + skipSeconds));
              showOSD(el, 'skip', { text: `⏩ ${skipSeconds}s`, side: 'right' });
              break;
            case 'ArrowUp':
              e.preventDefault();
              { const v = Math.min(1, vol + 0.1); player.volume(v); player.muted(false); showOSD(el, 'volume', { text: '', pct: v }); }
              break;
            case 'ArrowDown':
              e.preventDefault();
              { const v = Math.max(0, vol - 0.1); player.volume(v); player.muted(v === 0); showOSD(el, 'volume', { text: '', pct: v }); }
              break;
            case ' ':
            case 'k':
            case 'K':
              e.preventDefault();
              player.paused() ? player.play() : player.pause();
              showOSD(el, 'toast', { text: player.paused() ? '⏸ Paused' : '▶ Playing' });
              break;
            case 'f':
            case 'F':
              e.preventDefault();
              player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
              break;
            case 'm':
            case 'M':
              e.preventDefault();
              { const m = !player.muted(); player.muted(m); showOSD(el, 'volume', { text: '', pct: m ? 0 : vol }); }
              break;
            case 'Home':
              e.preventDefault();
              player.currentTime(0);
              break;
            case 'End':
              e.preventDefault();
              if (isFinite(dur)) player.currentTime(dur);
              break;
            case 'c':
            case 'C':
              // Toggle captions
              e.preventDefault();
              break;
            case '>':
              {
                const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
                const cur = player.playbackRate() as number;
                const next = rates[Math.min(rates.length - 1, rates.indexOf(cur) + 1)];
                player.playbackRate(next);
                showOSD(el, 'toast', { text: `Speed ${next}×` });
              } break;
            case '<':
              {
                const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
                const cur = player.playbackRate() as number;
                const prev = rates[Math.max(0, rates.indexOf(cur) - 1)];
                player.playbackRate(prev);
                showOSD(el, 'toast', { text: `Speed ${prev}×` });
              } break;
          }
        };

        const playerEl = player.el() as HTMLElement;
        playerEl.addEventListener('dblclick', handleDblClick);
        playerEl.addEventListener('touchstart', handleTouchStart, { passive: false });
        playerEl.addEventListener('touchstart', handleTouchStartSwipe, { passive: true });
        playerEl.addEventListener('touchmove', handleTouchMove, { passive: true });
        playerEl.addEventListener('touchend', handleTouchEnd, { passive: true });
        player.on('keydown', (e: any) => handleKeydown(e as KeyboardEvent));

        // ── Cleanup registration ────────────────────────────────────────────
        cleanupRef.current.push(() => {
          playerEl.removeEventListener('dblclick', handleDblClick);
          playerEl.removeEventListener('touchstart', handleTouchStart);
          playerEl.removeEventListener('touchstart', handleTouchStartSwipe);
          playerEl.removeEventListener('touchmove', handleTouchMove);
          playerEl.removeEventListener('touchend', handleTouchEnd);
          clearTimeout(tapState.timer);
        });

        playerRef.current = player;
      } catch (err) {
        console.error('[VideoPlayer] Failed to load video.js:', err);
        onErrorRef.current?.(err);
      }
    };

    init();

    return () => {
      isMounted = false;
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
      if (playerRef.current) {
        try { playerRef.current.dispose(); } catch { /* ignore */ }
        playerRef.current = null;
      }
      unlockOrientation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // Only re-initialize when URL changes

  // ── Update player options without reinit ────────────────────────────────────
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    if (poster) p.poster(poster);
  }, [poster]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    p.loop(loop);
  }, [loop]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    p.muted(muted);
  }, [muted]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
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

export default VideoPlayer;