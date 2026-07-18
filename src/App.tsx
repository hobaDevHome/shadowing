import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useUrlHistory, type AbSegment } from "./hooks/useUrlHistory";
import SegmentsPanel from "./components/SPanel";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Flame,
} from "lucide-react";
import { usePlayer } from "./hooks/usePlayer";
import { useLoop } from "./hooks/useLoop";
import { useShadow } from "./hooks/useShadow";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import type { Subtitle, AppSettings, PracticeStats } from "./types/transcript";

import VideoPlayer from "./components/VideoPlayer";
import ShadowControls from "./components/ShadowControls";


import sampleTranscriptData from "./data/sampleTranscript.json";

import { History } from "lucide-react";
import HistoryPanel from "./components/HistoryPanel";

// Cast the JSON import to Subtitle[]
const initialSubtitles: Subtitle[] = sampleTranscriptData as Subtitle[];


function App() {
  const [subtitles] = useState<Subtitle[]>(initialSubtitles);
  const [activeSubtitleId, setActiveSubtitleId] = useState<number>(1);

const { history, addUrl, saveSegments, deleteUrl } = useUrlHistory();
const [segments, setSegments] = useState<AbSegment[]>([]);
const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>({
    playbackSpeed: 1.0,
    pauseDuration: 1,
    autoNext: true,
    autoScroll: true,
    darkMode: true,
    fontSize: "base",
  });

  // Session Statistics State
  const [stats, setStats] = useState<PracticeStats>({
    practicedIds: [],
    repeatCounts: {},
    totalPracticeTime: 0,
  });

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ message, visible: true });
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ message: "", visible: false });
      toastTimerRef.current = null;
    }, 2500);
  }, []);
  // speed dropdown mneu
  const speedMenuRef = useRef<HTMLDivElement>(null);
