# Video Player Components

This folder contains custom video player components built with `react-player`.

## Components

### SimpleVideoPlayer
A fully-featured video player component with custom controls.

### VideoPlayerDemo
A demo component showcasing the video player with interactive controls.

## Installation

The video player uses `react-player` library which is already installed:

```bash
npm install react-player
```

## Usage

### Basic Usage

```tsx
import { SimpleVideoPlayer } from '@/components/player';

function MyComponent() {
  return (
    <SimpleVideoPlayer
      url="https://example.com/video.mp4"
      width="100%"
      height="400px"
      controls={true}
      playing={false}
    />
  );
}
```

### Advanced Usage with Ref

```tsx
import { useRef } from 'react';
import { SimpleVideoPlayer } from '@/components/player';

function MyComponent() {
  const playerRef = useRef(null);

  const handleSeekTo = (seconds: number) => {
    playerRef.current?.seekTo(seconds, 'seconds');
  };

  const handleGetCurrentTime = () => {
    const currentTime = playerRef.current?.getCurrentTime();
    console.log('Current time:', currentTime);
  };

  return (
    <div>
      <SimpleVideoPlayer
        ref={playerRef}
        url="https://example.com/video.mp4"
        width="100%"
        height="400px"
        controls={true}
        playing={false}
        onPlay={() => console.log('Video started playing')}
        onPause={() => console.log('Video paused')}
        onEnded={() => console.log('Video ended')}
        onProgress={(progress) => {
          console.log('Progress:', progress.played * 100, '%');
        }}
      />
      
      <button onClick={() => handleSeekTo(30)}>
        Seek to 30 seconds
      </button>
      
      <button onClick={handleGetCurrentTime}>
        Get Current Time
      </button>
    </div>
  );
}
```

## Props

### SimpleVideoPlayer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | - | Video URL (required) |
| `width` | `string \| number` | `'100%'` | Player width |
| `height` | `string \| number` | `'auto'` | Player height |
| `controls` | `boolean` | `true` | Show custom controls |
| `playing` | `boolean` | `false` | Auto-play video |
| `volume` | `number` | `1` | Volume (0-1) |
| `muted` | `boolean` | `false` | Mute video |
| `loop` | `boolean` | `false` | Loop video |
| `onReady` | `() => void` | - | Called when player is ready |
| `onStart` | `() => void` | - | Called when video starts |
| `onPlay` | `() => void` | - | Called when video plays |
| `onPause` | `() => void` | - | Called when video pauses |
| `onEnded` | `() => void` | - | Called when video ends |
| `onError` | `(error: any) => void` | - | Called on error |
| `onProgress` | `(progress: object) => void` | - | Called on progress update |
| `onDuration` | `(duration: number) => void` | - | Called when duration is available |
| `className` | `string` | - | Additional CSS classes |
| `style` | `React.CSSProperties` | - | Inline styles |

## Ref Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `seekTo` | `(amount: number, type?: 'seconds' \| 'fraction')` | Seek to specific time |
| `getCurrentTime` | `()` | Get current playback time |
| `getSecondsLoaded` | `()` | Get loaded seconds |
| `getDuration` | `()` | Get total duration |
| `getInternalPlayer` | `()` | Get internal player instance |

## Supported Video Formats

The player supports various video formats and platforms:

- **Local files**: MP4, WebM, OGG
- **YouTube**: YouTube video URLs
- **Vimeo**: Vimeo video URLs
- **Streaming**: HLS, DASH, and other streaming formats

## Demo

Visit `/video-player` route to see the interactive demo with all features.

## Features

- ✅ Custom controls UI
- ✅ Play/Pause functionality
- ✅ Volume control with mute
- ✅ Progress bar with seeking
- ✅ Time display
- ✅ Fullscreen support
- ✅ Loop functionality
- ✅ Keyboard shortcuts
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Ref forwarding for external control
