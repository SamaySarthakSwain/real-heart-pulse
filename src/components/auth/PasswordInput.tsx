import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  id: string;
}

export function PasswordInput({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-xs font-semibold text-[#142033] dark:text-slate-200">
            {label}
          </label>
          {hint && <span className="text-[11px] text-[#667085] dark:text-slate-400">{hint}</span>}
        </div>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400">
          <Lock className="h-4 w-4" />
        </div>

        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className={`w-full rounded-xl border ${
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"
          } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-11 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all ${className}`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 p-1 rounded-lg text-[#667085] hover:text-[#142033] dark:text-slate-400 dark:hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1 animate-in fade-in duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
