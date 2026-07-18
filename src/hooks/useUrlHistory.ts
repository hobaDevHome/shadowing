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

  const persist = useCallback(
    (url: string, segments: AbSegment[] | undefined, reorder: boolean) => {
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, segments, reorder }),
      })
        .then(async (r) => {
          if (!r.ok) {
            console.error("[history] save failed:", r.status, await r.text());
            return;
          }
          const data = await r.json();
          if (Array.isArray(data)) setHistory(data);
        })
        .catch((err) => console.error("[history] network error:", err));
    },
    [],
  );

  // Loading a URL — moves it to the top (most-recent-first)
  const addUrl = useCallback(
    (url: string) => {
      setHistory((prev) => {
        const idx = prev.findIndex((r) => r.url === url);
        if (idx === -1) return [{ url, segments: [] }, ...prev];
        const existing = prev[idx];
        return [existing, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
      });
      persist(url, undefined, true);
    },
    [persist],
  );

  // Saving segments for the currently loaded URL — keeps its position
  const saveSegments = useCallback(
    (url: string, segments: AbSegment[]) => {
      setHistory((prev) => {
        const idx = prev.findIndex((r) => r.url === url);
        if (idx === -1) return [{ url, segments }, ...prev];
        const updated = [...prev];
        updated[idx] = { url, segments };
        return updated;
      });
      persist(url, segments, false);
    },
    [persist],
  );

  const deleteUrl = useCallback((url: string) => {
    setHistory((prev) => prev.filter((r) => r.url !== url));
    fetch("/api/history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then(async (r) => {
        if (!r.ok) {
          console.error("[history] delete failed:", r.status, await r.text());
          return;
        }
        const data = await r.json();
        if (Array.isArray(data)) setHistory(data);
      })
      .catch((err) => console.error("[history] network delete error:", err));
  }, []);

  return { history, addUrl, saveSegments, deleteUrl };
}