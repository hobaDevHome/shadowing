import { History, X } from "lucide-react";

interface HistoryPanelProps {
  history: string[];
  currentUrl: string;
  onSelect: (url: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryPanel({ history, currentUrl, onSelect, isOpen, onClose }: HistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-brand-gray border border-brand-light-gray max-w-md w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[70vh]">
        <div className="flex items-center justify-between border-b border-brand-light-gray/40 pb-3">
          <h3 className="font-bold text-white text-md flex items-center gap-2">
            <History className="w-5 h-5 text-brand-green" />
            <span>URL History</span>
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {history.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">No videos loaded yet.</p>
          )}
          {history.map((url) => (
            <button
              key={url}
              onClick={() => { onSelect(url); onClose(); }}
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
      </div>
    </div>
  );
}