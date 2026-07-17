import { useState, useEffect, useRef } from 'react';

interface UseShadowProps {
  shadowActive: boolean;
  isPlaying: boolean;
  currentTime: number;
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  start: number;
  end: number;
  pauseDuration: number; // in seconds (e.g., 0.5, 1, 2, 3)
  incrementStatsRepeat?: () => void;
}

export function useShadow({
  shadowActive,
  isPlaying,
  currentTime,
  seekTo,
  play,
  pause,
  start,
  end,
  pauseDuration,
  incrementStatsRepeat,
}: UseShadowProps) {
  const [isShadowWaiting, setIsShadowWaiting] = useState<boolean>(false);
  const [pauseProgress, setPauseProgress] = useState<number>(0); // 0 to 1
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const startTimestampRef = useRef<number>(0);

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // If shadow mode is disabled, reset status
  useEffect(() => {
    if (!shadowActive) {
      if (isShadowWaiting) {
        setIsShadowWaiting(false);
        setPauseProgress(0);
      }
      clearTimers();
    }
  }, [shadowActive, isShadowWaiting]);

  // If player is paused by user, cancel shadow waiting
  useEffect(() => {
    if (!isPlaying && isShadowWaiting) {
      setIsShadowWaiting(false);
      setPauseProgress(0);
      clearTimers();
    }
  }, [isPlaying, isShadowWaiting]);

  // Check current time boundary
  useEffect(() => {
    if (!shadowActive || !isPlaying || isShadowWaiting) return;

    if (currentTime >= end) {
      // 1. Pause video
      pause();
      setIsShadowWaiting(true);
      setPauseProgress(0);
      startTimestampRef.current = Date.now();

      const durationMs = pauseDuration * 1000;

      // 2. Start progress bar ticker
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimestampRef.current;
        const progress = Math.min(elapsed / durationMs, 1);
        setPauseProgress(progress);
      }, 50);

      // 3. Start resume timer
      timerRef.current = window.setTimeout(() => {
        clearTimers();
        setIsShadowWaiting(false);
        setPauseProgress(0);
        if (incrementStatsRepeat) {
          incrementStatsRepeat();
        } else {
          seekTo(start);
          play();
        }
      }, durationMs);
    }
  }, [currentTime, isPlaying, shadowActive, isShadowWaiting, start, end, pauseDuration, seekTo, play, pause, incrementStatsRepeat]);

  // Clean up
  useEffect(() => {
    return () => clearTimers();
  }, []);

  return {
    isShadowWaiting,
    pauseProgress,
  };
}
export type UseShadowReturn = ReturnType<typeof useShadow>;
