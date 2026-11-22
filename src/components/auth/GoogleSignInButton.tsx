import React, { useState } from "react";
import { GoogleIcon } from "./GoogleIcon";
import { GoogleAccountChooserModal } from "./GoogleAccountChooserModal";
import { soundFx } from "@/services/audio/soundFx";

interface GoogleSignInButtonProps {
  onSuccess: () => void;
  mode?: "signin" | "signup";
  className?: string;
  disabled?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  mode = "signin",
  className = "",
  disabled = false,
}: GoogleSignInButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const label = mode === "signup" ? "Sign up with Google" : "Sign in with Google";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          soundFx.playSatisfyingPop();
          setIsModalOpen(true);
        }}
        disabled={disabled}
        aria-label={label}
        className={`group relative w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-white dark:bg-[#1A2639]/90 py-2.5 px-4 text-sm font-medium text-[#1F2937] dark:text-slate-100 shadow-sm hover:bg-slate-50 dark:hover:bg-[#1E2C42] hover:border-slate-400 dark:hover:border-slate-600 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        <GoogleIcon className="h-4 w-4 shrink-0" />
        <span className="font-semibold text-xs sm:text-sm tracking-tight">{label}</span>
      </button>

      {/* Account Chooser Modal Dialog */}
      <GoogleAccountChooserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onSuccess}
        mode={mode}
      />
    </>
  );
}
