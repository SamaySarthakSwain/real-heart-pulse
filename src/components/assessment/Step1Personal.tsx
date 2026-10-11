import React, { useState } from "react";
import { User, Calendar, Camera, Trash2, ArrowRight } from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";
import { BLOOD_GROUPS, GENDERS } from "./medicalCatalog";
import type { PatientProfileData, PatientGender } from "@/types/patient";

interface Step1PersonalProps {
  data: PatientProfileData;
  onChange: (patch: Partial<PatientProfileData>) => void;
  onNext: () => void;
}

interface Step1Errors {
  photo?: string | undefined;
  fullName?: string | undefined;
  dateOfBirth?: string | undefined;
  gender?: string | undefined;
  bloodGroup?: string | undefined;
  heightCm?: string | undefined;
  weightKg?: string | undefined;
}

export function Step1Personal({ data, onChange, onNext }: Step1PersonalProps) {
  const [unitHeight, setUnitHeight] = useState<"cm" | "ft">("cm");
  const [unitWeight, setUnitWeight] = useState<"kg" | "lbs">("kg");
  const [feet, setFeet] = useState<number>(data.heightCm ? Math.floor(data.heightCm / 30.48) : 5);
  const [inches, setInches] = useState<number>(
    data.heightCm ? Math.round((data.heightCm % 30.48) / 2.54) : 9
  );
  const [lbs, setLbs] = useState<number>(data.weightKg ? Math.round(data.weightKg * 2.20462) : 154);
  const [errors, setErrors] = useState<Step1Errors>({});

  // Calculate age automatically from DOB
  const handleDobChange = (dob: string) => {
    let calculatedAge = data.age;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age >= 0 && age <= 130) {
        calculatedAge = age;
      }
    }
    onChange({ dateOfBirth: dob, age: calculatedAge });
    if (errors.dateOfBirth) {
      setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: "Please upload a JPG, PNG, or WebP image." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "File size must be under 5MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({ profilePhoto: reader.result as string });
      setErrors((prev) => ({ ...prev, photo: "" }));
    };
    reader.readAsDataURL(file);
  };

  const validateAndProceed = () => {
    const newErrors: Step1Errors = {};
    if (!data.fullName?.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!data.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required.";
    }
    if (!data.gender) {
      newErrors.gender = "Please select your gender.";
    }
    if (!data.bloodGroup) {
      newErrors.bloodGroup = "Please select your blood group.";
    }
    if (!data.heightCm || data.heightCm < 40 || data.heightCm > 250) {
      newErrors.heightCm = "Please enter a valid height.";
    }
    if (!data.weightKg || data.weightKg < 20 || data.weightKg > 350) {
      newErrors.weightKg = "Please enter a valid weight.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Header & Avatar Upload */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="relative group">
          <div className="h-20 w-20 rounded-full border-2 border-dashed border-orange-500/40 bg-orange-500/5 dark:bg-orange-500/10 flex items-center justify-center overflow-hidden text-orange-500 shadow-sm transition-transform group-hover:scale-105">
            {data.profilePhoto ? (
              <img
                src={data.profilePhoto}
                alt={data.fullName || "Patient photo"}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-orange-400 dark:text-orange-300" />
            )}
          </div>
          <label
            htmlFor="patient-photo-input"
            className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-orange-600 transition-colors"
            title="Upload profile photo"
          >
            <Camera className="h-3.5 w-3.5" />
            <input
              id="patient-photo-input"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2">
            <span>Profile Photo</span>
            <span className="text-[11px] font-normal text-[#667085] dark:text-slate-400">
              (Optional, JPG/PNG under 5MB)
            </span>
          </h3>
          <p className="text-xs text-[#667085] dark:text-slate-400">
            A photo helps healthcare professionals confirm identity during clinical consultations.
          </p>
          {data.profilePhoto && (
            <button
              type="button"
              onClick={() => onChange({ profilePhoto: undefined })}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors pt-0.5"
            >
              <Trash2 className="h-3 w-3" />
              <span>Remove photo</span>
            </button>
          )}
          {errors.photo && <p className="text-[11px] text-rose-500">{errors.photo}</p>}
        </div>
      </div>

      {/* Grid: Personal Info Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2 space-y-1.5">
          <label
            htmlFor="field-fullName"
            className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
          >
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="field-fullName"
            type="text"
            value={data.fullName || ""}
            onChange={(e) => {
              onChange({ fullName: e.target.value });
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
            }}
            placeholder="Enter full name"
            className={`w-full rounded-xl border ${
              errors.fullName
                ? "border-rose-500 ring-2 ring-rose-500/20"
                : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"
            } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`}
          />
          {errors.fullName && <p className="text-[11px] text-rose-500">{errors.fullName}</p>}
        </div>

        {/* Date of Birth & Calculated Age */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="field-dob"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Date of Birth <span className="text-rose-500">*</span>
            </label>
            {data.age !== undefined && (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Age: {data.age} years
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="field-dob"
              type="date"
              value={data.dateOfBirth || ""}
              onChange={(e) => handleDobChange(e.target.value)}
              className={`w-full rounded-xl border ${
                errors.dateOfBirth
                  ? "border-rose-500 ring-2 ring-rose-500/20"
                  : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"
              } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 focus:outline-none transition-all`}
            />
          </div>
          {errors.dateOfBirth && <p className="text-[11px] text-rose-500">{errors.dateOfBirth}</p>}
        </div>

        {/* Gender / Sex */}
        <div className="space-y-1.5">
          <SearchableSelect
            id="field-gender"
            label="Gender / Sex"
            required
            options={GENDERS}
            selected={data.gender || ""}
            onChange={(val) => {
              onChange({ gender: val as PatientGender });
              if (errors.gender) setErrors((prev) => ({ ...prev, gender: "" }));
            }}
            placeholder="Select gender"
            error={errors.gender}
          />
        </div>

        {/* Blood Group */}
        <div className="sm:col-span-2 space-y-1.5">
          <SearchableSelect
            id="field-bloodGroup"
            label="Blood Group"
            required
            options={BLOOD_GROUPS}
            selected={data.bloodGroup || ""}
            onChange={(val) => {
              onChange({ bloodGroup: val as string });
              if (errors.bloodGroup) setErrors((prev) => ({ ...prev, bloodGroup: "" }));
            }}
            placeholder="Select blood group"
            helperText="Select 'I don't know' if uncertain"
            error={errors.bloodGroup}
          />
        </div>

        {/* Height */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="field-height"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Height ({unitHeight}) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setUnitHeight("cm")}
                className={`px-1.5 py-0.5 rounded ${
                  unitHeight === "cm"
                    ? "bg-[#FF6B00] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => setUnitHeight("ft")}
                className={`px-1.5 py-0.5 rounded ${
                  unitHeight === "ft"
                    ? "bg-[#FF6B00] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                ft/in
              </button>
            </div>
          </div>

          {unitHeight === "cm" ? (
            <input
              id="field-height"
              type="number"
              min={40}
              max={250}
              value={data.heightCm || ""}
              onChange={(e) => {
                const val = e.target.value === "" ? undefined : Number(e.target.value);
                onChange({ heightCm: val });
                if (errors.heightCm) setErrors((prev) => ({ ...prev, heightCm: "" }));
              }}
              placeholder="e.g. 175"
              className={`w-full rounded-xl border ${
                errors.heightCm
                  ? "border-rose-500 ring-2 ring-rose-500/20"
                  : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"
              } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={2}
                max={8}
                value={feet}
                onChange={(e) => {
                  const ft = Number(e.target.value);
                  setFeet(ft);
                  const totalCm = Math.round(ft * 30.48 + inches * 2.54);
                  onChange({ heightCm: totalCm });
                }}
                placeholder="ft"
                className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3 text-sm"
              />
              <input
                type="number"
                min={0}
                max={11}
                value={inches}
                onChange={(e) => {
                  const inc = Number(e.target.value);
                  setInches(inc);
                  const totalCm = Math.round(feet * 30.48 + inc * 2.54);
                  onChange({ heightCm: totalCm });
                }}
                placeholder="in"
                className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3 text-sm"
              />
            </div>
          )}
          {errors.heightCm && <p className="text-[11px] text-rose-500">{errors.heightCm}</p>}
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="field-weight"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Weight ({unitWeight}) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setUnitWeight("kg")}
                className={`px-1.5 py-0.5 rounded ${
                  unitWeight === "kg"
                    ? "bg-[#FF6B00] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => setUnitWeight("lbs")}
                className={`px-1.5 py-0.5 rounded ${
                  unitWeight === "lbs"
                    ? "bg-[#FF6B00] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                lbs
              </button>
            </div>
          </div>

          {unitWeight === "kg" ? (
            <input
              id="field-weight"
              type="number"
              min={20}
              max={350}
              value={data.weightKg || ""}
              onChange={(e) => {
                const val = e.target.value === "" ? undefined : Number(e.target.value);
                onChange({ weightKg: val });
                if (errors.weightKg) setErrors((prev) => ({ ...prev, weightKg: "" }));
              }}
              placeholder="e.g. 70"
              className={`w-full rounded-xl border ${
                errors.weightKg
                  ? "border-rose-500 ring-2 ring-rose-500/20"
                  : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"
              } bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`}
            />
          ) : (
            <input
              id="field-weight-lbs"
              type="number"
              min={44}
              max={770}
              value={lbs}
              onChange={(e) => {
                const val = Number(e.target.value);
                setLbs(val);
                const valKg = Math.round(val / 2.20462);
                onChange({ weightKg: valKg });
              }}
              placeholder="e.g. 154"
              className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 focus:outline-none"
            />
          )}
          {errors.weightKg && <p className="text-[11px] text-rose-500">{errors.weightKg}</p>}
        </div>
      </div>

      {/* Step Actions */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={validateAndProceed}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all"
        >
          <span>Continue to Contact Details</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
