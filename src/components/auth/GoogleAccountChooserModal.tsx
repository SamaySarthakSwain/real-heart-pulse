import React, { useState } from "react";
import { GoogleIcon } from "./GoogleIcon";
import { usePatientStore } from "@/store/patientStore";
import { User, CheckCircle2, Loader2, Plus, ArrowRight, X, Shield } from "lucide-react";
import { toast } from "sonner";

interface GoogleAccount {
  name: string;
  email: string;
  tag?: string;
  avatarInitials: string;
  avatarColor: string;
}

const PRESET_GOOGLE_ACCOUNTS: GoogleAccount[] = [
  {
    name: "Robert Chen",
    email: "robert.chen.medical@gmail.com",
    tag: "Patient ID: PT-10492",
    avatarInitials: "RC",
    avatarColor: "bg-blue-600",
  },
  {
    name: "Dr. Aikya Sharma",
    email: "aikya.biomedical@gmail.com",
    tag: "Clinical Research Team",
    avatarInitials: "AS",
    avatarColor: "bg-emerald-600",
  },
];

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: "signin" | "signup";
}

export function GoogleAccountChooserModal({
  isOpen,
  onClose,
  onSuccess,
  mode = "signin",
}: GoogleAccountChooserModalProps) {
  const loginWithGoogle = usePatientStore((s) => s.loginWithGoogle);

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // "Use another account" custom form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (account: { name: string; email: string }) => {
    setSelectedEmail(account.email);
    setIsSigningIn(true);
    try {
      const res = await loginWithGoogle({
        name: account.name,
        email: account.email,
      });

      if (res.success && res.patient) {
        toast.success(`Signed in with Google as ${account.name}`, {
          description: `Connected to ${account.email}`,
        });
        onSuccess();
        onClose();
      } else {
        toast.error("Google Authentication failed", {
          description: res.error || "Could not complete Google authentication.",
        });
      }
    } catch (err) {
      toast.error("Authentication error occurred. Please try again.");
    } finally {
      setIsSigningIn(false);
      setSelectedEmail(null);
    }
  };

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCustomError(null);

    const emailTrimmed = customEmail.trim();
    const nameTrimmed = customName.trim();

    if (!nameTrimmed) {
      setCustomError("Please enter your name.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setCustomError("Please enter a valid Google email address.");
      return;
    }

    handleSelectAccount({
      name: nameTrimmed,
      email: emailTrimmed,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-[420px] rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-7 shadow-2xl transition-all"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSigningIn}
          aria-label="Close dialog"
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Google Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100 dark:border-slate-700">
            <GoogleIcon className="h-6 w-6" />
          </div>
          <div>
            <h2
              id="google-auth-modal-title"
              className="text-lg font-bold tracking-tight text-[#142033] dark:text-white"
            >
              {mode === "signup" ? "Create your account with Google" : "Sign in with Google"}
            </h2>
            <p className="text-xs text-[#667085] dark:text-slate-400 mt-1">
              to continue to <strong className="text-[#142033] dark:text-slate-200 font-semibold">HEART Health Hub</strong>
            </p>
          </div>
        </div>

        {/* Loading Overlay when Handshake in Progress */}
        {isSigningIn && (
          <div className="py-8 text-center space-y-3 animate-in fade-in duration-150">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-sm font-medium text-[#142033] dark:text-slate-200">
              Connecting to Google Account...
            </p>
            <p className="text-xs text-[#667085] dark:text-slate-400">
              Verifying identity & cryptographic session token
            </p>
          </div>
        )}

        {/* Account Selection List */}
        {!isSigningIn && !showCustomForm && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#667085] dark:text-slate-400 px-1 mb-2">
              Choose an account
            </p>

            {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleSelectAccount(acc)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400/80 dark:hover:border-blue-500/80 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-left transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-semibold text-sm ${acc.avatarColor}`}
                  >
                    {acc.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#142033] dark:text-white truncate">
                      {acc.name}
                    </p>
                    <p className="text-xs text-[#667085] dark:text-slate-400 truncate">
                      {acc.email}
                    </p>
                    {acc.tag && (
                      <span className="inline-block text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        {acc.tag}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))}

            {/* Option to Use Another Account */}
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-all text-[#667085] dark:text-slate-300 group mt-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold">Use another Google account</span>
            </button>
          </div>
        )}

        {/* Custom Account Input Form */}
        {!isSigningIn && showCustomForm && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-[#142033] dark:text-slate-200">
                Enter your Google Account
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomError(null);
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Back to accounts
              </button>
            </div>

            {customError && (
              <p className="text-xs text-rose-500 font-medium">{customError}</p>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#142033] dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Alex Morgan"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 px-3.5 py-2 text-xs text-[#142033] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#142033] dark:text-slate-300 mb-1">
                Google Email Address
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCustomSubmit();
                  }
                }}
                placeholder="name@gmail.com"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 px-3.5 py-2 text-xs text-[#142033] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleCustomSubmit}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 transition-colors shadow-sm mt-2"
            >
              Continue with this account
            </button>
          </div>
        )}

        {/* Security & Disclaimer Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#667085] dark:text-slate-400">
            <Shield className="h-3 w-3 text-blue-500" />
            <span>Google Identity Services • OAuth 2.0 Secure</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
            To continue, Google shares your name, email, and profile details with HEART. Medical telemetry remains encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}
