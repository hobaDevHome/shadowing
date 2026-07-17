import { useState, useEffect, useCallback, useRef } from 'react';

export type RepeatMode = 'off' | 'infinite' | 'x3' | 'x5' | 'custom';

interface UseLoopProps {
  isPlaying: boolean;
  currentTime: number;
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  start: number;
  end: number;
  onRepeatComplete?: () => void;
  incrementStatsRepeat?: () => void;
  // When repeatMode is 'custom', use this target count
  customTarget?: number;
}

export function useLoop({
  isPlaying,
  currentTime,
  seekTo,
  play,
  pause,
  start,
  end,
  onRepeatComplete,
  incrementStatsRepeat,
  customTarget,
}: UseLoopProps) {
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState<number>(0);
  const [isABLooping, setIsABLooping] = useState<boolean>(false);
  
  // Ref to prevent stale closures in interval/callbacks
  const stateRef = useRef({ repeatMode, currentRepeatIndex, start, end, isABLooping });
  useEffect(() => {
    stateRef.current = { repeatMode, currentRepeatIndex, start, end, isABLooping };
  }, [repeatMode, currentRepeatIndex, start, end, isABLooping]);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatModeState(mode);
    setCurrentRepeatIndex(0);
  }, []);

  const toggleABLoop = useCallback(() => {
    setIsABLooping(prev => !prev);
  }, []);

  useEffect(() => {
    // Reset repeat index when subtitle changes
    setCurrentRepeatIndex(0);
  }, [start, end]);

  useEffect(() => {
    if (!isPlaying) return;

    const { repeatMode: activeMode, currentRepeatIndex: idx, start: currentStart, end: currentEnd, isABLooping: abActive } = stateRef.current;

    // Check if we hit the end of the subtitle
    if (currentTime >= currentEnd) {
      if (abActive || activeMode === 'infinite') {
        seekTo(currentStart);
        play();
        if (incrementStatsRepeat) incrementStatsRepeat();
      } else if (activeMode === 'x3' || activeMode === 'x5' || activeMode === 'custom') {
        const target = activeMode === 'x3' ? 3 : activeMode === 'x5' ? 5 : (customTarget || 0);
        const nextIdx = idx + 1;
        if (nextIdx < target) {
          setCurrentRepeatIndex(nextIdx);
          seekTo(currentStart);
          play();
          if (incrementStatsRepeat) incrementStatsRepeat();
        } else {
          // Finished repeating
          setRepeatModeState('off');
          setCurrentRepeatIndex(0);
          pause();
          if (onRepeatComplete) onRepeatComplete();
        }
      }
    }
  }, [currentTime, isPlaying, seekTo, play, pause, onRepeatComplete, incrementStatsRepeat]);

  return {
    repeatMode,
    setRepeatMode,
    currentRepeatIndex,
    isABLooping,
    setIsABLooping,
    toggleABLoop,
  };
}
export type UseLoopReturn = ReturnType<typeof useLoop>;
