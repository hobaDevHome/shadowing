import { useState, useEffect } from "react";
import { History, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface HistoryPanelProps {
  history: string[];
  currentUrl: string;
  onSelect: (url: string) => void;
  onDelete: (url: string) => void;
}

interface VideoMeta {
  title: string;
  thumbnail: string;
}

function HistoryItem({
  url,
  isActive,
  onSelect,
  onDelete,
}: {
  url: string;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMeta(null);
    setFailed(false);

    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      .then((r) => {
        if (!r.ok) throw new Error("oEmbed failed");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setMeta({ title: data.title, thumbnail: data.thumbnail_url });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-2.5 py-2 rounded-xl cursor-pointer transition-colors border ${
        isActive
          ? "bg-brand-green/20 border-brand-green/40"
          : "bg-brand-light-gray/40 border-transparent hover:bg-brand-light-gray"
      }`}
    >
      <div className="w-16 h-9 rounded-lg overflow-hidden bg-brand-light-gray shrink-0">
        {meta?.thumbnail && (
          <img src={meta.thumbnail} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <span
        className={`text-xs flex-1 truncate ${
          isActive ? "text-brand-green font-semibold" : "text-gray-300"
        }`}
        title={meta?.title || url}
      >
        {meta?.title || (failed ? url : "Loading...")}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-gray-500 hover:text-red-400 cursor-pointer shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function HistoryPanel({ history, currentUrl, onSelect, onDelete }: HistoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-brand-gray border border-brand-light-gray rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-between cursor-pointer"
      >
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-brand-green" />
          <span>URL History</span>
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border-t border-brand-light-gray/40 pt-3">
          {history.length === 0 && (
            <p className="text-gray-500 text-xs text-center py-4">No videos loaded yet.</p>
          )}
          {history.map((url) => (
            <HistoryItem
              key={url}
              url={url}
              isActive={url === currentUrl}
              onSelect={() => onSelect(url)}
              onDelete={() => onDelete(url)}
            />
          ))}
        </div>
      )}
    </div>
  );
}