const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
      setIsSpeedMenuOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  // Initialize Player Hook
  const {
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
    captionsEnabled,      // جديد
  toggleCaptions,   
  } = usePlayer("");

  // Helpers to mark practiced lines & increment repeats
  const markAsPracticed = useCallback((id: number) => {
    setStats((prev) => {
      if (prev.practicedIds.includes(id)) return prev;
      return {
        ...prev,
        practicedIds: [...prev.practicedIds, id],
      };
    });
  }, []);

  const incrementRepeatCount = useCallback((id: number) => {
    setStats((prev) => {
      const currentCount = prev.repeatCounts[id] || 0;
      return {
        ...prev,
        repeatCounts: {
          ...prev.repeatCounts,
          [id]: currentCount + 1,
        },
      };
    });
  }, []);

  // Update speed rates
  const handleUpdateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };

        // If speed changes, push it to player
        if (newSettings.playbackSpeed !== undefined) {
          setPlaybackSpeed(newSettings.playbackSpeed);
          showToast(`Speed set to ${newSettings.playbackSpeed.toFixed(2)}x`);
        }

        return updated;
      });
    },
    [setPlaybackSpeed, showToast],
  );

  const currentActiveSub = useMemo(() => {
    return subtitles.find((sub) => sub.id === activeSubtitleId) || subtitles[0];
  }, [subtitles, activeSubtitleId]);

  // Log subtitles once loaded for debugging
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.log(
        "[Debug] subtitles count=",
        subtitles?.length ?? 0,
        "firstId=",
        subtitles?.[0]?.id ?? null,
      );
    } catch (e) {}
  }, [subtitles]);

  // Subtitle navigation
  const goToPreviousSubtitle = useCallback(() => {
    const currentIndex = subtitles.findIndex(
      (sub) => sub.id === activeSubtitleId,
    );
    if (currentIndex > 0) {
      const prevSub = subtitles[currentIndex - 1];
      setActiveSubtitleId(prevSub.id);
      seekTo(prevSub.start);
      play();
      showToast(`Line #${prevSub.id}`);
    }
  }, [activeSubtitleId, subtitles, seekTo, play, showToast]);

  const goToNextSubtitle = useCallback(() => {
    const currentIndex = subtitles.findIndex(
      (sub) => sub.id === activeSubtitleId,
    );
    if (currentIndex < subtitles.length - 1) {
      const nextSub = subtitles[currentIndex + 1];
      setActiveSubtitleId(nextSub.id);
      seekTo(nextSub.start);
      play();
      showToast(`Line #${nextSub.id}`);
    }
  }, [activeSubtitleId, subtitles, seekTo, play, showToast]);

  // Play Once Config
  const [playOnceConfig, setPlayOnceConfig] = useState<{
    active: boolean;
    end: number;
    id: number | null;
  }>({
    active: false,
    end: 0,
    id: null,
  });

  // Looping Hook (x3, x5, infinite)
  const handleRepeatComplete = useCallback(() => {
    if (settings.autoNext) {
      goToNextSubtitle();
    }
  }, [settings.autoNext, goToNextSubtitle]);

  const { repeatMode, setRepeatMode, isABLooping, setIsABLooping } = useLoop({
    isPlaying,
    currentTime,
    seekTo,
    play,
    pause,
    start: currentActiveSub.start,
    end: currentActiveSub.end,
    onRepeatComplete: handleRepeatComplete,
    incrementStatsRepeat: () => {
      incrementRepeatCount(currentActiveSub.id);
      markAsPracticed(currentActiveSub.id);
    },
  });

  // A-B Loop state
  const [abEnabled, setAbEnabled] = useState<boolean>(false);
  const [abStart, setAbStart] = useState<number | null>(null);
  const [abEnd, setAbEnd] = useState<number | null>(null);
  const [abRepeatMode, setAbRepeatMode] = useState<"off" | "infinite" | "x3" | "x5" | "custom">("off");
  const [abCustomCount, setAbCustomCount] = useState<number>(3);


  // Shadow Mode Hook
  const [shadowActive, setShadowActive] = useState<boolean>(false);

  const handleShadowRepeatComplete = useCallback(() => {
    incrementRepeatCount(currentActiveSub.id);
    markAsPracticed(currentActiveSub.id);

    if (settings.autoNext) {
      const currentIndex = subtitles.findIndex(
        (s) => s.id === activeSubtitleId,
      );
      if (currentIndex < subtitles.length - 1) {
        const nextSub = subtitles[currentIndex + 1];
        setActiveSubtitleId(nextSub.id);
        seekTo(nextSub.start);
        play();
        showToast(`Line #${nextSub.id}`);
      } else {
        // End of dialog
        setShadowActive(false);
        pause();
        showToast("Shadow practice finished!");
      }
    } else {
      // Loop same subtitle
      seekTo(currentActiveSub.start);
      play();
    }
  }, [
    activeSubtitleId,
    subtitles,
    currentActiveSub,
    settings.autoNext,
    seekTo,
    play,
    pause,
    incrementRepeatCount,
    markAsPracticed,
    showToast,
  ]);

  const { isShadowWaiting, pauseProgress } = useShadow({
    shadowActive,
    isPlaying,
    currentTime,
    seekTo,
    play,
    pause,
    start: currentActiveSub.start,
    end: currentActiveSub.end,
    pauseDuration: settings.pauseDuration,
    incrementStatsRepeat: handleShadowRepeatComplete,
  });

  // Pass A-B start/end into useLoop by recalculating hook inputs when AB enabled
  const loopStart = abEnabled ? (abStart ?? currentActiveSub.start) : currentActiveSub.start;
  const loopEnd = abEnabled ? (abEnd ?? currentActiveSub.end) : currentActiveSub.end;

  // Called when a finite AB segment (x3/x5/custom) finishes its repeats.
// useLoop already paused playback internally — we just resume so the
// video continues naturally instead of jumping anywhere.
const handleAbRepeatComplete = useCallback(() => {
  play();
}, [play]);

  // Reinitialize loop hook with A-B times and custom target
  const {
    repeatMode: abLoopMode,
    setRepeatMode: setAbLoopMode,
    isABLooping: isAbLoopingActive,
    setIsABLooping: setIsAbLoopingActive,
  } = useLoop({
    isPlaying,
    currentTime,
    seekTo,
    play,
    pause,
    start: loopStart,
    end: loopEnd,
    onRepeatComplete: handleAbRepeatComplete,
    incrementStatsRepeat: () => {},
    customTarget: abCustomCount,
  });

  // AB handlers (init after AB loop hook)
  const handleSetAFromNow = useCallback(() => setAbStart(currentTime), [currentTime]);
  const handleSetBFromNow = useCallback(() => setAbEnd(currentTime), [currentTime]);
  const handleClearAB = useCallback(() => {
    setAbEnabled(false);
    setAbStart(null);
    setAbEnd(null);
    setAbRepeatMode('off');
    setAbCustomCount(3);
    setIsAbLoopingActive(false);
    setAbLoopMode('off');
    setActiveSegmentId(null)
  }, [setIsAbLoopingActive, setAbLoopMode]);

