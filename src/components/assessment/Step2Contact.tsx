import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";
import {
  COUNTRIES,
  INDIAN_STATES,
  EMERGENCY_RELATIONSHIPS,
  COMMUNICATION_METHODS,
  LANGUAGES,
} from "./medicalCatalog";
import type { PatientContactData, EmergencyContactData } from "@/types/patient";

interface Step2ContactProps {
  contactData: PatientContactData;
  emergencyData: EmergencyContactData;
  onContactChange: (patch: Partial<PatientContactData>) => void;
  onEmergencyChange: (patch: Partial<EmergencyContactData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Contact({
  contactData,
  emergencyData,
  onContactChange,
  onEmergencyChange,
  onNext,
  onBack,
}: Step2ContactProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};

    if (!contactData.mobileNumber?.trim()) {
      newErrors.mobileNumber = "Mobile number is required.";
    } else if (contactData.mobileNumber.replace(/\D/g, "").length < 7) {
      newErrors.mobileNumber = "Please enter a valid mobile number.";
    }

    if (!emergencyData.contactName?.trim()) {
      newErrors.contactName = "Emergency contact name is required.";
    }
    if (!emergencyData.relationship?.trim()) {
      newErrors.relationship = "Please specify relationship.";
    }
    if (!emergencyData.contactNumber?.trim()) {
      newErrors.contactNumber = "Emergency contact number is required.";
    } else if (emergencyData.contactNumber.replace(/\D/g, "").length < 7) {
      newErrors.contactNumber = "Please enter a valid emergency phone number.";
    }
    if (!emergencyData.consentGranted) {
      newErrors.consent = "Consent to contact in medical emergencies is required.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── SECTION 1: Patient Primary Contact ──────────────────────────────── */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2">
            <Phone className="h-4 w-4 text-[#FF6B00]" />
            <span>Primary Contact Details</span>
          </h3>
          <p className="text-xs text-[#667085] dark:text-slate-400">
            How clinical staff and automated telemetry alerts communicate with you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email Address (Prefilled & Protected) */}
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="field-email"
                className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified Account Email</span>
              </span>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-[#667085]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="field-email"
                type="email"
                value={contactData.email || ""}
                readOnly
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-200 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-[#667085] dark:text-slate-400">
              Authentication email is linked to your account. To change this, use the security verification settings.
            </p>
          </div>

          {/* Primary Mobile Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="field-mobile"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={contactData.countryCode || "+91"}
                onChange={(e) => onContactChange({ countryCode: e.target.value })}
                className="rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1A2639]/90 px-2.5 py-2.5 text-xs font-semibold text-[#142033] dark:text-slate-100 focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="+91">+91 (IN)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+65">+65 (SG)</option>
                <option value="+971">+971 (AE)</option>
              </select>
              <input
                id="field-mobile"
                type="tel"
                value={contactData.mobileNumber || ""}
                onChange={(e) => {
                  onContactChange({ mobileNumber: e.target.value });
                  if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: "" }));
                }}
                placeholder="e.g. 9876543210"
                className={`flex-1 rounded-xl border ${
                  errors.mobileNumber
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"
                } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`}
              />
            </div>
            {errors.mobileNumber && <p className="text-[11px] text-rose-500">{errors.mobileNumber}</p>}
          </div>

          {/* Alternate Contact Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="field-altMobile"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Alternate Number <span className="text-[#667085] font-normal">(Optional)</span>
            </label>
            <div className="flex gap-2">
              <select
                value={contactData.alternateCountryCode || "+91"}
                onChange={(e) => onContactChange({ alternateCountryCode: e.target.value })}
                className="rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1A2639]/90 px-2.5 py-2.5 text-xs font-semibold text-[#142033] dark:text-slate-100 focus:outline-none"
              >
                <option value="+91">+91 (IN)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
              </select>
              <input
                id="field-altMobile"
                type="tel"
                value={contactData.alternateNumber || ""}
                onChange={(e) => onContactChange({ alternateNumber: e.target.value })}
                placeholder="Enter alternate number"
                className="flex-1 rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Residential Address ─────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#FF6B00]" />
            <span>Residential Address</span>
          </h3>
          <p className="text-xs text-[#667085] dark:text-slate-400">
            For rapid dispatch of emergency cardiac medical personnel if required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* City */}
          <div className="space-y-1.5">
            <label
              htmlFor="field-city"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              City
            </label>
            <input
              id="field-city"
              type="text"
              value={contactData.city || ""}
              onChange={(e) => onContactChange({ city: e.target.value })}
              placeholder="e.g. Bhubaneswar"
              className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
            />
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <SearchableSelect
              id="field-state"
              label="State / Province"
              options={INDIAN_STATES}
              selected={contactData.state || "Odisha"}
              onChange={(val) => onContactChange({ state: val as string })}
              placeholder="Select state"
              allowCustom
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <SearchableSelect
              id="field-country"
              label="Country"
              options={COUNTRIES}
              selected={contactData.country || "India"}
              onChange={(val) => onContactChange({ country: val as string })}
              placeholder="Select country"
            />
          </div>

          {/* Address Line */}
          <div className="sm:col-span-2 space-y-1.5">
            <label
              htmlFor="field-address"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Address Line
            </label>
            <input
              id="field-address"
              type="text"
              value={contactData.address || ""}
              onChange={(e) => onContactChange({ address: e.target.value })}
              placeholder="Street address, building, apartment (optional)"
              className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-1.5">
            <label
              htmlFor="field-postalCode"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Postal / PIN Code
            </label>
            <input
              id="field-postalCode"
              type="text"
              value={contactData.postalCode || ""}
              onChange={(e) => onContactChange({ postalCode: e.target.value })}
              placeholder="e.g. 751024"
              className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Emergency Contact ───────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-rose-500" />
            <span>Designated Emergency Contact</span>
          </h3>
          <p className="text-xs text-[#667085] dark:text-slate-400">
            A trusted family member or proxy who can act on your behalf during acute events.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Contact Person Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="field-emergencyName"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Contact Person Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-emergencyName"
              type="text"
              value={emergencyData.contactName || ""}
              onChange={(e) => {
                onEmergencyChange({ contactName: e.target.value });
                if (errors.contactName) setErrors((prev) => ({ ...prev, contactName: "" }));
              }}
              placeholder="e.g. Linda Chen"
              className={`w-full rounded-xl border ${
                errors.contactName
                  ? "border-rose-500 ring-2 ring-rose-500/20"
                  : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"
              } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`}
            />
            {errors.contactName && <p className="text-[11px] text-rose-500">{errors.contactName}</p>}
          </div>

          {/* Relationship */}
          <div className="space-y-1.5">
            <SearchableSelect
              id="field-relationship"
              label="Relationship"
              required
              options={EMERGENCY_RELATIONSHIPS}
              selected={emergencyData.relationship || ""}
              onChange={(val) => {
                onEmergencyChange({ relationship: val as string });
                if (errors.relationship) setErrors((prev) => ({ ...prev, relationship: "" }));
              }}
              placeholder="Select relationship"
              error={errors.relationship}
              allowCustom
            />
          </div>

          {/* Emergency Contact Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="field-emergencyPhone"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={emergencyData.countryCode || "+91"}
                onChange={(e) => onEmergencyChange({ countryCode: e.target.value })}
                className="rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1A2639]/90 px-2 py-2 text-xs font-semibold text-[#142033] dark:text-slate-100 focus:outline-none"
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <input
                id="field-emergencyPhone"
                type="tel"
                value={emergencyData.contactNumber || ""}
                onChange={(e) => {
                  onEmergencyChange({ contactNumber: e.target.value });
                  if (errors.contactNumber) setErrors((prev) => ({ ...prev, contactNumber: "" }));
                }}
                placeholder="e.g. 9876543211"
                className={`flex-1 rounded-xl border ${
                  errors.contactNumber
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"
                } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`}
              />
            </div>
            {errors.contactNumber && (
              <p className="text-[11px] text-rose-500">{errors.contactNumber}</p>
            )}
          </div>
        </div>

        {/* Emergency Consent Checkbox */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emergencyData.consentGranted || false}
              onChange={(e) => {
                onEmergencyChange({ consentGranted: e.target.checked });
                if (errors.consent) setErrors((prev) => ({ ...prev, consent: "" }));
              }}
              className="mt-0.5 h-4 w-4 rounded border-amber-300 text-[#FF6B00] focus:ring-[#FF6B00] accent-[#FF6B00]"
            />
            <div className="text-xs text-[#142033] dark:text-slate-200 leading-relaxed">
              <span className="font-semibold block">Emergency Contact Notification Consent</span>
              <span className="text-[#667085] dark:text-slate-400">
                I hereby authorize Ear-to-Heart Health Hub to reach out to this designated emergency contact only in the event of severe biometric abnormalities (e.g., ventricular tachycardia, sustained asystole, or cardiac distress) where the patient is unresponsive.
              </span>
            </div>
          </label>
          {errors.consent && (
            <p className="text-[11px] font-semibold text-rose-600 pl-6">{errors.consent}</p>
          )}
        </div>
      </div>

      {/* ── SECTION 4: Preferences ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <SearchableSelect
            id="field-commMethod"
            label="Preferred Communication Method"
            options={COMMUNICATION_METHODS}
            selected={contactData.preferredCommunication || "Email"}
            onChange={(val) =>
              onContactChange({
                preferredCommunication: val as PatientContactData["preferredCommunication"],
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <SearchableSelect
            id="field-language"
            label="Preferred Language"
            options={LANGUAGES}
            selected={contactData.preferredLanguage || "English"}
            onChange={(val) =>
              onContactChange({
                preferredLanguage: val as PatientContactData["preferredLanguage"],
              })
            }
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-[#142033] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={validateAndProceed}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all"
        >
          <span>Continue to Medical Info</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
