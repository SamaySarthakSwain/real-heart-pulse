import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { usePatientStore } from "@/store/patientStore";

export type AuthMode = "login" | "register" | "forgot";

export function LoginPage() {
  const navigate = useNavigate();
  const currentPatient = usePatientStore((s) => s.getCurrentPatient());

  const [mode, setMode] = useState<AuthMode>("login");

  // Synchronize initial mode from URL search param if present (e.g., /login?mode=register)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get("mode");
      if (urlMode === "register" || urlMode === "forgot" || urlMode === "login") {
        setMode(urlMode);
      }
    }
  }, []);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newMode === "login") {
        url.searchParams.delete("mode");
      } else {
        url.searchParams.set("mode", newMode);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleLoginSuccess = () => {
    const patient = usePatientStore.getState().getCurrentPatient();
    if (patient && !patient.hasCompletedAssessment) {
      toast.info(`Welcome, ${patient.name}!`, {
        description: "Please complete your initial Patient Profile & Health Assessment before entering the dashboard.",
      });
      navigate({ to: "/assessment" });
    } else {
      toast.success(`Welcome back, ${patient?.name || "Patient"}!`, {
        description: "Secure session verified. Opening your real-time cardiac dashboard...",
      });
      navigate({ to: "/dashboard" });
    }
  };

  const handleRegisterSuccess = () => {
    const patient = usePatientStore.getState().getCurrentPatient();
    toast.success("Account created successfully!", {
      description: `Welcome to Ear-to-Heart Health Hub. Let's complete your Patient Profile & Health Assessment.`,
    });
    navigate({ to: "/assessment" });
  };

  // Dynamic titles and subtitles per mode
  const modeMetadata = {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to access your heart health dashboard.",
    },
    register: {
      title: "Create Patient Account",
      subtitle: "Register to begin continuous cardiac monitoring and telemetry.",
    },
    forgot: {
      title: "Reset Your Password",
      subtitle: "Enter the email address associated with your account.",
    },
  }[mode];

  return (
    <AuthLayout
      mode={mode}
      title={modeMetadata.title}
      subtitle={modeMetadata.subtitle}
    >
      {mode === "login" && (
        <LoginForm
          onNavigateToRegister={() => handleModeChange("register")}
          onNavigateToForgot={() => handleModeChange("forgot")}
          onSuccess={handleLoginSuccess}
        />
      )}

      {mode === "register" && (
        <RegisterForm
          onNavigateToLogin={() => handleModeChange("login")}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {mode === "forgot" && (
        <ForgotPasswordForm
          onNavigateToLogin={() => handleModeChange("login")}
        />
      )}
    </AuthLayout>
  );
}