const handleApplyAB = useCallback(
  (mode: "off" | "infinite" | "x3" | "x5" | "custom") => {
    if (abStart === null || abEnd === null) return;

    setAbEnabled(true);
    setAbRepeatMode(mode);
    setAbLoopMode(mode === "custom" ? "custom" : (mode as any));
    setIsAbLoopingActive(true);

    const newSegment: AbSegment = {
      id: `${Date.now()}`,
      start: abStart,
      end: abEnd,
      repeatMode: mode === "off" ? "infinite" : mode,
      customCount: mode === "custom" ? abCustomCount : undefined,
    };

    setSegments((prev) => {
      const filtered = prev.filter(
        (s) =>
          Math.abs(s.start - newSegment.start) > 0.3 ||
          Math.abs(s.end - newSegment.end) > 0.3,
      );
      const updated = [...filtered, newSegment];
      saveSegments(videoUrl, updated);
      return updated;
    });

    setActiveSegmentId(newSegment.id);
  },
  [abStart, abEnd, abCustomCount, videoUrl, saveSegments, setAbLoopMode, setIsAbLoopingActive],
);


  // Play Once boundaries check
  useEffect(() => {
    if (
      playOnceConfig.active &&
      isPlaying &&
      currentTime >= playOnceConfig.end
    ) {
      pause();
      setPlayOnceConfig({ active: false, end: 0, id: null });
      if (playOnceConfig.id !== null) {
        markAsPracticed(playOnceConfig.id);
        showToast(`Finished practicing line #${playOnceConfig.id}`);
      }
    }
  }, [
    currentTime,
    isPlaying,
    playOnceConfig,
    pause,
    markAsPracticed,
    showToast,
  ]);
  // segments
  useEffect(() => {
  setActiveSegmentId(null);
}, [videoUrl]);

useEffect(() => {
  const record = history.find((r) => r.url === videoUrl);
  setSegments(record?.segments || []);
}, [videoUrl, history]);

  // Session Time Ticker
  useEffect(() => {
    let interval: number | null = null;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setStats((prev) => ({
          ...prev,
          totalPracticeTime: prev.totalPracticeTime + 1,
        }));
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying]);

  // Sync active subtitle ID from playback time
  useEffect(() => {
    // Only auto-update if we are playing, and not waiting in shadow mode, and not repeating a single subtitle
    const isLoopingActive =
      isABLooping ||
      repeatMode !== "off" ||
      shadowActive ||
      playOnceConfig.active;
    if (isPlaying && !isShadowWaiting && !isLoopingActive) {
      const matchingSub = subtitles.find(
        (sub) => currentTime >= sub.start && currentTime <= sub.end,
      );
      // Debug logging to help trace mismatches between player time and subtitles
      try {
        // eslint-disable-next-line no-console
        console.log(
          "[Subtitle Sync] time=",
          currentTime,
          "matching=",
          matchingSub?.id ?? null,
          "active=",
          activeSubtitleId,
        );
      } catch (e) {}

      if (matchingSub && matchingSub.id !== activeSubtitleId) {
        setActiveSubtitleId(matchingSub.id);
        return;
      }

      // If no exact match (small gap between segments), pick the closest subtitle
      // to provide a smoother transcript highlight experience.
      const TOLERANCE = 0.4; // seconds
      const nextIndex = subtitles.findIndex((s) => s.start > currentTime);
      let candidateId: number | null = null;

      if (nextIndex === -1) {
        // We're past the last subtitle start; pick the last subtitle if close
        const last = subtitles[subtitles.length - 1];
        if (last && Math.abs(currentTime - last.end) <= TOLERANCE)
          candidateId = last.id;
      } else if (nextIndex === 0) {
        // Before the very first subtitle start
        const first = subtitles[0];
        if (first && Math.abs(first.start - currentTime) <= TOLERANCE)
          candidateId = first.id;
      } else {
        const next = subtitles[nextIndex];
        const prev = subtitles[nextIndex - 1];
        const distToNext = Math.abs(next.start - currentTime);
        const distToPrev =
          currentTime > prev.end
            ? Math.abs(currentTime - prev.end)
            : Math.abs(prev.start - currentTime);

        if (distToNext <= distToPrev && distToNext <= TOLERANCE) {
          candidateId = next.id;
        } else if (distToPrev < distToNext && distToPrev <= TOLERANCE) {
          candidateId = prev.id;
        }
      }

      if (candidateId !== null && candidateId !== activeSubtitleId) {
        setActiveSubtitleId(candidateId);
      }
    }
  }, [
    currentTime,
    isPlaying,
    subtitles,
    activeSubtitleId,
    isShadowWaiting,
    isABLooping,
    repeatMode,
    shadowActive,
    playOnceConfig,
  ]);

  // Log every time update to ensure console shows activity
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.log("[Time Tick]", currentTime.toFixed(2));
    } catch (e) {}
  }, [currentTime]);

  // Action Triggers from Subtitle Clicks
  const handlePlayOnce = useCallback(
    (sub: Subtitle) => {
      setShadowActive(false);
      setRepeatMode("off");
      setIsABLooping(false);

      setActiveSubtitleId(sub.id);
      seekTo(sub.start);
      play();
      setPlayOnceConfig({ active: true, end: sub.end, id: sub.id });
      showToast(`Play once: Line #${sub.id}`);
    },
    [seekTo, play, setRepeatMode, setIsABLooping, showToast],
  );

  const applySegment = useCallback(
  (segment: AbSegment) => {
    setShadowActive(false);
    setRepeatMode("off");
    setPlayOnceConfig({ active: false, end: 0, id: null });

    setAbStart(segment.start);
    setAbEnd(segment.end);
    setAbEnabled(true);
    setAbRepeatMode(segment.repeatMode);
    setAbLoopMode(segment.repeatMode);
    if (segment.repeatMode === "custom" && segment.customCount) {
      setAbCustomCount(segment.customCount);
    }
    setIsAbLoopingActive(true);
    setActiveSegmentId(segment.id);

    seekTo(segment.start);
    play();
    showToast(`Segment ${segment.start.toFixed(1)}s – ${segment.end.toFixed(1)}s`);
  },
  [seekTo, play, setRepeatMode, setIsAbLoopingActive, setAbLoopMode, showToast],
);

