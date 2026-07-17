import { useState, useEffect, useCallback } from "react";

export function useUrlHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]));
  }, []);

  const addUrl = useCallback((url: string) => {
    setHistory((prev) => (prev.includes(url) ? prev : [url, ...prev]));
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setHistory(data))
      .catch(() => {});
  }, []);

  return { history, addUrl };
}