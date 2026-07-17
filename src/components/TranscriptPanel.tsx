import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import type {
  Subtitle,
  VisibilityMode,
  FontSizeMode,
} from "../types/transcript";
import TranscriptItem from "./TranscriptItem";

interface TranscriptPanelProps {
  subtitles: Subtitle[];
  activeSubtitleId: number | null;
  practicedIds: number[];
  repeatCounts: Record<number, number>;
  onSeek: (start: number) => void;
  onPlayOnce: (sub: Subtitle) => void;
  onRepeatInfinite: (sub: Subtitle) => void;
  onRepeatX3: (sub: Subtitle) => void;
  onRepeatX5: (sub: Subtitle) => void;
  onSlowSpeed: (sub: Subtitle, speed: number) => void;
  fontSize: FontSizeMode;
  autoScroll: boolean;
  goToPrevious: () => void;
  goToNext: () => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  subtitles,
  activeSubtitleId,
  practicedIds,
  repeatCounts,
  onSeek,
  onPlayOnce,
  onRepeatInfinite,
  onRepeatX3,
  onRepeatX5,
  onSlowSpeed,
  fontSize,
  autoScroll,
  goToPrevious,
  goToNext,
}) => {
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>("show");

  // Auto scroll current item into center of the panel
  useEffect(() => {
    if (autoScroll && activeSubtitleId !== null) {
      const activeElement = document.getElementById(
        `sub-row-${activeSubtitleId}`,
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [activeSubtitleId, autoScroll]);

  // We intentionally do not show subtitle text; render all segments

  return (
    <div className="flex flex-col h-full bg-brand-gray border border-brand-light-gray rounded-2xl overflow-hidden shadow-xl">
      {/* Header Toolbar */}
      <div className="flex flex-col gap-3 p-4 bg-brand-card/50 border-b border-brand-light-gray/40">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span>📝</span> Transcript
          </h3>

          {/* Visibility Controls */}
          <div className="flex bg-black/40 p-1 rounded-full border border-brand-light-gray/40">
            <button
              onClick={() => setVisibilityMode("show")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                visibilityMode === "show"
                  ? "bg-brand-green text-black"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Show subtitle text"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Show</span>
            </button>

            <button
              onClick={() => setVisibilityMode("blur")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                visibilityMode === "blur"
                  ? "bg-duo-orange text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Blur subtitle text (hover to reveal)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Blur</span>
            </button>

            <button
              onClick={() => setVisibilityMode("hide")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                visibilityMode === "hide"
                  ? "bg-red-500/80 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Hide subtitle text"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hide</span>
            </button>
          </div>
        </div>

        {/* Subtitle Navigation & Search */}
        <div className="flex gap-2">
          {/* Navigation Controls */}
          <div className="flex border border-brand-light-gray rounded-lg overflow-hidden shrink-0">
            <button
              onClick={goToPrevious}
              className="bg-brand-card hover:bg-brand-light-gray text-gray-300 p-2 cursor-pointer transition-colors border-r border-brand-light-gray"
              title="Previous Subtitle (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              className="bg-brand-card hover:bg-brand-light-gray text-gray-300 p-2 cursor-pointer transition-colors"
              title="Next Subtitle (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Search removed — transcript shows segment numbers only */}
        </div>
      </div>

      {/* Transcript Items Container */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 min-h-[300px] max-h-[500px]">
        {subtitles.length > 0 ? (
          subtitles.map((sub) => (
            <div key={sub.id} id={`sub-row-${sub.id}`}>
              <TranscriptItem
                subtitle={sub}
                isActive={activeSubtitleId === sub.id}
                isPracticed={practicedIds.includes(sub.id)}
                visibilityMode={visibilityMode}
                repeatCount={repeatCounts[sub.id] || 0}
                totalSegments={subtitles.length}
                onSeek={onSeek}
                onPlayOnce={onPlayOnce}
                onRepeatInfinite={onRepeatInfinite}
                onRepeatX3={onRepeatX3}
                onRepeatX5={onRepeatX5}
                onSlowSpeed={onSlowSpeed}
                fontSize={fontSize}
              />
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <p className="font-semibold text-gray-400">
              No matching lines found
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Try searching for a different keyword.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default TranscriptPanel;