const deleteSegment = useCallback(
  (id: string) => {
    setSegments((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSegments(videoUrl, updated);
      return updated;
    });
    setActiveSegmentId((prev) => (prev === id ? null : prev));
  },
  [videoUrl, saveSegments],
);

const goToPreviousSegment = useCallback(() => {
  if (segments.length === 0) return;
  const idx = segments.findIndex((s) => s.id === activeSegmentId);
  const prevIndex = idx <= 0 ? segments.length - 1 : idx - 1;
  applySegment(segments[prevIndex]);
}, [segments, activeSegmentId, applySegment]);

const goToNextSegment = useCallback(() => {
  if (segments.length === 0) return;
  const idx = segments.findIndex((s) => s.id === activeSegmentId);
  const nextIndex = idx === -1 || idx === segments.length - 1 ? 0 : idx + 1;
  applySegment(segments[nextIndex]);
}, [segments, activeSegmentId, applySegment]);

  const handleRepeatInfinite = useCallback(
    (sub: Subtitle) => {
      setShadowActive(false);
      setPlayOnceConfig({ active: false, end: 0, id: null });
      setIsABLooping(false);

      setActiveSubtitleId(sub.id);
      setRepeatMode("infinite");
      seekTo(sub.start);
      play();
      showToast(`Looping infinitely: Line #${sub.id}`);
    },
    [seekTo, play, setRepeatMode, setIsABLooping, showToast],
  );

  const handleRepeatX3 = useCallback(
    (sub: Subtitle) => {
      setShadowActive(false);
      setPlayOnceConfig({ active: false, end: 0, id: null });
      setIsABLooping(false);

      setActiveSubtitleId(sub.id);
      setRepeatMode("x3");
      seekTo(sub.start);
      play();
      showToast(`Looping 3 times: Line #${sub.id}`);
    },
    [seekTo, play, setRepeatMode, setIsABLooping, showToast],
  );

  const handleRepeatX5 = useCallback(
    (sub: Subtitle) => {
      setShadowActive(false);
      setPlayOnceConfig({ active: false, end: 0, id: null });
      setIsABLooping(false);

      setActiveSubtitleId(sub.id);
      setRepeatMode("x5");
      seekTo(sub.start);
      play();
      showToast(`Looping 5 times: Line #${sub.id}`);
    },
    [seekTo, play, setRepeatMode, setIsABLooping, showToast],
  );

  const handleSlowSpeed = useCallback(
    (sub: Subtitle, speed: number) => {
      setShadowActive(false);
      setRepeatMode("off");
      setIsABLooping(false);
      setPlayOnceConfig({ active: false, end: 0, id: null });

      setActiveSubtitleId(sub.id);
      setPlaybackSpeed(speed);
      seekTo(sub.start);
      play();
      showToast(`Speed ${speed}x: Line #${sub.id}`);
    },
    [seekTo, play, setPlaybackSpeed, setRepeatMode, setIsABLooping, showToast],
  );

  // URL Change Handler - Resets Practice State
  const handleUrlChange = useCallback(
    (url: string) => {
      setVideoUrl(url);
      addUrl(url);
      // Reset stats & active subtitle
      setActiveSubtitleId(1);
      setShadowActive(false);
      setRepeatMode("off");
      setIsABLooping(false);
      setPlayOnceConfig({ active: false, end: 0, id: null });
      setStats({
        practicedIds: [],
        repeatCounts: {},
        totalPracticeTime: 0,
      });
      showToast("Loaded new video. Session reset.");
    },
    [setVideoUrl, setRepeatMode, setIsABLooping, showToast],
  );

  // Bind Keyboard Shortcuts
  const toggleRepeatMode = useCallback(() => {
    const nextMode = repeatMode === "infinite" ? "off" : "infinite";
    setRepeatMode(nextMode);
    showToast(
      nextMode === "infinite" ? "Infinite Repeat On" : "Infinite Repeat Off",
    );
  }, [repeatMode, setRepeatMode, showToast]);

  const toggleShadowMode = useCallback(() => {
    setShadowActive((prev) => {
      const next = !prev;
      if (next) {
        // Clear conflicting loop modes
        setRepeatMode("off");
        setIsABLooping(false);
        setPlayOnceConfig({ active: false, end: 0, id: null });
      }
      showToast(next ? "Shadow Mode Enabled" : "Shadow Mode Disabled");
      return next;
    });
  }, [setRepeatMode, setIsABLooping, showToast]);

  const toggleABLoopShortcut = useCallback(() => {
    setIsABLooping((prev) => {
      const next = !prev;
      if (next) {
        setShadowActive(false);
        setRepeatMode("off");
        setPlayOnceConfig({ active: false, end: 0, id: null });
      }
      showToast(next ? "A-B Loop Enabled" : "A-B Loop Disabled");
      return next;
    });
  }, [setRepeatMode, setIsABLooping, showToast]);

  const increaseSpeed = useCallback(() => {
    const current = playbackSpeed;
    const next = Math.min(current + 0.25, 2.0);
    setPlaybackSpeed(next);
    showToast(`Speed: ${next.toFixed(2)}x`);
  }, [playbackSpeed, setPlaybackSpeed, showToast]);

  const decreaseSpeed = useCallback(() => {
    const current = playbackSpeed;
    const next = Math.max(current - 0.25, 0.25);
    setPlaybackSpeed(next);
    showToast(`Speed: ${next.toFixed(2)}x`);
  }, [playbackSpeed, setPlaybackSpeed, showToast]);

