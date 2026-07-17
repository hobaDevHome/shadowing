import { useState, useEffect, useCallback } from "react";

export interface AbSegment {
  id: string;
  start: number;
  end: number;
  repeatMode: "infinite" | "x3" | "x5" | "custom";
  customCount?: number;
}

export interface HistoryRecord {
  url: string;
  segments: AbSegment[];
}

export function useUrlHistory() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]));
  }, []);

  const sync = useCallback((url: string, segments?: AbSegment[]) => {
    setHistory((prev) => {
      const idx = prev.findIndex((r) => r.url === url);
      if (idx === -1) {
        return [{ url, segments: segments || [] }, ...prev];
      }
      const existing = prev[idx];
      const updated = {
        url,
        segments: segments !== undefined ? segments : existing.segments,
      };
      return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });

    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, segments }),
    })
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setHistory(data))
      .catch(() => {});
  }, []);

  const addUrl = useCallback((url: string) => sync(url), [sync]);
  const saveSegments = useCallback(
    (url: string, segments: AbSegment[]) => sync(url, segments),
    [sync],
  );

  return { history, addUrl, saveSegments };
}