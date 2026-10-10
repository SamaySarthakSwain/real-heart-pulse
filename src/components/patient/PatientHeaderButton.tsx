import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, User, FileText, ChevronDown, Activity } from "lucide-react";
import { usePatientStore } from "@/store/patientStore";
import { useState, useRef, useEffect } from "react";

export function PatientHeaderButton() {
  const currentPatient = usePatientStore((s) => s.getCurrentPatient());
  const logout = usePatientStore((s) => s.logout);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentPatient) {
    return (
      <Link
        to="/login"
        className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition-all duration-200 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/35 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label="Patient Login"
      >
        <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        <span>Login</span>
      </Link>
    );
  }

  // If patient is logged in: show active patient badge with quick dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="inline-flex items-center gap-2.5 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-sm font-medium text-foreground transition-all hover:bg-orange-500/15 hover:border-orange-500/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-expanded={dropdownOpen}
        aria-label="Patient Account Menu"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-bold text-white shadow-sm">
          {currentPatient.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col text-left leading-tight hidden sm:flex">
          <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
            {currentPatient.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {currentPatient.age}y • {currentPatient.gender}
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="border-b border-border/60 px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground">{currentPatient.name}</p>
            <p className="text-[11px] text-muted-foreground font-mono">{currentPatient.id}</p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Patient Session</span>
            </div>
          </div>

          <div className="py-1 space-y-0.5">
            <Link
              to="/patient"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <User className="h-4 w-4 text-orange-500" />
              <span>Patient Profile & Details</span>
            </Link>

            <Link
              to="/patient"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span>Past Testing Records</span>
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>Live Biometric Stream</span>
            </Link>
          </div>

          <div className="border-t border-border/60 pt-1">
            <button
              onClick={() => {
                logout();
                setDropdownOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
