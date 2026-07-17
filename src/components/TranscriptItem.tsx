import React from 'react';
import { Play, RotateCcw, Check } from 'lucide-react';
import type { Subtitle, VisibilityMode } from '../types/transcript';

interface TranscriptItemProps {
  subtitle: Subtitle;
  isActive: boolean;
  isPracticed: boolean;
  visibilityMode: VisibilityMode;
  repeatCount: number;
  onSeek: (start: number) => void;
  onPlayOnce: (sub: Subtitle) => void;
  onRepeatInfinite: (sub: Subtitle) => void;
  onRepeatX3: (sub: Subtitle) => void;
  onRepeatX5: (sub: Subtitle) => void;
  onSlowSpeed: (sub: Subtitle, speed: number) => void;
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
}

// Utility to format seconds to mm:ss
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
};

export const TranscriptItem: React.FC<TranscriptItemProps> = ({
  subtitle,
  isActive,
  isPracticed,
  visibilityMode,
  repeatCount,
  onSeek,
  onPlayOnce,
  onRepeatInfinite,
  onRepeatX3,
  onRepeatX5,
  onSlowSpeed,
  fontSize,
}) => {
  // Determine font size class
  const fontSizeClass = {
    sm: 'text-xs md:text-sm',
    base: 'text-sm md:text-base',
    lg: 'text-base md:text-lg',
    xl: 'text-lg md:text-xl',
    '2xl': 'text-xl md:text-2xl',
  }[fontSize];

  // Render text based on visibility filter
  const renderText = () => {
    if (visibilityMode === 'hide') {
      return (
        <span className="text-gray-600 italic select-none font-mono">
          ••••••••••••••••••••••••••••••••
        </span>
      );
    }
    if (visibilityMode === 'blur') {
      return (
        <span className="text-blur select-none cursor-pointer" title="Hover to reveal text">
          {subtitle.text}
        </span>
      );
    }
    return <span>{subtitle.text}</span>;
  };

  return (
    <div
      className={`group flex flex-col p-4 rounded-xl border transition-all duration-200 gap-3 ${
        isActive
          ? 'bg-brand-light-gray/60 border-brand-green/50 shadow-lg shadow-black/40 scale-[1.01]'
          : 'bg-brand-card/30 border-brand-light-gray/40 hover:bg-brand-light-gray/20 hover:border-brand-light-gray/80'
      }`}
    >
      {/* Top section: Clickable text & timestamp */}
      <div 
        onClick={() => onSeek(subtitle.start)}
        className="flex items-start gap-3 cursor-pointer justify-between"
      >
        <div className="flex gap-3 items-start flex-1">
          {/* Index marker & status */}
          <span 
            className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
              isActive 
                ? 'bg-brand-green text-black' 
                : isPracticed 
                  ? 'bg-duo-green/20 text-duo-green' 
                  : 'bg-brand-light-gray text-gray-400'
            }`}
          >
            {isPracticed && !isActive ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : subtitle.id}
          </span>

          {/* Subtitle text */}
          <p
            className={`font-medium leading-relaxed flex-1 select-text transition-colors ${fontSizeClass} ${
              isActive ? 'text-white font-semibold' : 'text-gray-300'
            }`}
          >
            {renderText()}
          </p>
        </div>

        {/* Timestamp & repeats indicator */}
        <div className="flex flex-col items-end gap-1 shrink-0 select-none">
          <span className="text-xs text-gray-500 font-mono">
            {formatTime(subtitle.start)}
          </span>
          {repeatCount > 0 && (
            <span className="bg-brand-green/10 text-brand-green text-[10px] px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
              Repeats: {repeatCount}
            </span>
          )}
        </div>
      </div>

      {/* Bottom section: Practice & loop control triggers */}
      <div className="flex flex-wrap items-center justify-between border-t border-brand-light-gray/30 pt-2 opacity-60 group-hover:opacity-100 focus-within:opacity-100 transition-opacity gap-2">
        {/* Play/Repeat Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPlayOnce(subtitle)}
            className="flex items-center gap-1 bg-brand-light-gray hover:bg-brand-green hover:text-black text-gray-300 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
            title="Play once"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Play</span>
          </button>

          <button
            onClick={() => onRepeatInfinite(subtitle)}
            className="flex items-center gap-1 bg-brand-light-gray hover:bg-duo-green hover:text-black text-gray-300 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
            title="Repeat infinitely"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Loop ∞</span>
          </button>

          <button
            onClick={() => onRepeatX3(subtitle)}
            className="flex items-center gap-1 bg-brand-light-gray hover:bg-duo-blue hover:text-white text-gray-300 px-2 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
            title="Repeat 3 times"
          >
            <span>x3</span>
          </button>

          <button
            onClick={() => onRepeatX5(subtitle)}
            className="flex items-center gap-1 bg-brand-light-gray hover:bg-duo-orange hover:text-white text-gray-300 px-2 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
            title="Repeat 5 times"
          >
            <span>x5</span>
          </button>
        </div>

        {/* Slow play modes */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="text-[10px] uppercase font-bold text-gray-500">Slow:</span>
          <button
            onClick={() => onSlowSpeed(subtitle, 0.75)}
            className="hover:text-brand-green bg-brand-light-gray/40 px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-brand-light-gray"
          >
            0.75x
          </button>
          <button
            onClick={() => onSlowSpeed(subtitle, 0.5)}
            className="hover:text-brand-green bg-brand-light-gray/40 px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-brand-light-gray"
          >
            0.5x
          </button>
        </div>
      </div>
    </div>
  );
};
export default TranscriptItem;
