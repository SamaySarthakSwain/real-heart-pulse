import React from "react";

export function AuthWaveformGraphic({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#142033]/60 p-5 backdrop-blur-md shadow-2xl ${className}`}>
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -left-12 h-36 w-36 rounded-full bg-[#FF6B00]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* Header Info */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8A00] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6B00]" />
          </span>
          <span className="text-xs font-mono font-medium tracking-wider text-slate-300 uppercase">
            Live Telemetry • Channel A1
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <span>72 BPM</span>
          <span className="text-slate-400">•</span>
          <span>99% SpO₂</span>
        </div>
      </div>

      {/* ECG Medical Waveform SVG */}
      <div className="relative z-10 h-28 w-full flex items-center">
        <svg
          viewBox="0 0 600 120"
          className="w-full h-full text-[#FF8A00]"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Subtle ghost trace line */}
          <path
            d="M0,60 L70,60 L85,45 L100,75 L115,60 L140,60 L155,20 L168,110 L182,5 L195,85 L210,60 L240,60 L260,52 L280,68 L300,60 L370,60 L385,45 L400,75 L415,60 L440,60 L455,20 L468,110 L482,5 L495,85 L510,60 L540,60 L560,52 L580,68 L600,60"
            stroke="rgba(255, 107, 0, 0.25)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Glowing ECG Trace */}
          <path
            d="M0,60 L70,60 L85,45 L100,75 L115,60 L140,60 L155,20 L168,110 L182,5 L195,85 L210,60 L240,60 L260,52 L280,68 L300,60 L370,60 L385,45 L400,75 L415,60 L440,60 L455,20 L468,110 L482,5 L495,85 L510,60 L540,60 L560,52 L580,68 L600,60"
            stroke="url(#ecgGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: "drop-shadow(0px 0px 6px rgba(255, 138, 0, 0.7))",
            }}
          />

          <defs>
            <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
              <stop offset="30%" stopColor="#FF8A00" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#FFA633" stopOpacity="1" />
              <stop offset="85%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Footer Metrics */}
      <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center font-mono text-[10px]">
        <div>
          <span className="text-slate-400 block">QRS Duration</span>
          <span className="text-white font-semibold">88 ms</span>
        </div>
        <div>
          <span className="text-slate-400 block">QT Interval</span>
          <span className="text-white font-semibold">395 ms</span>
        </div>
        <div>
          <span className="text-slate-400 block">Rhythm Quality</span>
          <span className="text-emerald-400 font-semibold">Optimal 98%</span>
        </div>
      </div>
    </div>
  );
}
