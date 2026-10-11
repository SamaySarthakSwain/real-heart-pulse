import React, { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Send } from "lucide-react";
import { validateEmail } from "@/services/auth/authService";
import { usePatientStore } from "@/store/patientStore";

interface ForgotPasswordFormProps {
  onNavigateToLogin: () => void;
}

export function ForgotPasswordForm({ onNavigateToLogin }: ForgotPasswordFormProps) {
  const requestPasswordReset = usePatientStore((s) => s.requestPasswordReset);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      setIsSuccess(true);
      setSuccessMessage(
        res.message ||
          "If an account exists with this email address, password reset instructions have been sent. Please check your inbox and spam folder."
      );
    } catch {
      setEmailError("Unable to process password reset at this moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {isSuccess ? (
        <div className="space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-[#142033] dark:text-slate-100">
              Reset Request Dispatched
            </h3>
            <p className="text-xs text-[#667085] dark:text-slate-300 leading-relaxed px-2">
              {successMessage}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3 text-left text-[11px] text-[#667085] dark:text-slate-400 space-y-1">
            <span className="font-semibold text-[#142033] dark:text-slate-200 block">
              Security Notice:
            </span>
            <span>
              For your health data protection, reset tokens expire after 30 minutes. If you do not see the email, check your spam or junk folder.
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateToLogin}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-semibold text-[#142033] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Sign In</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="forgot-email"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="forgot-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="Enter your registered email address"
                disabled={isLoading}
                className={`w-full rounded-xl border ${
                  emailError
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"
                } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`}
              />
            </div>
            {emailError && (
              <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1">
                {emailError}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] py-3 px-4 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-[#E66000] hover:to-[#FF7A00] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Processing Request...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-[#667085] dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onNavigateToLogin}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 font-semibold text-[#142033] dark:text-slate-300 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors focus:outline-none focus:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
