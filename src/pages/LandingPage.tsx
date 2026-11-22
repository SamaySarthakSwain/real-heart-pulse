import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
/**
 * ScrollReveal component wrapper that applies the slide-in-up animation
 * only when the element scrolls into view.
 */
function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function AutoPlayVideoOnScroll({ src, playbackRate }: { src: string; playbackRate: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          videoRef.current?.play().catch(console.error);
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.5 },
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className="w-full rounded-[2rem] aspect-video object-cover"
      controls
      loop
      muted
      playsInline
      onCanPlay={(e) => {
        e.currentTarget.playbackRate = playbackRate;
      }}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

export function LandingPage() {
  return (
    <div className="flex flex-col gap-24 pb-20 overflow-x-hidden">
      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-10">
        {/* Background ambient glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-chart-2/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="container px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold tracking-wider uppercase font-mono shadow-sm" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                REC NIST Clean-Tech · Continuous Telemetry
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]">
                HEART <br />
                <span className="gradient-text-primary">Clinical Edge AI</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto lg:mx-0 leading-relaxed">
                Hospital-grade auricular biopotential telemetry streaming synchronous AD8232 ECG, MAX30102 PPG, and real-time deep learning inference. Zero cloud dependencies. Finite-sample safety guarantees.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/dashboard"
                  className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/30 hover:bg-primary/95 overflow-hidden"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 10px 24px rgba(0, 180, 150, 0.22)" }}
                >
                  <div className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative">Launch Clinical Dashboard</span>
                  <svg
                    className="w-5 h-5 relative group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  to="/hardware"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 px-8 py-4 text-base font-semibold text-foreground transition-all duration-300 hover:bg-accent hover:-translate-y-1 hover:border-primary/40"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)" }}
                >
                  Setup Hardware Hub
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} className="relative mx-auto w-full max-w-[500px] aspect-square">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
            <img
              src="/images/hero-heart-3d.png"
              alt="3D High-Tech Heart"
              className="relative z-10 w-full h-full object-cover animate-slide-in-up drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ── THE PROCESS SECTION ────────────────────────────────────────────────── */}
      <section className="container px-4 md:px-6 relative">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it Works</h2>
            <p className="text-muted-foreground text-lg">
              Seamlessly bridge the gap between physical sensors and digital analysis using standard
              Web protocols.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          <ScrollReveal
            delay={100}
            className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl border border-primary/20 flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-105 transition-transform">
              🔌
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-semibold">STAGE 01</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Hardware Capture</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Tragus-earlobe-canal montage acquires differential biopotentials via AD8232 (G=100) and pulsatile capillary volume via dual-wavelength MAX30102.
            </p>
          </ScrollReveal>

          <ScrollReveal
            delay={200}
            className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl border border-primary/20 flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-semibold">STAGE 02</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">ESP32 Edge Processing</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Zero-phase 4th-order Butterworth bandpass (0.5–40 Hz), 2nd-order notch filtering, and multi-parameter SQI gating (K_SQI, P_SQI) on dual-core Xtensa.
            </p>
          </ScrollReveal>

          <ScrollReveal
            delay={300}
            className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl border border-primary/20 flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:scale-105 transition-transform">
              💻
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-semibold">STAGE 03</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Web Serial UI & Edge AI</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Browser-native 115200 baud streaming renders 60fps waveforms with SE-ResNet-BiGRU arrhythmia detection and inductive conformal uncertainty safety bounds.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── PREDICTION & ANALYSIS SECTION ──────────────────────────────────────── */}
      <section className="container px-4 md:px-6">
        <div className="glass-card rounded-[2.5rem] overflow-hidden border-border/50 bg-accent/20">
          <div className="grid lg:grid-cols-2 items-stretch">
            <ScrollReveal className="p-10 md:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-chart-5/10 border border-chart-5/20 text-chart-5 text-sm font-semibold tracking-wide w-fit">
                AI & Analysis
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Heart Disease Prediction
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Our system goes beyond raw data visualization. By analyzing patterns in your Blood
                Oxygen (SpO₂) and Heart Rate Variability (HRV), the dashboard calculates real-time
                risk scores.
              </p>

              <ul className="space-y-5 mb-8">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-status-ok/10 flex items-center justify-center text-status-ok border border-status-ok/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Good Range (0-30%)</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Normal sinus rhythm, healthy oxygen saturation (&gt;95%), and steady
                      variability.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Elevated Risk (&gt;70%)</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Detects prolonged hypoxia, extreme bradycardia/tachycardia, or erratic
                      inter-beat intervals.
                    </p>
                  </div>
                </li>
              </ul>

              <Link
                to="/analysis"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                View Risk Analysis Module
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </ScrollReveal>

            <ScrollReveal
              delay={200}
              className="relative min-h-[400px] h-full lg:h-auto overflow-hidden bg-black/10"
            >
              <img
                src="/images/data-stream-3d.png"
                alt="3D Medical Data Stream"
                className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-screen"
              />
              {/* Overlay gradient to blend edge */}
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-transparent hidden lg:block" />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── VIDEO PROCESS SECTION ────────────────────────────────────────────────── */}
      <section className="container px-4 md:px-6 relative pb-10">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See The Process In Action</h2>
            <p className="text-muted-foreground text-lg">
              Watch how HEART captures, processes, and analyzes data seamlessly.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="relative max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden border-border/50 shadow-2xl glass-card p-2 md:p-4 bg-accent/10">
            <AutoPlayVideoOnScroll src="/videos/process-video.mp4" playbackRate={0.5} />
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
