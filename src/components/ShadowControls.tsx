import React from 'react';
import { Volume2, VolumeX, Flame } from 'lucide-react';
import type { PauseDurationMode } from '../types/transcript';

interface ShadowControlsProps {
  shadowActive: boolean;
  onToggleShadow: () => void;
  pauseDuration: PauseDurationMode;
  onPauseDurationChange: (duration: PauseDurationMode) => void;
  isShadowWaiting: boolean;
  pauseProgress: number; // 0 to 1
  // A-B loop props
  abEnabled?: boolean;
  abStart?: number | null;
  abEnd?: number | null;
  onSetA?: () => void;
  onSetB?: () => void;
  onClearAB?: () => void;
  onApplyAB?: (mode: 'off' | 'infinite' | 'x3' | 'x5' | 'custom') => void;
  abRepeatMode?: 'off' | 'infinite' | 'x3' | 'x5' | 'custom';
  abCustomCount?: number;
  onSetAbCustomCount?: (n: number) => void;
  hideShadowSection?: boolean;
}

export const ShadowControls: React.FC<ShadowControlsProps> = ({
  shadowActive,
  onToggleShadow,
  pauseDuration,
  onPauseDurationChange,
  isShadowWaiting,
  pauseProgress,
  abEnabled = false,
  abStart = null,
  abEnd = null,
  onSetA,
  onSetB,
  onClearAB,
  onApplyAB,
  abRepeatMode = 'off',
  abCustomCount = 3,
  onSetAbCustomCount,
  hideShadowSection = false,
}) => {
  const presets: PauseDurationMode[] = [0.5, 1, 2, 3];

  return (
    <div className="bg-brand-gray border border-brand-light-gray rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {!hideShadowSection && (
        <>
          {/* Title Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-md flex items-center gap-2">
              <Flame className={`w-5 h-5 ${shadowActive ? 'text-duo-orange animate-bounce' : 'text-gray-500'}`} />
              <span>Shadowing Mode</span>
            </h4>
            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
              shadowActive ? 'bg-duo-orange/20 text-duo-orange border border-duo-orange/30' : 'bg-brand-light-gray text-gray-500'
            }`}>
              {shadowActive ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Automatically pauses the video at the end of each subtitle line to give you time to repeat.
          </p>

          {/* Main Activation Button */}
          <button
            onClick={onToggleShadow}
            className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2 ${
              shadowActive
                ? 'bg-duo-orange hover:bg-orange-500 text-white hover:scale-[1.02] active:scale-95'
                : 'bg-brand-light-gray hover:bg-brand-light-gray/80 text-white'
            }`}
          >
            {shadowActive ? (
              <>
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Stop Shadowing (S)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Start Shadowing (S)</span>
              </>
            )}
          </button>

          {/* Pause Duration Preset Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pause Duration</span>
            <div className="grid grid-cols-4 gap-1.5 bg-black/40 p-1 rounded-lg border border-brand-light-gray/40">
              {presets.map((preset) => (
                <button
                  key={preset}
                  disabled={!shadowActive}
                  onClick={() => onPauseDurationChange(preset)}
                  className={`py-1.5 text-xs font-semibold rounded cursor-pointer transition-all duration-200 ${
                    !shadowActive
                      ? 'text-gray-600 cursor-not-allowed'
                      : pauseDuration === preset
                        ? 'bg-brand-light-gray text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {preset}s
                </button>
              ))}
            </div>
          </div>

          {/* Countdown Progress Visualizer */}
          {shadowActive && (
            <div className="mt-2 transition-all duration-300">
              {isShadowWaiting ? (
                <div className="flex flex-col gap-1.5 bg-duo-orange/10 border border-duo-orange/20 rounded-xl p-3 animate-pulse">
                  <div className="flex items-center justify-between text-xs text-duo-orange font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-duo-orange rounded-full animate-ping"></span>
                      🗣️ Repeat now...
                    </span>
                    <span>{((1 - pauseProgress) * pauseDuration).toFixed(1)}s</span>
                  </div>
                  <div className="w-full bg-brand-light-gray h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-duo-orange h-full transition-all duration-75 ease-linear"
                      style={{ width: `${pauseProgress * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-3 bg-brand-light-gray/30 border border-brand-light-gray/20 rounded-xl text-xs text-gray-500 font-semibold italic">
                  👂 Listening to speaker...
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* A-B Loop Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">A-B Loop</span>
          <div className="text-xs text-gray-400">{abEnabled ? 'Active' : 'Inactive'}</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSetA}
            className="py-2 text-xs font-semibold rounded cursor-pointer transition-all duration-200 bg-brand-light-gray text-white"
          >
            Set A ({abStart ? abStart.toFixed(1) + 's' : '—'})
          </button>
          <button
            onClick={onSetB}
            className="py-2 text-xs font-semibold rounded cursor-pointer transition-all duration-200 bg-brand-light-gray text-white"
          >
            Set B ({abEnd ? abEnd.toFixed(1) + 's' : '—'})
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onApplyAB && onApplyAB('x3')}
            className={`py-1.5 px-3 text-xs font-bold rounded cursor-pointer transition-all active:scale-95 border ${
              abRepeatMode === 'x3'
                ? 'bg-brand-green text-black border-brand-green'
                : 'bg-brand-light-gray text-gray-300 border-transparent hover:text-white hover:bg-brand-light-gray/70'
            }`}
          >
            ×3
          </button>
          <button
            onClick={() => onApplyAB && onApplyAB('x5')}
            className={`py-1.5 px-3 text-xs font-bold rounded cursor-pointer transition-all active:scale-95 border ${
              abRepeatMode === 'x5'
                ? 'bg-brand-green text-black border-brand-green'
                : 'bg-brand-light-gray text-gray-300 border-transparent hover:text-white hover:bg-brand-light-gray/70'
            }`}
          >
            ×5
          </button>
          <button
            onClick={() => onApplyAB && onApplyAB('infinite')}
            className={`py-1.5 px-3 text-xs font-bold rounded cursor-pointer transition-all active:scale-95 border ${
              abRepeatMode === 'infinite'
                ? 'bg-brand-green text-black border-brand-green'
                : 'bg-brand-light-gray text-gray-300 border-transparent hover:text-white hover:bg-brand-light-gray/70'
            }`}
          >
            ∞
          </button>
          <div className="flex items-center gap-1 ml-auto">
            <input
              type="number"
              min={1}
              value={abCustomCount}
              onChange={(e) => onSetAbCustomCount && onSetAbCustomCount(Number(e.target.value))}
              className="w-14 bg-black/40 border border-brand-light-gray rounded px-2 py-1 text-xs text-white text-center"
            />
            <button
              onClick={() => onApplyAB && onApplyAB('custom')}
              className={`py-1.5 px-3 text-xs font-bold rounded cursor-pointer transition-all active:scale-95 border ${
                abRepeatMode === 'custom'
                  ? 'bg-brand-green text-black border-brand-green'
                  : 'bg-brand-light-gray text-gray-300 border-transparent hover:text-white hover:bg-brand-light-gray/70'
              }`}
            >
              Apply
            </button>
          </div>

          <button
            onClick={onClearAB}
            className="py-1.5 px-3 text-xs font-bold rounded cursor-pointer transition-all active:scale-95 bg-red-700/70 hover:bg-red-600 text-white border border-red-600/40"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
export default ShadowControls;