useKeyboardShortcuts({
  togglePlayPause,
  goToPreviousSubtitle: goToPreviousSegment,
  goToNextSubtitle: goToNextSegment,
  toggleRepeatMode,
  toggleShadowMode,
  toggleABLoop: toggleABLoopShortcut,
  increaseSpeed,
  decreaseSpeed,
});

  // Time formatter helpers for custom seeker
  const formatSeek = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col p-4 md:p-8 select-none">
      {/* Header Panel */}
      <header className="flex items-center justify-between border-b border-brand-light-gray/40 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-brand-green p-2 rounded-xl text-black">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white m-0">
              ShadowSpeak
            </h1>
            <p className="text-xs text-gray-400">
              Perfect your English intonation & pacing with YouTube shadowing
            </p>
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex gap-2">
          
         
          
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6">
        {/* Left Side: Video Player, Custom Seeker & Speed Controls */}
        <div className="lg:col-span-6 flex flex-col gap-6 w-full">
          <VideoPlayer
            videoId={videoId}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            isPlayerLoading={isPlayerLoading}
            videoUrl={videoUrl}
            onUrlChange={handleUrlChange}
          />

          {/* Spotify-style Custom playback control bar */}
          <div className="bg-brand-gray border border-brand-light-gray rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            {/* Timeline seek slider */}
            <div className="flex flex-col gap-1 w-full">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-brand-light-gray rounded-lg appearance-none cursor-pointer accent-brand-green hover:accent-emerald-400"
              />
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>{formatSeek(currentTime)}</span>
                <span>{formatSeek(duration)}</span>
              </div>
            </div>

            {/* Media controllers */}
            <div className="flex items-center justify-between">
              {/* Speed rate indicators */}
              {/* Speed dropdown */}
