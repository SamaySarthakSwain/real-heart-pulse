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
  fillWidth?: boolean;
  gradcamAttribution?: number[] | null;
  enableAiVision?: boolean;
}

/**
 * Canvas waveform driven by requestAnimationFrame reading a ring buffer directly.
 * Features AI Vision (1D Grad-CAM glowing heatmap) to highlight cardiac pathology beats.
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
  fillWidth = false,
  gradcamAttribution = null,
  enableAiVision = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const styles = getComputedStyle(canvas);
    const gridColor = styles.getPropertyValue("--signal-grid").trim() || "#222";
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

      // Hospital ECG Grid Styling
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
          const timeMin = points[0]?.[0] ?? now;
          const timeSpanMs = fillWidth ? Math.max(now - timeMin, 1) : windowMs;

          const nPoints = points.length;
          const camLen = gradcamAttribution?.length || 0;

          // Render waveform with segment-level AI Vision color attribution
          for (let i = 0; i < nPoints - 1; i++) {
            const [t0, v0] = points[i];
            const [t1, v1] = points[i + 1];

            const x0 = fillWidth
              ? ((t0 - timeMin) / timeSpanMs) * width
              : width - ((now - t0) / timeSpanMs) * width;
            const y0 = height - 8 - ((v0 - min) / span) * (height - 16);

            const x1 = fillWidth
              ? ((t1 - timeMin) / timeSpanMs) * width
              : width - ((now - t1) / timeSpanMs) * width;
            const y1 = height - 8 - ((v1 - min) / span) * (height - 16);

            // Determine if this point has high Grad-CAM attribution
            let segColor = strokeColor;
            let segWidth = 1.6;
            ctx.shadowBlur = 0;

            if (enableAiVision && camLen > 0) {
              const camIdx = Math.floor((i / nPoints) * camLen);
              const attr = gradcamAttribution![camIdx] ?? 0;
              if (attr > 0.65) {
                segColor = "#ef4444"; // High Risk Red Glow
                segWidth = 2.4;
                ctx.shadowColor = "#ef4444";
                ctx.shadowBlur = 8;
              } else if (attr > 0.35) {
                segColor = "#f59e0b"; // Moderate Amber
                segWidth = 2.0;
                ctx.shadowColor = "#f59e0b";
                ctx.shadowBlur = 4;
              }
            }

            ctx.strokeStyle = segColor;
            ctx.lineWidth = segWidth;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
          }
          ctx.shadowBlur = 0; // Reset blur
        }
      }

      if (!paused) frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [buffer, color, height, windowSeconds, paused, gradcamAttribution, enableAiVision]);

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
