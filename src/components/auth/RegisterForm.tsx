import React, { useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Hash,
  Info,
} from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import {
  validateEmail,
  validateUsername,
  evaluatePasswordStrength,
} from "@/services/auth/authService";
import { usePatientStore } from "@/store/patientStore";

interface RegisterFormProps {
  onNavigateToLogin: () => void;
  onSuccess: () => void;
}

export function RegisterForm({ onNavigateToLogin, onSuccess }: RegisterFormProps) {
  const registerPatientAccount = usePatientStore((s) => s.registerPatientAccount);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string | undefined;
    email?: string | undefined;
    username?: string | undefined;
    patientId?: string | undefined;
    password?: string | undefined;
    confirmPassword?: string | undefined;
  }>({});

  const strength = evaluatePasswordStrength(password);

  const validateAll = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!name.trim()) {
      errors.name = "Full Name is required.";
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      errors.email = emailErr;
    }

    const usernameErr = validateUsername(username);
    if (usernameErr) {
      errors.username = usernameErr;
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (!strength.valid) {
      errors.password = "Password does not satisfy the security requirements below.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const res = await registerPatientAccount({
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
        patientId: patientId.trim() || undefined,
      });

      if (res.success) {
        onSuccess();
      } else {
        setGlobalError(res.error || "Unable to complete registration. Please check the form.");
      }
    } catch (err) {
      setGlobalError("An unexpected error occurred while processing registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Global Error Alert */}
      {globalError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in duration-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold block">Registration Error</span>
            <span>{globalError}</span>
          </div>
        </div>
      )}

      {/* Field 1: Full Name */}
      <div className="space-y-1">
        <label
          htmlFor="reg-name"
          className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
        >
          Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400">
            <User className="h-4 w-4" />
          </div>
          <input
            id="reg-name"
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="e.g. Sarah Jenkins"
            disabled={isLoading}
            className={`w-full rounded-xl border ${
              fieldErrors.name
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"
            } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`}
          />
        </div>
        {fieldErrors.name && (
          <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Grid: Email & Username */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Email Address */}
        <div className="space-y-1">
          <label
            htmlFor="reg-email"
            className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
          >
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="reg-email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="sarah@example.com"
              disabled={isLoading}
              className={`w-full rounded-xl border ${
                fieldErrors.email
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"
              } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label
            htmlFor="reg-username"
            className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
          >
            Username <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400">
              <span className="text-xs font-mono font-bold">@</span>
            </div>
            <input
              id="reg-username"
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (fieldErrors.username)
                  setFieldErrors((prev) => ({ ...prev, username: undefined }));
              }}
              placeholder="sarah_j"
              disabled={isLoading}
              className={`w-full rounded-xl border ${
                fieldErrors.username
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"
              } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`}
            />
          </div>
          {fieldErrors.username && (
            <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
              {fieldErrors.username}
            </p>
          )}
        </div>
      </div>

      {/* Patient ID (Provider-Issued, Optional) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="reg-patientId"
            className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
          >
            Patient ID <span className="text-[#667085] font-normal">(Optional)</span>
          </label>
          <span className="text-[11px] text-[#667085] dark:text-slate-400 flex items-center gap-1">
            <Info className="h-3 w-3 text-slate-400" />
            If assigned by healthcare provider
          </span>
        </div>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400">
            <Hash className="h-4 w-4" />
          </div>
          <input
            id="reg-patientId"
            type="text"
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value.toUpperCase());
              if (fieldErrors.patientId)
                setFieldErrors((prev) => ({ ...prev, patientId: undefined }));
            }}
            placeholder="e.g. PT-10492"
            disabled={isLoading}
            className={`w-full rounded-xl border ${
              fieldErrors.patientId
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"
            } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm font-mono text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`}
          />
        </div>
        {fieldErrors.patientId && (
          <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
            {fieldErrors.patientId}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <PasswordInput
          id="reg-password"
          name="new-password"
          label="Password *"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="At least 8 characters with numbers"
          error={fieldErrors.password}
          disabled={isLoading}
        />

        {/* Password Strength Indicator */}
        {password.length > 0 && (
          <div className="pt-1.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#667085] dark:text-slate-400 font-medium">Strength:</span>
              <span
                className={`font-semibold ${
                  strength.score <= 1
                    ? "text-rose-500"
                    : strength.score === 2
                    ? "text-amber-500"
                    : strength.score === 3
                    ? "text-emerald-500"
                    : "text-emerald-600"
                }`}
              >
                {strength.level}
              </span>
            </div>
            {/* Visual Bar */}
            <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  strength.score >= 1 ? "bg-rose-500" : "bg-transparent"
                }`}
              />
              <div
                className={`h-full rounded-full transition-all ${
                  strength.score >= 2 ? "bg-amber-500" : "bg-transparent"
                }`}
              />
              <div
                className={`h-full rounded-full transition-all ${
                  strength.score >= 3 ? "bg-emerald-500" : "bg-transparent"
                }`}
              />
              <div
                className={`h-full rounded-full transition-all ${
                  strength.score >= 4 ? "bg-emerald-600" : "bg-transparent"
                }`}
              />
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-0.5 text-[10px] text-[#667085] dark:text-slate-400">
              <span className="flex items-center gap-1">
                {strength.rules.hasLength ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
                8+ characters
              </span>
              <span className="flex items-center gap-1">
                {strength.rules.hasUpper ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
                Uppercase letter
              </span>
              <span className="flex items-center gap-1">
                {strength.rules.hasLower ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
                Lowercase letter
              </span>
              <span className="flex items-center gap-1">
                {strength.rules.hasNumberOrSpecial ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
                Number or symbol
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1">
        <PasswordInput
          id="reg-confirmPassword"
          name="confirm-password"
          label="Confirm Password *"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword)
              setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          placeholder="Re-enter your password"
          error={fieldErrors.confirmPassword}
          disabled={isLoading}
        />
        {confirmPassword && password && (
          <p
            className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${
              password === confirmPassword ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {password === confirmPassword ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Passwords match</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                <span>Passwords do not match</span>
              </>
            )}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] py-3 px-4 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-[#E66000] hover:to-[#FF7A00] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Creating Healthcare Profile...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      {/* Already have an account link */}
      <div className="pt-2 text-center text-xs text-[#667085] dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
        <span>Already have an account? </span>
        <button
          type="button"
          onClick={onNavigateToLogin}
          disabled={isLoading}
          className="font-semibold text-[#FF6B00] hover:text-[#FF8A00] transition-colors focus:outline-none focus:underline"
        >
          Sign In
        </button>
      </div>
    </form>
  );
}
