import React from "react";
import {
  Activity,
  Sparkles,
  ShieldCheck,
  Heart,
  Lock,
  CheckCircle,
} from "lucide-react";
import { AuthWaveformGraphic } from "./AuthWaveformGraphic";

interface AuthLayoutProps {
  children: React.ReactNode;
  mode: "login" | "register" | "forgot";
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, mode, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-[calc(100vh-65px)] bg-[#F3F6F9] dark:bg-[#0D1526] text-[#142033] dark:text-slate-100 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/6 -z-10 h-96 w-96 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 -z-10 h-96 w-96 rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-[120px] pointer-events-none" />

      {/* Main Container - Split-screen on desktop */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ── LEFT SECTION — BRANDING ────────────────────────────────────────── */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-7 py-2 lg:py-6">
          {/* Badge & Project Brand */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-[#FF6B00] dark:text-[#FF8A00] shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[#FF6B00] animate-pulse" />
              <span>Ear-to-Heart Health Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#142033] dark:text-white leading-[1.15]">
              Your Heart Health, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] bg-clip-text text-transparent">
                Connected.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#667085] dark:text-slate-300 leading-relaxed max-w-lg">
              Securely access your cardiac health reports, real-time monitoring, and AI-powered heart health insights.
            </p>
          </div>

          {/* Medical ECG Waveform Graphic (Hidden on small mobile to reduce clutter) */}
          <div className="hidden sm:block">
            <AuthWaveformGraphic />
          </div>

          {/* Three Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#142033]/70 p-3.5 backdrop-blur-md shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 text-[#FF6B00] mb-2.5">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#142033] dark:text-white">
                Real-Time Cardiac Monitoring
              </h3>
              <p className="mt-1 text-[11px] text-[#667085] dark:text-slate-400 leading-snug">
                Sub-millisecond biosensor telemetry & live rhythm stream.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#142033]/70 p-3.5 backdrop-blur-md shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 mb-2.5">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#142033] dark:text-white">
                AI-Powered Risk Assessment
              </h3>
              <p className="mt-1 text-[11px] text-[#667085] dark:text-slate-400 leading-snug">
                1D-CNN arrhythmia screening & ischemic early alerts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#142033]/70 p-3.5 backdrop-blur-md shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 mb-2.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#142033] dark:text-white">
                Secure Patient Records
              </h3>
              <p className="mt-1 text-[11px] text-[#667085] dark:text-slate-400 leading-snug">
                Encrypted clinical history with isolated patient access.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT SECTION — AUTHENTICATION CARD ──────────────────────────── */}
        <div className="lg:col-span-6 flex justify-center items-center w-full">
          <div className="w-full max-w-[460px] rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-6 sm:p-9 shadow-xl shadow-slate-200/50 dark:shadow-black/40 backdrop-blur-xl transition-all">
            {/* Card Top: Minimal Heart Pulse Logo & Header */}
            <div className="text-center space-y-3 mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8A00] text-white shadow-lg shadow-orange-500/25 ring-4 ring-orange-500/10">
                <Heart className="h-6 w-6 fill-white stroke-white" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#142033] dark:text-white">
                  {title}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#667085] dark:text-slate-300">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Interactive Form Component (Login / Register / Forgot) */}
            <div className="relative">
              {children}
            </div>

            {/* Healthcare Security Notice & Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#667085] dark:text-slate-400 font-medium">
                <Lock className="h-3 w-3 text-emerald-500" />
                <span>256-Bit SSL Encryption • HIPAA Compliant Architecture</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                Your medical data is protected with end-to-end security. By continuing, you agree to our{" "}
                <a href="#privacy" className="underline hover:text-[#FF6B00]">Privacy Policy</a>{" "}
                and{" "}
                <a href="#terms" className="underline hover:text-[#FF6B00]">Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
