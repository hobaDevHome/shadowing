import React from 'react';
import { X, Settings, Sliders, Play, MoveRight, Scroll, Moon, Type } from 'lucide-react';
import type { AppSettings, FontSizeMode, PauseDurationMode } from '../types/transcript';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const fontSizes: { value: FontSizeMode; label: string }[] = [
    { value: 'sm', label: 'Small' },
    { value: 'base', label: 'Normal' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: '2xl', label: 'Huge' },
  ];

  const pauseDurations: PauseDurationMode[] = [0.5, 1, 2, 3];
  const speedRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Body */}
      <div
        className={`fixed top-0 right-0 h-full w-[340px] bg-brand-gray border-l border-brand-light-gray z-50 shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-light-gray/40 pb-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-green" />
            <span>Practice Settings</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-brand-light-gray cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Area */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1 custom-scrollbar">
          
          {/* Playback Speed Setting */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Playback Speed</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-lg border border-brand-light-gray/40">
              {speedRates.map((speed) => (
                <button
                  key={speed}
                  onClick={() => onUpdateSettings({ playbackSpeed: speed })}
                  className={`py-1.5 text-xs font-semibold rounded cursor-pointer transition-all ${
                    settings.playbackSpeed === speed
                      ? 'bg-brand-green text-black font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {speed.toFixed(2)}x
                </button>
              ))}
            </div>
          </div>

          {/* Pause Duration Setting */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              <span>Shadow Pause Duration</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-black/40 p-1 rounded-lg border border-brand-light-gray/40">
              {pauseDurations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => onUpdateSettings({ pauseDuration: duration })}
                  className={`py-1.5 text-xs font-semibold rounded cursor-pointer transition-all ${
                    settings.pauseDuration === duration
                      ? 'bg-duo-orange text-white font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {duration}s
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Setting */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              <span>Transcript Font Size</span>
            </label>
            <div className="flex flex-col gap-1.5 bg-black/40 p-1 rounded-lg border border-brand-light-gray/40">
              {fontSizes.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdateSettings({ fontSize: value })}
                  className={`w-full py-1.5 px-3 text-left text-xs font-semibold rounded cursor-pointer transition-all flex justify-between items-center ${
                    settings.fontSize === value
                      ? 'bg-brand-light-gray text-white font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-brand-light-gray/20'
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[10px] text-gray-500 font-mono">({value})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles Group */}
          <div className="border-t border-brand-light-gray/40 pt-4 flex flex-col gap-4">
            
            {/* Auto Next Subtitle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <MoveRight className="w-4 h-4 text-brand-green" />
                  <span>Auto Next Sentence</span>
                </span>
                <span className="text-xs text-gray-500">Advance when line completes</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ autoNext: !settings.autoNext })}
                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 outline-none ${
                  settings.autoNext ? 'bg-brand-green' : 'bg-brand-light-gray'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    settings.autoNext ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto Scroll */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Scroll className="w-4 h-4 text-duo-blue" />
                  <span>Auto Scroll Transcript</span>
                </span>
                <span className="text-xs text-gray-500">Center active line in view</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ autoScroll: !settings.autoScroll })}
                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 outline-none ${
                  settings.autoScroll ? 'bg-brand-green' : 'bg-brand-light-gray'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    settings.autoScroll ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between opacity-80">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-brand-green" />
                  <span>Dark Mode</span>
                </span>
                <span className="text-xs text-gray-500">Locked to Dark Theme</span>
              </div>
              <button
                disabled
                className="w-11 h-6 rounded-full p-1 bg-brand-green cursor-not-allowed outline-none"
              >
                <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
              </button>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-brand-light-gray/40 pt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Version 1.0.0 (MVP)</span>
          <span>ShadowSpeak</span>
        </div>
      </div>
    </>
  );
};
export default SettingsDrawer;
