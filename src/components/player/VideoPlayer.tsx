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
      <ReactPlayer slot="media" src={url} controls={false} style={playerStyle} />;
      <MediaControlBar className="flex gap-3 p-2 bg-transparent [&>*]:bg-transparent [&>*]:border-0 [&>*]:shadow-none">
        <MediaPlayButton />
        <MediaSeekBackwardButton seekOffset={10} />
        <MediaSeekForwardButton seekOffset={10} />
        <MediaTimeRange />
        <MediaTimeDisplay style={{ background: "transparent" }} showDuration />
        <MediaMuteButton />
        <MediaVolumeRange />
        <MediaPlaybackRateButton />
        <MediaFullscreenButton />
      </MediaControlBar>

    </MediaController>
  );
}
