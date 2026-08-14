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
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
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
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Web Serial API Powered
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Real-Time <br/>
                <span className="gradient-text-primary">Heart Monitoring</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto lg:mx-0 leading-relaxed">
                Stream biomedical signals directly from your ESP32 hardware to the browser. Zero cloud dependencies. Complete privacy.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/dashboard"
                  className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-1 hover:shadow-primary/25 hover:bg-primary/90 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative">Launch Dashboard</span>
                  <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/hardware"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-accent hover:-translate-y-1"
                >
                  Setup Hardware
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
              Seamlessly bridge the gap between physical sensors and digital analysis using standard Web protocols.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          <ScrollReveal delay={100} className="glass-card gradient-border rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-1/10 rounded-bl-full blur-2xl group-hover:bg-chart-1/20 transition-colors" />
            <div className="w-14 h-14 bg-background rounded-2xl border flex items-center justify-center text-2xl mb-6 shadow-sm">
              🔌
            </div>
            <h3 className="text-xl font-semibold mb-3">1. Hardware Capture</h3>
            <p className="text-muted-foreground leading-relaxed">
              MAX30102 and AD8232 sensors capture raw photoplethysmogram (PPG) and electrocardiogram (ECG) data.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200} className="glass-card gradient-border rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full blur-2xl group-hover:bg-primary/20 transition-colors" />
            <div className="w-14 h-14 bg-background rounded-2xl border flex items-center justify-center text-2xl mb-6 shadow-sm">
              ⚡
            </div>
            <h3 className="text-xl font-semibold mb-3">2. ESP32 Processing</h3>
            <p className="text-muted-foreground leading-relaxed">
              The microcontroller performs initial noise filtering, peak detection, and formats the data for serial transmission.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300} className="glass-card gradient-border rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/10 rounded-bl-full blur-2xl group-hover:bg-chart-2/20 transition-colors" />
            <div className="w-14 h-14 bg-background rounded-2xl border flex items-center justify-center text-2xl mb-6 shadow-sm">
              💻
            </div>
            <h3 className="text-xl font-semibold mb-3">3. Web Serial UI</h3>
            <p className="text-muted-foreground leading-relaxed">
              The browser securely connects to the USB port, parsing the stream at 115200 baud to render live 60fps charts.
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
                Our system goes beyond raw data visualization. By analyzing patterns in your Blood Oxygen (SpO₂) and Heart Rate Variability (HRV), the dashboard calculates real-time risk scores.
              </p>
              
              <ul className="space-y-5 mb-8">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-status-ok/10 flex items-center justify-center text-status-ok border border-status-ok/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Good Range (0-30%)</h4>
                    <p className="text-sm text-muted-foreground mt-1">Normal sinus rhythm, healthy oxygen saturation (&gt;95%), and steady variability.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Elevated Risk (&gt;70%)</h4>
                    <p className="text-sm text-muted-foreground mt-1">Detects prolonged hypoxia, extreme bradycardia/tachycardia, or erratic inter-beat intervals.</p>
                  </div>
                </li>
              </ul>
              
              <Link
                to="/analysis"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                View Risk Analysis Module
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </ScrollReveal>
            
            <ScrollReveal delay={200} className="relative min-h-[400px] h-full lg:h-auto overflow-hidden bg-black/10">
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

    </div>
  );
}
