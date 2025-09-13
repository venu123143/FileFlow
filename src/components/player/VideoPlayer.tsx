import ReactPlayer from "react-player";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaMuteButton,
  MediaFullscreenButton,
} from "media-chrome/react";
import type { CSSProperties } from "react";

const playerStyle: CSSProperties & Record<string, any> = {
  width: "100%",
  height: "100%",
  "--controls": "none",
};

export default function Player({ url }: { url: string }) {
  return (
    <MediaController
      style={{
        width: "100%",
        aspectRatio: "16/9",
      }}>
      <ReactPlayer slot="media" src={url} controls={false} style={playerStyle} />
      {/* Mobile-optimized control bar with responsive layout */}
      <MediaControlBar className="flex flex-wrap gap-1 sm:gap-2 md:gap-3 p-1 sm:p-2 bg-transparent [&>*]:bg-transparent [&>*]:border-0 [&>*]:shadow-none">
        {/* Primary controls - always visible */}
        <div className="flex items-center gap-1 sm:gap-2">
          <MediaPlayButton className="w-8 h-8 sm:w-10 sm:h-10" />
          <MediaSeekBackwardButton seekOffset={10} className="w-8 h-8 sm:w-10 sm:h-10" />
          <MediaSeekForwardButton seekOffset={10} className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        {/* Time range - takes available space */}
        <MediaTimeRange className="flex-1 min-w-0 mx-1 sm:mx-2" />

        {/* Time display - hide on very small screens */}
        <MediaTimeDisplay
          style={{ background: "transparent" }}
          showDuration
          className="hidden xs:block text-xs sm:text-sm whitespace-nowrap"
        />

        {/* Secondary controls - responsive layout */}
        <div className="flex items-center gap-1 sm:gap-2">
          <MediaMuteButton className="w-8 h-8 sm:w-10 sm:h-10" />

          {/* Volume range - hide on mobile, show on larger screens */}
          <MediaVolumeRange className="hidden sm:block w-16 md:w-20" />

          {/* Playback rate - hide on small screens */}
          <MediaPlaybackRateButton className="hidden md:block w-8 h-8 md:w-10 md:h-10" />

          <MediaFullscreenButton className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
      </MediaControlBar>
    </MediaController>
  );
}