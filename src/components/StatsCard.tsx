import React from 'react';
import { Play, RotateCcw, Clock, Gauge } from 'lucide-react';

interface StatsCardProps {
  currentSubtitleId: number | null;
  repeatCount: number;
  totalPracticeTime: number; // in seconds
  currentSpeed: number;
}

// Utility to format seconds to mm:ss
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const StatsCard: React.FC<StatsCardProps> = ({
  currentSubtitleId,
  repeatCount,
  totalPracticeTime,
  currentSpeed,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {/* Active Subtitle Card */}
      <div className="bg-brand-gray border border-brand-light-gray rounded-2xl p-4 flex items-center gap-3 shadow-md hover:border-brand-light-gray/80 transition-colors">
        <div className="bg-brand-green/10 text-brand-green p-2 rounded-xl">
          <Play className="w-5 h-5 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Line</span>
          <span className="text-lg font-bold text-white">
            {currentSubtitleId !== null ? `#${currentSubtitleId}` : '--'}
          </span>
        </div>
      </div>

      {/* Repeat Counter Card */}
      <div className="bg-brand-gray border border-brand-light-gray rounded-2xl p-4 flex items-center gap-3 shadow-md hover:border-brand-light-gray/80 transition-colors">
        <div className="bg-duo-orange/10 text-duo-orange p-2 rounded-xl">
          <RotateCcw className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Line Repeats</span>
          <span className="text-lg font-bold text-white">{repeatCount}</span>
        </div>
      </div>

      {/* Practice Timer Card */}
      <div className="bg-brand-gray border border-brand-light-gray rounded-2xl p-4 flex items-center gap-3 shadow-md hover:border-brand-light-gray/80 transition-colors">
        <div className="bg-duo-blue/10 text-duo-blue p-2 rounded-xl">
          <Clock className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Session Time</span>
          <span className="text-lg font-bold text-white font-mono">
            {formatDuration(totalPracticeTime)}
          </span>
        </div>
      </div>

      {/* Speed Indicator Card */}
      <div className="bg-brand-gray border border-brand-light-gray rounded-2xl p-4 flex items-center gap-3 shadow-md hover:border-brand-light-gray/80 transition-colors">
        <div className="bg-duo-green/10 text-duo-green p-2 rounded-xl">
          <Gauge className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Speed Rate</span>
          <span className="text-lg font-bold text-white font-mono">{currentSpeed.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};
export default StatsCard;
