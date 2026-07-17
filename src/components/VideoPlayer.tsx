import React from 'react';
import YouTube from 'react-youtube';

interface VideoPlayerProps {
  videoId: string;
  onReady: (event: any) => void;
  onStateChange: (event: any) => void;
  isPlayerLoading: boolean;
  videoUrl: string;
  onUrlChange: (url: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  onReady,
  onStateChange,
  isPlayerLoading,
  videoUrl,
  onUrlChange,
}) => {
  const [urlInput, setUrlInput] = React.useState(videoUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onUrlChange(urlInput.trim());
    }
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0, // Hide YouTube player controls
      rel: 0,
      showinfo: 0,
      disablekb: 1, // Disable YouTube shortcuts to prevent collisions
      modestbranding: 1,
      fs: 0, // Disable fullscreen button
    },
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste YouTube Video URL here..."
          className="flex-1 bg-brand-gray border border-brand-light-gray rounded-full px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-brand-green transition-colors"
        />
        <button
          type="submit"
          className="bg-brand-green hover:bg-emerald-500 text-black font-semibold text-sm px-6 py-2 rounded-full transition-all duration-200 cursor-pointer shadow-md hover:scale-105 active:scale-95"
        >
          Load
        </button>
      </form>

      {/* Video IFrame Container */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-brand-light-gray shadow-2xl [&>iframe]:w-full [&>iframe]:h-full [&>div]:w-full [&>div]:h-full">
        {isPlayerLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-gray z-10 gap-3">
            {/* Spinning skeleton loader */}
            <div className="w-12 h-12 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400 animate-pulse font-medium">Loading YouTube player...</p>
          </div>
        )}
        
        {videoId ? (
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-gray-400 gap-2">
            <span className="text-4xl">📺</span>
            <p className="font-semibold text-lg text-white">No Video Loaded</p>
            <p className="text-sm max-w-xs text-gray-500">Paste a valid YouTube link above to start practicing English Shadowing.</p>
          </div>
        )}
        
        {/* Floating Custom Controls overlay guide removed */}
      </div>
    </div>
  );
};
export default VideoPlayer;
