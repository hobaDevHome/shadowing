import { Mic, Square, Play, Download, Trash2 } from "lucide-react";
import { useRecorder } from "../hooks/useRecorder";
import Waveform from "./Waveform";

interface RecordingPanelProps {
  onPlayOriginal: () => void;
  segmentDurationSec: number;
}

export default function RecordingPanel({ onPlayOriginal, segmentDurationSec }: RecordingPanelProps) {
  const { isRecording, audioUrl, error, startRecording, stopRecording, reset, download } = useRecorder();

  const playSequential = () => {
    onPlayOriginal();
    if (audioUrl) {
      window.setTimeout(() => {
        new Audio(audioUrl).play();
      }, segmentDurationSec * 1000 + 300);
    }
  };

  return (
    <div className="bg-brand-gray border border-brand-light-gray rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
      <h3 className="font-bold text-white text-sm flex items-center gap-2">
        <Mic className="w-4 h-4 text-brand-green" />
        <span>Practice Recording</span>
      </h3>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-brand-green text-black hover:bg-emerald-500"
          }`}
        >
          {isRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          {isRecording ? "Stop" : "Record"}
        </button>

        {audioUrl && !isRecording && (
          <>
            <button
              onClick={playSequential}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white cursor-pointer"
              title="Play original, then your recording"
            >
              <Play className="w-3.5 h-3.5" /> Compare
            </button>
            <button
              onClick={() => download(`practice-${Date.now()}.webm`)}
              className="text-gray-400 hover:text-white cursor-pointer"
              title="Download recording"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={reset}
              className="text-gray-500 hover:text-red-400 cursor-pointer"
              title="Discard recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {audioUrl && !isRecording && <Waveform audioUrl={audioUrl} />}
    </div>
  );
}