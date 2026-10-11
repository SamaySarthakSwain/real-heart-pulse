import React, { useState } from "react";
import {
  User,
  Phone,
  ShieldCheck,
  HeartPulse,
  Activity,
  Radio,
  Edit3,
  CheckCircle2,
  Lock,
  Loader2,
  ArrowLeft,
  Save,
  Check,
} from "lucide-react";
import type {
  PatientProfileData,
  PatientContactData,
  EmergencyContactData,
  CardiacAssessmentData,
} from "@/types/patient";

interface Step5ReviewProps {
  profile: PatientProfileData;
  contact: PatientContactData;
  emergency: EmergencyContactData;
  assessment: CardiacAssessmentData;
  onJumpToStep: (step: number) => void;
  onSubmit: (markComplete: boolean) => Promise<void>;
  onBack: () => void;
}

export function Step5Review({
  profile,
  contact,
  emergency,
  assessment,
  onJumpToStep,
  onSubmit,
  onBack,
}: Step5ReviewProps) {
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!privacyConsent) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    setIsSubmitting(true);
    try {
      await onSubmit(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishLater = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-base font-bold text-[#142033] dark:text-white">
          Review Clinical Profile & Health Assessment
        </h3>
        <p className="text-xs text-[#667085] dark:text-slate-400">
          Please review the summary below before completing your intake. You can edit any section at any time.
        </p>
      </div>

      {/* ── CARD GRID: Organized Healthcare Summary ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: Personal Information */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-[#142033] dark:text-white flex items-center gap-1.5">
              <User className="h-4 w-4 text-[#FF6B00]" />
              <span>Personal Information</span>
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(1)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8A00]"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center overflow-hidden text-orange-500 font-bold shrink-0">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.fullName?.charAt(0) || "P"
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-[#142033] dark:text-white">
                {profile.fullName || "Not provided"}
              </p>
              <p className="text-xs text-[#667085] dark:text-slate-400">
                {profile.age ? `${profile.age} years old` : "Age not specified"} • {profile.gender}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div>
              <span className="text-[10px] text-[#667085] block">Blood Group</span>
              <span className="font-semibold text-[#142033] dark:text-slate-200">
                {profile.bloodGroup || "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#667085] block">Height</span>
              <span className="font-semibold text-[#142033] dark:text-slate-200">
                {profile.heightCm ? `${profile.heightCm} cm` : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#667085] block">Weight</span>
              <span className="font-semibold text-[#142033] dark:text-slate-200">
                {profile.weightKg ? `${profile.weightKg} kg` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Contact Information */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-[#142033] dark:text-white flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-[#FF6B00]" />
              <span>Contact Details</span>
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8A00]"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#667085]">Email:</span>
              <span className="font-medium text-[#142033] dark:text-slate-200 font-mono">
                {contact.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Mobile:</span>
              <span className="font-medium text-[#142033] dark:text-slate-200 font-mono">
                {contact.countryCode} {contact.mobileNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Location:</span>
              <span className="font-medium text-[#142033] dark:text-slate-200">
                {[contact.city, contact.state, contact.country].filter(Boolean).join(", ") ||
                  "Not specified"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Preferred:</span>
              <span className="font-medium text-[#142033] dark:text-slate-200">
                {contact.preferredCommunication} ({contact.preferredLanguage})
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: Emergency Contact */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-[#142033] dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-rose-500" />
              <span>Emergency Proxy</span>
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(2)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8A00]"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#667085]">Name:</span>
              <span className="font-medium text-[#142033] dark:text-slate-200">
                {emergency.contactName || "None provided"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Relationship:</span>
              <span className="font-medium text-[#142033] dark:text-slate-200">
                {emergency.relationship || "None"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Phone:</span>
              <span className="font-medium text-[#142033] dark:text-slate-200 font-mono">
                {emergency.countryCode} {emergency.contactNumber}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium pt-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Emergency Notification Consent Granted</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Medical & Laboratory History */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-[#142033] dark:text-white flex items-center gap-1.5">
              <HeartPulse className="h-4 w-4 text-[#FF6B00]" />
              <span>Vitals & Medical History</span>
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(3)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8A00]"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#667085]">Blood Pressure:</span>
              <span className="font-semibold text-[#142033] dark:text-slate-200">
                {assessment.bloodPressureUnknown
                  ? "Unknown"
                  : assessment.bloodPressureSystolic && assessment.bloodPressureDiastolic
                  ? `${assessment.bloodPressureSystolic}/${assessment.bloodPressureDiastolic} mmHg`
                  : "Not recorded"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#667085]">Conditions:</span>
              <span className="font-medium text-[#142033] dark:text-slate-200 text-right max-w-[200px] truncate">
                {assessment.medicalConditions?.length
                  ? assessment.medicalConditions.join(", ")
                  : "None reported"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#667085]">Medications:</span>
              <span className="font-medium text-[#142033] dark:text-slate-200 text-right max-w-[200px] truncate">
                {assessment.currentMedications?.length
                  ? assessment.currentMedications.map((m) => m.name).join(", ")
                  : "None reported"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#667085]">Lifestyle:</span>
              <span className="font-medium text-[#142033] dark:text-slate-200">
                {assessment.smokingStatus} • {assessment.physicalActivity}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 5: Reported Symptoms & Wearable Baseline (Spans Full Width) */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-[#142033] dark:text-white flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#FF6B00]" />
              <span>Reported Symptoms & Wearable Status</span>
            </span>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8A00]"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#667085] block mb-1">Recent Symptoms:</span>
              {assessment.symptoms?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {assessment.symptoms.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-[#142033] dark:text-slate-200 text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="font-medium text-[#142033] dark:text-slate-200">
                  No current symptoms reported
                </span>
              )}
            </div>

            <div>
              <span className="text-[#667085] block mb-1">Ear-Wearable Biosensor:</span>
              {assessment.wearableData?.connected ? (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 p-2 text-[11px] space-y-1">
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold block">
                    ✓ Baseline Telemetry Recorded
                  </span>
                  <span className="text-[#667085] dark:text-slate-300">
                    BPM: {assessment.wearableData.heartRate ?? "--"} • SpO₂: {assessment.wearableData.spo2 ?? "--"}% • Temp: {assessment.wearableData.temperature ?? "--"}°C
                  </span>
                </div>
              ) : (
                <span className="font-medium text-[#667085] dark:text-slate-400">
                  Hardware disconnected (Can be synchronized anytime on the Live Dashboard)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PRIVACY NOTICE & EXPLICIT CONSENT ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#142033] dark:text-white">
          <Lock className="h-4 w-4 text-emerald-500" />
          <span>Patient Privacy & Healthcare Data Consent</span>
        </div>
        <p className="text-xs text-[#667085] dark:text-slate-400 leading-relaxed">
          Your personal health assessment, emergency contacts, and continuous cardiac telemetry data will be encrypted using 256-bit AES protocols and accessible only by your authenticated profile and authorized healthcare providers.
        </p>

        <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={privacyConsent}
            onChange={(e) => {
              setPrivacyConsent(e.target.checked);
              if (consentError) setConsentError(false);
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#FF6B00] accent-[#FF6B00]"
          />
          <span className="text-xs font-semibold text-[#142033] dark:text-slate-200 leading-relaxed">
            I confirm that the health information provided is accurate to the best of my knowledge, and I consent to its secure storage for AI cardiac risk monitoring in accordance with the Privacy Policy.
          </span>
        </label>
        {consentError && (
          <p className="text-[11px] font-semibold text-rose-500 pl-6">
            Please acknowledge the clinical consent checkbox before completing your profile.
          </p>
        )}
      </div>

      {/* ── ACTION BUTTONS ─────────────────────────────────────────────────── */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-[#142033] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Edit Information</span>
        </button>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleFinishLater}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-[#667085] dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save and Finish Later</span>
          </button>

          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save and Complete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
