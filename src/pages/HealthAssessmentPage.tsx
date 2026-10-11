import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Heart,
  User,
  Phone,
  HeartPulse,
  Activity,
  CheckCircle2,
  Save,
  ArrowRight,
  Shield,
  Layers,
  LayoutGrid,
  Check,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { usePatientStore } from "@/store/patientStore";
import { Step1Personal } from "@/components/assessment/Step1Personal";
import { Step2Contact } from "@/components/assessment/Step2Contact";
import { Step3Medical } from "@/components/assessment/Step3Medical";
import { Step4SymptomsWearable } from "@/components/assessment/Step4SymptomsWearable";
import { Step5Review } from "@/components/assessment/Step5Review";
import type {
  PatientProfileData,
  PatientContactData,
  EmergencyContactData,
  CardiacAssessmentData,
} from "@/types/patient";

export function HealthAssessmentPage() {
  const navigate = useNavigate();
  const currentPatient = usePatientStore((s) => s.getCurrentPatient());
  const saveHealthAssessment = usePatientStore((s) => s.saveHealthAssessment);

  // If patient is not authenticated, do not show assessment
  useEffect(() => {
    if (!currentPatient) {
      toast.error("Authentication required to access Patient Health Assessment.");
      navigate({ to: "/login" });
    }
  }, [currentPatient, navigate]);

  // Current wizard step (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Unified layout toggle (like reference screenshot vs step wizard)
  const [viewMode, setViewMode] = useState<"stepped" | "comprehensive">("stepped");

  // State initialized from patient existing profile/store
  const [profile, setProfile] = useState<PatientProfileData>({
    fullName: currentPatient?.profileData?.fullName || currentPatient?.name || "",
    dateOfBirth: currentPatient?.profileData?.dateOfBirth || "1970-01-01",
    age: currentPatient?.profileData?.age || currentPatient?.age || 35,
    gender: currentPatient?.profileData?.gender || currentPatient?.gender || "Male",
    bloodGroup: currentPatient?.profileData?.bloodGroup || currentPatient?.bloodType || "O+",
    heightCm: currentPatient?.profileData?.heightCm || 172,
    weightKg: currentPatient?.profileData?.weightKg || 68,
    profilePhoto: currentPatient?.profileData?.profilePhoto || currentPatient?.avatarUrl,
  });

  const [contact, setContact] = useState<PatientContactData>({
    email: currentPatient?.contactData?.email || currentPatient?.email || "",
    emailVerified: currentPatient?.contactData?.emailVerified ?? true,
    mobileNumber: currentPatient?.contactData?.mobileNumber || "9876543210",
    countryCode: currentPatient?.contactData?.countryCode || "+91",
    alternateNumber: currentPatient?.contactData?.alternateNumber || "",
    alternateCountryCode: currentPatient?.contactData?.alternateCountryCode || "+91",
    city: currentPatient?.contactData?.city || "Bhubaneswar",
    state: currentPatient?.contactData?.state || "Odisha",
    country: currentPatient?.contactData?.country || "India",
    address: currentPatient?.contactData?.address || "",
    preferredCommunication: currentPatient?.contactData?.preferredCommunication || "Email",
    preferredLanguage: currentPatient?.contactData?.preferredLanguage || "English",
  });

  const [emergency, setEmergency] = useState<EmergencyContactData>({
    contactName: currentPatient?.emergencyData?.contactName || "",
    relationship: currentPatient?.emergencyData?.relationship || "Spouse",
    countryCode: currentPatient?.emergencyData?.countryCode || "+91",
    contactNumber: currentPatient?.emergencyData?.contactNumber || "",
    alternateNumber: currentPatient?.emergencyData?.alternateNumber || "",
    consentGranted: currentPatient?.emergencyData?.consentGranted ?? false,
  });

  const [assessment, setAssessment] = useState<CardiacAssessmentData>({
    bloodPressureSystolic: currentPatient?.assessmentData?.bloodPressureSystolic,
    bloodPressureDiastolic: currentPatient?.assessmentData?.bloodPressureDiastolic,
    bloodPressureUnknown: currentPatient?.assessmentData?.bloodPressureUnknown ?? true,
    cholesterolTotal: currentPatient?.assessmentData?.cholesterolTotal,
    cholesterolLdl: currentPatient?.assessmentData?.cholesterolLdl,
    cholesterolHdl: currentPatient?.assessmentData?.cholesterolHdl,
    cholesterolTriglycerides: currentPatient?.assessmentData?.cholesterolTriglycerides,
    cholesterolUnit: currentPatient?.assessmentData?.cholesterolUnit || "mg/dL",
    cholesterolUnknown: currentPatient?.assessmentData?.cholesterolUnknown ?? true,
    medicalConditions: currentPatient?.assessmentData?.medicalConditions || [],
    currentMedications: currentPatient?.assessmentData?.currentMedications || [],
    familyHistory: currentPatient?.assessmentData?.familyHistory || [],
    allergies: currentPatient?.assessmentData?.allergies || [],
    smokingStatus: currentPatient?.assessmentData?.smokingStatus || "Never smoked",
    physicalActivity: currentPatient?.assessmentData?.physicalActivity || "Moderately active",
    sleepDurationHours: currentPatient?.assessmentData?.sleepDurationHours || 7,
    symptoms: currentPatient?.assessmentData?.symptoms || ["No current symptoms"],
    wearableData: currentPatient?.assessmentData?.wearableData,
    privacyConsentGranted: currentPatient?.assessmentData?.privacyConsentGranted ?? false,
  });

  if (!currentPatient) {
    return null;
  }

  const handleSaveAndSubmit = async (markComplete: boolean) => {
    saveHealthAssessment(
      currentPatient.id,
      {
        profile,
        contact,
        emergency,
        assessment: {
          ...assessment,
          completedAt: markComplete ? new Date().toISOString() : undefined,
          privacyConsentGranted: markComplete,
        },
      },
      markComplete
    );

    if (markComplete) {
      toast.success("Health Assessment & Profile Completed!", {
        description: "Your cardiac baseline has been updated. Opening real-time dashboard...",
      });
      navigate({ to: "/dashboard" });
    } else {
      toast.info("Progress saved successfully.", {
        description: "You may resume your health assessment anytime from settings.",
      });
      navigate({ to: "/dashboard" });
    }
  };

  const stepsMeta = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Contact Details", icon: Phone },
    { number: 3, title: "Medical History", icon: HeartPulse },
    { number: 4, title: "Symptoms & Wearable", icon: Activity },
    { number: 5, title: "Review & Submit", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[#F3F6F9] dark:bg-[#0D1526] text-[#142033] dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ── TOP HEADER (Matching Patient Portal Aesthetic) ───────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-5 sm:p-6 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-[#FF6B00]">
              <Heart className="h-3.5 w-3.5 fill-[#FF6B00]" />
              <span>Ear-to-Heart Health Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#142033] dark:text-white">
              Patient Profile & Health Assessment
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400">
              Patient: <span className="font-semibold text-[#142033] dark:text-slate-200">{currentPatient.name}</span>{" "}
              (<span className="font-mono text-[#FF6B00]">{currentPatient.id}</span>) • Complete your profile to unlock continuous AI cardiac risk telemetry.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode("stepped")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === "stepped"
                    ? "bg-white dark:bg-[#142033] text-[#FF6B00] font-semibold shadow-sm"
                    : "text-[#667085] hover:text-[#142033] dark:text-slate-400"
                }`}
                title="Guided Step-by-Step Wizard"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Wizard</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("comprehensive")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === "comprehensive"
                    ? "bg-white dark:bg-[#142033] text-[#FF6B00] font-semibold shadow-sm"
                    : "text-[#667085] hover:text-[#142033] dark:text-slate-400"
                }`}
                title="Unified Overview (Like Intake Form)"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>All Fields</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSaveAndSubmit(false)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-[#142033] dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              title="Save current inputs to finish later"
            >
              <Save className="h-3.5 w-3.5 text-[#FF6B00]" />
              <span className="hidden sm:inline">Save Progress</span>
            </button>
          </div>
        </div>

        {/* ── STEPPED WIZARD PROGRESS BAR ──────────────────────────────────── */}
        {viewMode === "stepped" && (
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0">
              {stepsMeta.map((s, idx) => {
                const Icon = s.icon;
                const isCompleted = currentStep > s.number;
                const isCurrent = currentStep === s.number;

                return (
                  <React.Fragment key={s.number}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(s.number)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                        isCurrent
                          ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] text-white shadow-md shadow-orange-500/20"
                          : isCompleted
                          ? "bg-orange-500/10 text-[#FF6B00] hover:bg-orange-500/20"
                          : "text-[#667085] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs ${
                          isCurrent
                            ? "bg-white/20 text-white"
                            : isCompleted
                            ? "bg-[#FF6B00] text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.number}
                      </div>
                      <span>{s.title}</span>
                    </button>

                    {idx < stepsMeta.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-700 shrink-0 hidden md:block" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT CONTAINER ───────────────────────────────────────── */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
          {viewMode === "stepped" ? (
            /* Wizard Steps */
            <div>
              {currentStep === 1 && (
                <Step1Personal
                  data={profile}
                  onChange={(patch) => setProfile((prev) => ({ ...prev, ...patch }))}
                  onNext={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 2 && (
                <Step2Contact
                  contactData={contact}
                  emergencyData={emergency}
                  onContactChange={(patch) => setContact((prev) => ({ ...prev, ...patch }))}
                  onEmergencyChange={(patch) => setEmergency((prev) => ({ ...prev, ...patch }))}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && (
                <Step3Medical
                  data={assessment}
                  onChange={(patch) => setAssessment((prev) => ({ ...prev, ...patch }))}
                  onNext={() => setCurrentStep(4)}
                  onBack={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 4 && (
                <Step4SymptomsWearable
                  data={assessment}
                  onChange={(patch) => setAssessment((prev) => ({ ...prev, ...patch }))}
                  onNext={() => setCurrentStep(5)}
                  onBack={() => setCurrentStep(3)}
                />
              )}

              {currentStep === 5 && (
                <Step5Review
                  profile={profile}
                  contact={contact}
                  emergency={emergency}
                  assessment={assessment}
                  onJumpToStep={(step) => setCurrentStep(step)}
                  onSubmit={handleSaveAndSubmit}
                  onBack={() => setCurrentStep(4)}
                />
              )}
            </div>
          ) : (
            /* Comprehensive Unified Layout (Like the reference screenshot) */
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-[#142033] dark:text-white mb-1">
                  Comprehensive Patient Health Record
                </h2>
                <p className="text-xs text-[#667085] dark:text-slate-400">
                  All clinical fields visible in one intake view. You can save at any time.
                </p>
              </div>

              {/* Step 1 Section */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#FF6B00] flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>1. Personal Information</span>
                </h3>
                <Step1Personal
                  data={profile}
                  onChange={(patch) => setProfile((prev) => ({ ...prev, ...patch }))}
                  onNext={() => {}}
                />
              </div>

              {/* Step 2 Section */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#FF6B00] flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>2. Contact & Emergency Proxy Details</span>
                </h3>
                <Step2Contact
                  contactData={contact}
                  emergencyData={emergency}
                  onContactChange={(patch) => setContact((prev) => ({ ...prev, ...patch }))}
                  onEmergencyChange={(patch) => setEmergency((prev) => ({ ...prev, ...patch }))}
                  onNext={() => {}}
                  onBack={() => {}}
                />
              </div>

              {/* Step 3 Section */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#FF6B00] flex items-center gap-2">
                  <HeartPulse className="h-4 w-4" />
                  <span>3. Vitals & Medical History</span>
                </h3>
                <Step3Medical
                  data={assessment}
                  onChange={(patch) => setAssessment((prev) => ({ ...prev, ...patch }))}
                  onNext={() => {}}
                  onBack={() => {}}
                />
              </div>

              {/* Step 4 Section */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#FF6B00] flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>4. Reported Symptoms & Wearable Baseline</span>
                </h3>
                <Step4SymptomsWearable
                  data={assessment}
                  onChange={(patch) => setAssessment((prev) => ({ ...prev, ...patch }))}
                  onNext={() => {}}
                  onBack={() => {}}
                />
              </div>

              {/* Step 5 Review Section */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#FF6B00] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>5. Review & Final Confirmation</span>
                </h3>
                <Step5Review
                  profile={profile}
                  contact={contact}
                  emergency={emergency}
                  assessment={assessment}
                  onJumpToStep={(step) => {
                    setViewMode("stepped");
                    setCurrentStep(step);
                  }}
                  onSubmit={handleSaveAndSubmit}
                  onBack={() => {}}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
