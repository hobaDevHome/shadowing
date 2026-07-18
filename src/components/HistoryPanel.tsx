import { useState } from "react";
import { History, ChevronDown, ChevronUp } from "lucide-react";

interface HistoryPanelProps {
  history: string[];
  currentUrl: string;
  onSelect: (url: string) => void;
}

export default function HistoryPanel({ history, currentUrl, onSelect }: HistoryPanelProps) {
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
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto border-t border-brand-light-gray/40 pt-3">
          {history.length === 0 && (
            <p className="text-gray-500 text-xs text-center py-4">No videos loaded yet.</p>
          )}
          {history.map((url) => (
            <button
              key={url}
              onClick={() => onSelect(url)}
              className={`text-left text-xs px-3 py-2.5 rounded-xl truncate transition-colors cursor-pointer border ${
                url === currentUrl
                  ? "bg-brand-green/20 border-brand-green/40 text-brand-green"
                  : "bg-brand-light-gray/40 border-transparent text-gray-300 hover:bg-brand-light-gray"
              }`}
              title={url}
            >
              {url}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}