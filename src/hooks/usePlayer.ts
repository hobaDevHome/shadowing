import { useState, useEffect, useRef, useCallback } from 'react';

// Extract YouTube ID from various YouTube URL formats
export function extractYouTubeId(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

export function usePlayer(initialUrl: string = 'https://www.youtube.com/watch?v=0kG3n41vX38') {
  const [videoUrl, setVideoUrlState] = useState<string>(initialUrl);
  const [videoId, setVideoId] = useState<string>(extractYouTubeId(initialUrl));
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1);
  const [isPlayerLoading, setIsPlayerLoading] = useState<boolean>(true);

  // Keep a reference to the YT player instance
  const playerRef = useRef<any>(null);
  const timeUpdateInterval = useRef<number | null>(null);

  // Set the video URL and extract ID
  const setVideoUrl = useCallback((url: string) => {
    setVideoUrlState(url);
    const id = extractYouTubeId(url);
    if (id) {
      setVideoId(id);
      setIsPlayerLoading(true);
    }
  }, []);

  // Update current time from YouTube Player
  const updateTime = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      const time = playerRef.current.getCurrentTime();
      setCurrentTime(time);
    }
  }, []);

  // Set up interval for reading time when playing
  useEffect(() => {
    if (isPlaying) {
      updateTime(); // immediately update
      timeUpdateInterval.current = window.setInterval(updateTime, 100);
    } else {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
      updateTime(); // ensure time is accurate when pausing
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, [isPlaying, updateTime]);

  const onPlayerReady = useCallback((event: any) => {
    playerRef.current = event.target;
    setIsPlayerLoading(false);
    
    // Set initial speed
    playerRef.current.setPlaybackRate(playbackSpeed);
    
    // Fetch duration
    if (typeof playerRef.current.getDuration === 'function') {
      setDuration(playerRef.current.getDuration());
    }
    updateTime();
  }, [playbackSpeed, updateTime]);

  const onPlayerStateChange = useCallback((event: any) => {
    const state = event.data;
    // YT.PlayerState.PLAYING = 1
    // YT.PlayerState.PAUSED = 2
    // YT.PlayerState.ENDED = 0
    // YT.PlayerState.BUFFERING = 3
    if (state === 1) {
      setIsPlaying(true);
      if (typeof playerRef.current?.getDuration === 'function') {
        setDuration(playerRef.current.getDuration());
      }
    } else {
      setIsPlaying(false);
    }
    updateTime();
  }, [updateTime]);

  const play = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo();
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      playerRef.current.setPlaybackRate(speed);
    }
  }, []);

  return {
    videoUrl,
    videoId,
    setVideoUrl,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    isPlayerLoading,
    onPlayerReady,
    onPlayerStateChange,
    play,
    pause,
    togglePlayPause,
    seekTo,
    setPlaybackSpeed,
    player: playerRef.current,
  };
}
export type UsePlayerReturn = ReturnType<typeof usePlayer>;
