import { Repeat, Trash2 } from "lucide-react";
import type { AbSegment } from "../hooks/useUrlHistory";

interface SegmentsPanelProps {
  segments: AbSegment[];
  activeSegmentId: string | null;
  onSelect: (segment: AbSegment) => void;
  onDelete: (id: string) => void;
}

const formatTime = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const remaining = Math.floor(secs % 60);
  return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
};

const modeLabel: Record<AbSegment["repeatMode"], string> = {
  infinite: "∞",
  x3: "×3",
  x5: "×5",
  custom: "custom",
};

export default function SegmentsPanel({
  segments,
  activeSegmentId,
  onSelect,
  onDelete,
}: SegmentsPanelProps) {
  return (
    <div className="bg-brand-gray border border-brand-light-gray rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
      <div className="flex items-center gap-2 border-b border-brand-light-gray/40 pb-3">
        <Repeat className="w-4 h-4 text-brand-green" />
        <h3 className="font-bold text-white text-sm">Practiced Segments</h3>
      </div>

      {segments.length === 0 && (
        <p className="text-gray-500 text-xs text-center py-4">
          No segments yet. Set A/B and hit Apply to save one.
        </p>
      )}

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {segments.map((seg) => (
          <div
            key={seg.id}
            onClick={() => onSelect(seg)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors border ${
              seg.id === activeSegmentId
                ? "bg-brand-green/20 border-brand-green/40 text-brand-green"
                : "bg-brand-light-gray/40 border-transparent text-gray-300 hover:bg-brand-light-gray"
            }`}
          >
            <span className="text-xs font-mono">
              {formatTime(seg.start)} → {formatTime(seg.end)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase">
                {modeLabel[seg.repeatMode]}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(seg.id);
                }}
                className="text-gray-500 hover:text-red-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}