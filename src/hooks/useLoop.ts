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

  // Ref to prevent stale closures in the main loop effect
  const stateRef = useRef({ repeatMode, currentRepeatIndex, start, end, isABLooping, customTarget });
  useEffect(() => {
    stateRef.current = { repeatMode, currentRepeatIndex, start, end, isABLooping, customTarget };
  }, [repeatMode, currentRepeatIndex, start, end, isABLooping, customTarget]);

  // Guard: prevents firing multiple times while currentTime is still >= end.
  // YouTube's seekTo is async — the condition stays true for several renders
  // before the seek actually lands.
  const hasFiredRef = useRef(false);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatModeState(mode);
    setCurrentRepeatIndex(0);
    hasFiredRef.current = false;
  }, []);

  const toggleABLoop = useCallback(() => {
    setIsABLooping(prev => !prev);
    hasFiredRef.current = false;
  }, []);

  useEffect(() => {
    // Reset state when segment boundaries change
    setCurrentRepeatIndex(0);
    hasFiredRef.current = false;
  }, [start, end]);

  useEffect(() => {
    if (!isPlaying) return;

    const {
      repeatMode: activeMode,
      currentRepeatIndex: idx,
      start: currentStart,
      end: currentEnd,
      isABLooping: abActive,
      customTarget: target,
    } = stateRef.current;

    if (currentTime >= currentEnd) {
      // Only fire once per end-crossing; the guard resets when time drops below end again
      if (hasFiredRef.current) return;
      hasFiredRef.current = true;

      if (activeMode === 'x3' || activeMode === 'x5' || activeMode === 'custom') {
        const maxRepeats = activeMode === 'x3' ? 3 : activeMode === 'x5' ? 5 : (target || 0);
        const nextIdx = idx + 1;

        if (nextIdx < maxRepeats) {
          // Still more repeats to go — loop back
          setCurrentRepeatIndex(nextIdx);
          seekTo(currentStart);
          play();
          if (incrementStatsRepeat) incrementStatsRepeat();
          hasFiredRef.current = false; // allow the next end-crossing to fire
        } else {
          // All repeats done.
          // IMPORTANT: also clear isABLooping so the infinite branch can't re-trigger
          setRepeatModeState('off');
          setCurrentRepeatIndex(0);
          setIsABLooping(false);
          pause();
          if (onRepeatComplete) onRepeatComplete();
        }
      } else if (abActive || activeMode === 'infinite') {
        // Infinite AB loop or explicit infinite repeat
        seekTo(currentStart);
        play();
        if (incrementStatsRepeat) incrementStatsRepeat();
        hasFiredRef.current = false; // allow next crossing
      }
    } else {
      // currentTime dropped back below end — reset guard for the next crossing
      hasFiredRef.current = false;
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
