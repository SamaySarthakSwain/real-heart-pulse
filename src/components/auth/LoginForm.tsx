import React, { useState } from "react";
import { User, AlertCircle, Loader2, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { usePatientStore } from "@/store/patientStore";

interface LoginFormProps {
  onNavigateToRegister: () => void;
  onNavigateToForgot: () => void;
  onSuccess: () => void;
}

export function LoginForm({
  onNavigateToRegister,
  onNavigateToForgot,
  onSuccess,
}: LoginFormProps) {
  const authenticatePatient = usePatientStore((s) => s.authenticatePatient);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) {
      errors.identifier = "Please enter your email, username, or patient ID.";
    }
    if (!password) {
      errors.password = "Please enter your password.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authenticatePatient({
        identifier: identifier.trim(),
        password,
        rememberMe,
      });

      if (res.success) {
        onSuccess();
      } else {
        setErrorMessage(
          res.error || "Invalid credentials. Please verify your identifier and password."
        );
      }
    } catch (err) {
      setErrorMessage("Authentication failed due to a network or server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Top Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in duration-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold block">Authentication Issue</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Field 1: Identifier */}
      <div className="space-y-1.5">
        <label
          htmlFor="auth-identifier"
          className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
        >
          Email, Username, or Patient ID
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400">
            <User className="h-4 w-4" />
          </div>
          <input
            id="auth-identifier"
            type="text"
            name="username"
            autoComplete="username"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (fieldErrors.identifier) {
                setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
              }
            }}
            placeholder="Enter your email, username, or patient ID"
            disabled={isLoading}
            className={`w-full rounded-xl border ${
              fieldErrors.identifier
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"
            } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`}
          />
        </div>
        {fieldErrors.identifier && (
          <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1">
            {fieldErrors.identifier}
          </p>
        )}
      </div>

      {/* Field 2: Password */}
      <div className="space-y-1.5">
        <PasswordInput
          id="auth-password"
          name="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          placeholder="Enter your password"
          error={fieldErrors.password}
          disabled={isLoading}
        />
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none text-[#142033] dark:text-slate-300">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-[#D9E1EA] text-[#FF6B00] focus:ring-[#FF6B00] focus:ring-offset-0 transition-colors accent-[#FF6B00]"
          />
          <span className="font-medium text-[#667085] dark:text-slate-300">Remember me</span>
        </label>

        <button
          type="button"
          onClick={onNavigateToForgot}
          disabled={isLoading}
          className="font-medium text-[#FF6B00] hover:text-[#FF8A00] transition-colors focus:outline-none focus:underline"
        >
          Forgot Password?
        </button>
      </div>

      {/* Primary Sign In Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] py-3 px-4 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-[#E66000] hover:to-[#FF7A00] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      {/* Discreet Demo Account Helper for testing convenience */}
      <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-2.5 text-[11px] text-[#667085] dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-[#142033] dark:text-slate-200 mb-0.5">
          <KeyRound className="h-3 w-3 text-[#FF6B00]" />
          <span>Quick Clinic Demo Credentials:</span>
        </div>
        <p className="leading-relaxed">
          Identifier: <code className="font-mono text-[#142033] dark:text-slate-200 bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">PT-10492</code> or <code className="font-mono text-[#142033] dark:text-slate-200 bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">robert.chen</code> • Password: <code className="font-mono text-[#142033] dark:text-slate-200 bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">Heart@2026</code>
        </p>
      </div>

      {/* Registration Option */}
      <div className="pt-2 text-center text-xs text-[#667085] dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
        <span>Don't have an account? </span>
        <button
          type="button"
          onClick={onNavigateToRegister}
          disabled={isLoading}
          className="font-semibold text-[#FF6B00] hover:text-[#FF8A00] transition-colors focus:outline-none focus:underline"
        >
          Create an Account
        </button>
      </div>
    </form>
  );
}
