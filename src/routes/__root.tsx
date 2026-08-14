import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider, useTheme, themeInitScript } from "../lib/theme";

/* ── 404 ─────────────────────────────────────────────────────────────────── */
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center animate-fade-in">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-7xl font-bold gradient-text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-lg"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Error ───────────────────────────────────────────────────────────────── */
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center animate-fade-in">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:scale-105"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Route definition ────────────────────────────────────────────────────── */
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ESP32 Health Monitor — AikyaNova Labs" },
      {
        name: "description",
        content: "Real-time ESP32 ECG, PPG, BPM and SpO₂ monitoring over Web Serial.",
      },
      { name: "author", content: "AikyaNova Labs" },
      { property: "og:title", content: "ESP32 Health Monitor" },
      {
        property: "og:description",
        content: "Hardware-only biomedical monitoring dashboard for ESP32 sensor streams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@AikyaNova" },
      { name: "theme-color", content: "#0d1526" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/* ── Shell (SSR wrapper) ─────────────────────────────────────────────────── */
function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Anti-FOUC: apply saved theme before any paint */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/* ── Heartbeat SVG Logo ───────────────────────────────────────────────────── */
function HeartbeatLogo() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-16 text-primary"
    >
      <polyline points="0,12 10,12 16,4 22,20 28,12 38,12 44,2 50,22 56,12 64,12" />
    </svg>
  );
}

/* ── Theme Toggle Button ─────────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:scale-110 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {theme === "dark" ? (
        /* Sun icon */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5 h-[18px] w-[18px]">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        /* Moon icon */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

/* ── Nav links config ────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { to: "/",            label: "Home",          icon: "🏠" },
  { to: "/dashboard",   label: "Dashboard",     icon: "📊" },
  { to: "/analysis",    label: "Risk Analysis", icon: "🔬" },
  { to: "/firmware",    label: "Firmware",      icon: "💾" },
  { to: "/hardware",    label: "Hardware",      icon: "🔌" },
  { to: "/diagnostics", label: "Diagnostics",   icon: "🛠" },
  { to: "/settings",    label: "Settings",      icon: "⚙️" },
] as const;

/* ── Mobile Menu ─────────────────────────────────────────────────────────── */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col`}
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-semibold text-foreground">Navigation</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "bg-primary/15 text-primary font-semibold" }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground transition-all hover:bg-accent"
              onClick={onClose}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border px-5 py-4">
          <p className="text-xs text-muted-foreground">AikyaNova Labs © 2025</p>
        </div>
      </div>
    </>
  );
}

/* ── Root component ───────────────────────────────────────────────────────── */
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppLayout />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          background: "var(--header-bg)",
          borderColor: "var(--glass-border)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">

          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="animate-heartbeat flex-shrink-0">
              <HeartbeatLogo />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.18em] text-primary/80 uppercase leading-none">
                AikyaNova Labs
              </p>
              <h1 className="text-sm font-semibold text-foreground truncate leading-tight mt-0.5">
                ESP32 Health Monitor
              </h1>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-1 text-sm">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{
                  className:
                    "bg-primary/12 text-primary font-medium shadow-sm",
                }}
                className="relative rounded-xl px-3.5 py-2 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Hamburger (mobile) */}
            <button
              className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
        {/* Required: nested routes render here */}
        <Outlet />
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2025 AikyaNova Labs — Research & monitoring use only.
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/60 tracking-widest uppercase">
            ESP32 Real-Time Health Monitor
          </p>
        </div>
      </footer>
    </div>
  );
}
