import { useEffect, useRef } from "react";
import type { RingBuffer } from "@/utils/buffers";

interface Props {
  buffer: RingBuffer;
  color: string;
  label: string;
  windowSeconds: number;
  height?: number;
  paused?: boolean;
  emptyMessage: string;
  hasData: boolean;
}

/**
 * Canvas waveform driven by requestAnimationFrame reading a ring buffer directly.
 * No React re-render per sample, and no point is ever generated locally —
 * it draws exactly the samples the ESP32 sent.
 */
export function WaveformChart({
  buffer,
  color,
  label,
  windowSeconds,
  height = 180,
  paused = false,
  emptyMessage,
  hasData,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const styles = getComputedStyle(canvas);
    const gridColor = styles.getPropertyValue("--signal-grid").trim() || "#333";
    const strokeColor = styles.getPropertyValue(color).trim() || "#0f0";

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += width / 10) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += height / 4) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      const size = buffer.size;
      if (size > 1) {
        const now = buffer.timeAt(size - 1);
        const windowMs = windowSeconds * 1000;
        let min = Infinity;
        let max = -Infinity;
        const points: Array<[number, number]> = [];
        for (let i = 0; i < size; i++) {
          const t = buffer.timeAt(i);
          if (now - t > windowMs) continue;
          const v = buffer.at(i);
          if (v < min) min = v;
          if (v > max) max = v;
          points.push([t, v]);
        }
        if (points.length > 1 && Number.isFinite(min) && Number.isFinite(max)) {
          const span = max - min || 1;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          points.forEach(([t, v], index) => {
            const x = width - ((now - t) / windowMs) * width;
            const y = height - 8 - ((v - min) / span) * (height - 16);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }
      }

      if (!paused) frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [buffer, color, height, windowSeconds, paused]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${label} waveform from the ESP32`}
        style={{ width: "100%", height }}
      />
      {!hasData && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}