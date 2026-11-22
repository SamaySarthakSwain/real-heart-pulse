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
 * Hospital-Grade Real-Time Animated Waveform Chart
 * Features:
 * - Fluid wall-clock scrolling that never freezes or stops in the middle
 * - Sub-pixel cubic/quadratic Bézier spline curve interpolation
 * - Smooth exponential vertical autoscaling with DC-offset tracking
 * - Translucent volume fill gradient under the plethysmogram
 * - Neon glow with animated leading-edge pulse beacon
 * - AI Vision (1D Grad-CAM glowing heatmap) support for ECG
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

  // Vertical scale smoothing refs to eliminate jerky jumps
  const minSmoothedRef = useRef<number>(0);
  const maxSmoothedRef = useRef<number>(100);
  const scaleInitializedRef = useRef<boolean>(false);

  // Sweeper / scanning radar line ref
  const sweepPosRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const styles = getComputedStyle(canvas);
    const gridColor = styles.getPropertyValue("--signal-grid").trim() || "rgba(29, 178, 186, 0.12)";
    const rawStroke = styles.getPropertyValue(color).trim() || "#3885F2";

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      if (width <= 0) {
        if (!paused) frameRef.current = requestAnimationFrame(draw);
        return;
      }

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // -----------------------------------------------------------------------
      // 1. Hospital Calibrated Grid (Millimeter Paper Aesthetic)
      // -----------------------------------------------------------------------
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Fine vertical grid
      const vSpacing = width / 12;
      for (let x = 0; x <= width; x += vSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      // Fine horizontal grid
      const hSpacing = height / 5;
      for (let y = 0; y <= height; y += hSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Sweeper animation across the grid
      sweepPosRef.current = (sweepPosRef.current + 0.8) % width;
      const sweepGradient = ctx.createLinearGradient(
        sweepPosRef.current - 40,
        0,
        sweepPosRef.current,
        0
      );
      sweepGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      sweepGradient.addColorStop(1, "rgba(255, 255, 255, 0.04)");
      ctx.fillStyle = sweepGradient;
      ctx.fillRect(sweepPosRef.current - 40, 0, 40, height);

      const size = buffer.size;
      const wallNow = Date.now();
      const windowMs = windowSeconds * 1000;

      // -----------------------------------------------------------------------
      // 2. Waveform Extraction & Smooth Timing Alignment
      // -----------------------------------------------------------------------
      if (size > 1 && hasData) {
        const lastBufferTime = buffer.timeAt(size - 1);
        // Synchronize render time with wall clock to ensure smooth forward progression
        const elapsedSinceLast = Math.max(0, wallNow - lastBufferTime);
        const renderNow = lastBufferTime + Math.min(elapsedSinceLast, 3000);

        let targetMin = Infinity;
        let targetMax = -Infinity;
        const validPoints: Array<{ t: number; v: number }> = [];

        for (let i = 0; i < size; i++) {
          const t = buffer.timeAt(i);
          // Only discard points older than windowMs
          if (renderNow - t > windowMs + 200) continue;
          const v = buffer.at(i);
          if (!Number.isFinite(v) || v <= 0) continue;

          if (v < targetMin) targetMin = v;
          if (v > targetMax) targetMax = v;
          validPoints.push({ t, v });
        }

        if (validPoints.length >= 2 && Number.isFinite(targetMin) && Number.isFinite(targetMax)) {
          // Dynamic vertical autoscaling with exponential smoothing
          if (!scaleInitializedRef.current) {
            minSmoothedRef.current = targetMin;
            maxSmoothedRef.current = targetMax;
            scaleInitializedRef.current = true;
          } else {
            minSmoothedRef.current += (targetMin - minSmoothedRef.current) * 0.12;
            maxSmoothedRef.current += (targetMax - maxSmoothedRef.current) * 0.12;
          }

          // Ensure minimum amplitude span (at least 20 counts) to prevent flatline amplification
          const currentMin = minSmoothedRef.current;
          const currentMax = Math.max(maxSmoothedRef.current, currentMin + 20);
          const span = currentMax - currentMin || 1;

          // Compute screen X/Y coordinates
          const timeMin = validPoints[0]!.t;
          const timeSpanMs = fillWidth ? Math.max(renderNow - timeMin, 100) : windowMs;
          const paddingY = 12;
          const drawHeight = height - paddingY * 2;

          const screenPoints: Array<{ x: number; y: number; origIdx: number }> = [];
          for (let i = 0; i < validPoints.length; i++) {
            const pt = validPoints[i]!;
            const x = fillWidth
              ? ((pt.t - timeMin) / timeSpanMs) * width
              : width - ((renderNow - pt.t) / timeSpanMs) * width;
            const y = height - paddingY - ((pt.v - currentMin) / span) * drawHeight;
            screenPoints.push({ x, y, origIdx: i });
          }

          const n = screenPoints.length;
          const camLen = gradcamAttribution?.length || 0;

          // -------------------------------------------------------------------
          // 3. Translucent Volume Fill Gradient Under Curve
          // -------------------------------------------------------------------
          if (n >= 2) {
            const fillGradient = ctx.createLinearGradient(0, paddingY, 0, height);
            fillGradient.addColorStop(0, hexToRgba(rawStroke, 0.22));
            fillGradient.addColorStop(0.7, hexToRgba(rawStroke, 0.06));
            fillGradient.addColorStop(1, hexToRgba(rawStroke, 0.0));

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(screenPoints[0]!.x, height);
            ctx.lineTo(screenPoints[0]!.x, screenPoints[0]!.y);

            // Smooth cubic/quadratic curve through points
            for (let i = 0; i < n - 1; i++) {
              const p0 = screenPoints[i]!;
              const p1 = screenPoints[i + 1]!;
              const midX = (p0.x + p1.x) / 2;
              const midY = (p0.y + p1.y) / 2;
              ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
            }
            ctx.lineTo(screenPoints[n - 1]!.x, screenPoints[n - 1]!.y);
            ctx.lineTo(screenPoints[n - 1]!.x, height);
            ctx.closePath();
            ctx.fillStyle = fillGradient;
            ctx.fill();
            ctx.restore();
          }

          // -------------------------------------------------------------------
          // 4. Luminous Neon Path Rendering (with Grad-CAM support)
          // -------------------------------------------------------------------
          ctx.save();
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          for (let i = 0; i < n - 1; i++) {
            const p0 = screenPoints[i]!;
            const p1 = screenPoints[i + 1]!;

            let segColor = rawStroke;
            let segWidth = 2.2;
            let segGlow = 6;

            if (enableAiVision && camLen > 0) {
              const camIdx = Math.floor((i / n) * camLen);
              const attr = gradcamAttribution![camIdx] ?? 0;
              if (attr > 0.65) {
                segColor = "#ef4444";
                segWidth = 2.8;
                segGlow = 10;
              } else if (attr > 0.35) {
                segColor = "#f59e0b";
                segWidth = 2.4;
                segGlow = 8;
              }
            }

            ctx.strokeStyle = segColor;
            ctx.lineWidth = segWidth;
            ctx.shadowColor = segColor;
            ctx.shadowBlur = segGlow;

            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;
            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
          ctx.restore();

          // -------------------------------------------------------------------
          // 5. Leading-Edge Animated Pulsing Beacon
          // -------------------------------------------------------------------
          const latestPoint = screenPoints[n - 1]!;
          if (latestPoint && latestPoint.x <= width + 5) {
            const pulse = (Math.sin(wallNow * 0.007) + 1) / 2; // 0 to 1
            const radarRadius = 4 + pulse * 6;

            ctx.save();
            // Outer radar pulse ring
            ctx.beginPath();
            ctx.arc(latestPoint.x, latestPoint.y, radarRadius, 0, Math.PI * 2);
            ctx.strokeStyle = hexToRgba(rawStroke, 0.45 * (1 - pulse));
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Core bright beacon
            ctx.beginPath();
            ctx.arc(latestPoint.x, latestPoint.y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = rawStroke;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
          }
        }
      } else {
        // ---------------------------------------------------------------------
        // 6. Calibrated Idle Medical Baseline Animation (Waiting for Contact)
        // ---------------------------------------------------------------------
        const midY = height / 2;
        ctx.save();
        ctx.strokeStyle = hexToRgba(rawStroke, 0.25);
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 6]);

        // Gentle animated traveling pulse wave across the idle baseline
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const wavePhase = (x - (wallNow * 0.04) % width) / 40;
          const yOffset = Math.sin(wavePhase) * (x > width * 0.3 && x < width * 0.7 ? 3 : 0);
          if (x === 0) ctx.moveTo(x, midY + yOffset);
          else ctx.lineTo(x, midY + yOffset);
        }
        ctx.stroke();
        ctx.restore();
      }

      if (!paused) frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [buffer, color, height, windowSeconds, paused, gradcamAttribution, enableAiVision, hasData, fillWidth]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-background/40">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${label} waveform from the ESP32`}
        style={{ width: "100%", height }}
      />
      {!hasData && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 backdrop-blur-[1px] bg-background/20 select-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-border/60 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <p className="text-xs font-medium text-muted-foreground">{emptyMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Utility to convert Hex or named color to RGBA string with custom alpha.
 */
function hexToRgba(colorStr: string, alpha: number): string {
  if (!colorStr) return `rgba(56, 189, 248, ${alpha})`;
  if (colorStr.startsWith("#")) {
    const hex = colorStr.replace("#", "");
    if (hex.length === 3) {
      const r = parseInt(hex[0]! + hex[0]!, 16);
      const g = parseInt(hex[1]! + hex[1]!, 16);
      const b = parseInt(hex[2]! + hex[2]!, 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  if (colorStr.startsWith("rgb")) {
    return colorStr.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }
  return `rgba(56, 189, 248, ${alpha})`;
}