<div className="relative" ref={speedMenuRef}>
  <button
    onClick={() => setIsSpeedMenuOpen((prev) => !prev)}
    className="flex items-center gap-1 cursor-pointer group"
  >
    <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-gray-300">
      Speed :
    </span>
    <span className="text-xs text-brand-green font-bold font-mono">
      {playbackSpeed.toFixed(2)}x
    </span>
  </button>
  

  {isSpeedMenuOpen && (
    <div className="absolute bottom-full left-0 mb-2 bg-brand-gray border border-brand-light-gray rounded-xl shadow-2xl overflow-hidden z-20 min-w-[80px]">
      {speedOptions.map((speed) => (
        <button
          key={speed}
          onClick={() => {
            handleUpdateSettings({ playbackSpeed: speed });
            setIsSpeedMenuOpen(false);
          }}
          className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors cursor-pointer ${
            Math.abs(playbackSpeed - speed) < 0.01
              ? "bg-brand-green/20 text-brand-green font-bold"
              : "text-gray-300 hover:bg-brand-light-gray"
          }`}
        >
          {speed.toFixed(2)}x
        </button>
      ))}
      
    </div>
    
  )}
</div>

              {/* Central buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={goToPreviousSegment}
                  className="text-gray-400 hover:text-white p-2 cursor-pointer transition-all hover:scale-110 active:scale-95"
                  title="Previous Subtitle (←)"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="bg-white hover:bg-gray-200 text-black p-3 rounded-full cursor-pointer transition-all hover:scale-105 active:scale-90 shadow-md"
                  title="Play / Pause (Space)"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current" />
                  )}
                </button>
                

                <button
                  onClick={goToNextSegment}
                  className="text-gray-400 hover:text-white p-2 cursor-pointer transition-all hover:scale-110 active:scale-95"
                  title="Next Subtitle (→)"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

              </div>

              {/* Mini active loops indicators */}
              <div className="flex items-center gap-2">
                
                <button
  onClick={toggleCaptions}
  className={`text-[10px] font-black w-7 h-7 rounded-md border transition-all cursor-pointer flex items-center justify-center ${
    captionsEnabled
      ? "bg-brand-green text-black border-brand-green"
      : "bg-transparent text-gray-400 border-brand-light-gray hover:text-white"
  }`}
  title="Toggle Captions"
>
  CC
</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: A-B Segment Loop Controls */}
        <div className="lg:col-span-6 flex flex-col gap-6 w-full">
          <ShadowControls
            shadowActive={shadowActive}
            onToggleShadow={toggleShadowMode}
            pauseDuration={settings.pauseDuration}
            onPauseDurationChange={(dur) =>
              handleUpdateSettings({ pauseDuration: dur })
            }
            isShadowWaiting={isShadowWaiting}
            pauseProgress={pauseProgress}
            hideShadowSection
            abEnabled={abEnabled}
            abStart={abStart}
            abEnd={abEnd}
            onSetA={handleSetAFromNow}
            onSetB={handleSetBFromNow}
            onClearAB={handleClearAB}
            onApplyAB={handleApplyAB}
            abRepeatMode={abRepeatMode}
            abCustomCount={abCustomCount}
            onSetAbCustomCount={(n) => setAbCustomCount(n)}
          />
           <SegmentsPanel
    segments={segments}
    activeSegmentId={activeSegmentId}
    onSelect={applySegment}
    onDelete={deleteSegment}
  />
<HistoryPanel
  history={history.map((record) => record.url)}
  currentUrl={videoUrl}
  onSelect={handleUrlChange}
  onDelete={deleteUrl}
/>
        </div>
        
      </main>



   

     

      {/* Floating Action Shortcut Toast Notification */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 border border-brand-light-gray/60 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-2xl flex items-center gap-2 transition-all duration-300 transform z-50 ${
          toast.visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <span className="w-1.5 h-1.5 bg-brand-green rounded-full"></span>
        {toast.message}
      </div>

      {/* Dev overlay removed */}
    </div>
  );
}

export default App;
