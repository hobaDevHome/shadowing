import { useEffect, useRef, useState } from "react";

export default function Waveform({ audioUrl }: { audioUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);

    (async () => {
      try {
        const res = await fetch(audioUrl);
        const arrayBuffer = await res.arrayBuffer();
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        if (cancelled) return;

        const raw = audioBuffer.getChannelData(0);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#34d399";

        const step = Math.floor(raw.length / width);
        for (let x = 0; x < width; x++) {
          let min = 1;
          let max = -1;
          for (let i = 0; i < step; i++) {
            const sample = raw[x * step + i] || 0;
            if (sample < min) min = sample;
            if (sample > max) max = sample;
          }
          const yMin = (1 + min) * (height / 2);
          const yMax = (1 + max) * (height / 2);
          ctx.fillRect(x, yMin, 1, Math.max(1, yMax - yMin));
        }

        audioCtx.close();
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [audioUrl]);

  if (failed) {
    return <p className="text-gray-500 text-xs text-center py-2">Couldn't render waveform.</p>;
  }

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={56}
      className="w-full h-[56px] rounded-lg bg-brand-dark"
    />
  );
}