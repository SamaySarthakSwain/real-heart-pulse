import React, { useState } from "react";
import {
  HeartPulse,
  Activity,
  Pill,
  ShieldAlert,
  Moon,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";
import {
  MEDICAL_CONDITIONS,
  COMMON_MEDICATIONS,
  ALLERGIES_LIST,
  FAMILY_HISTORY_ITEMS,
  SMOKING_OPTIONS,
  PHYSICAL_ACTIVITY_OPTIONS,
} from "./medicalCatalog";
import type { CardiacAssessmentData, MedicationItem } from "@/types/patient";

interface Step3MedicalProps {
  data: CardiacAssessmentData;
  onChange: (patch: Partial<CardiacAssessmentData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Medical({ data, onChange, onNext, onBack }: Step3MedicalProps) {
  const [newMedName, setNewMedName] = useState("");
  const [newMedDose, setNewMedDose] = useState("");

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    const item: MedicationItem = {
      name: newMedName.trim(),
      dosage: newMedDose.trim() || undefined,
    };
    onChange({
      currentMedications: [...(data.currentMedications || []), item],
    });
    setNewMedName("");
    setNewMedDose("");
  };

  const handleRemoveMedication = (index: number) => {
    const list = [...(data.currentMedications || [])];
    list.splice(index, 1);
    onChange({ currentMedications: list });
  };

  return (
    <div className="space-y-6">
      {/* ── SECTION 1: Vitals & Laboratory Values ────────────────────────────── */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-[#FF6B00]" />
            <span>Blood Pressure & Laboratory Measurements</span>
          </h3>
          <p className="text-xs text-[#667085] dark:text-slate-400">
            Enter recent clinical test results. You may select "I don't know" if lab values are unavailable.
          </p>
        </div>

        {/* Blood Pressure */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F9FC]/60 dark:bg-[#1A2639]/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#142033] dark:text-slate-200">
              Blood Pressure (mmHg)
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#667085] dark:text-slate-300">
              <input
                type="checkbox"
                checked={data.bloodPressureUnknown || false}
                onChange={(e) =>
                  onChange({
                    bloodPressureUnknown: e.target.checked,
                    bloodPressureSystolic: e.target.checked ? undefined : data.bloodPressureSystolic,
                    bloodPressureDiastolic: e.target.checked ? undefined : data.bloodPressureDiastolic,
                  })
                }
                className="rounded border-[#D9E1EA] text-[#FF6B00] accent-[#FF6B00]"
              />
              <span>I don't know my blood pressure</span>
            </label>
          </div>

          {!data.bloodPressureUnknown && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1">
                  Systolic (Upper, e.g. 120)
                </label>
                <input
                  type="number"
                  min={70}
                  max={250}
                  value={data.bloodPressureSystolic || ""}
                  onChange={(e) =>
                    onChange({
                      bloodPressureSystolic: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder="120"
                  className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1">
                  Diastolic (Lower, e.g. 80)
                </label>
                <input
                  type="number"
                  min={40}
                  max={150}
                  value={data.bloodPressureDiastolic || ""}
                  onChange={(e) =>
                    onChange({
                      bloodPressureDiastolic: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder="80"
                  className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cholesterol Panel */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F9FC]/60 dark:bg-[#1A2639]/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#142033] dark:text-slate-200">
              Lipid & Cholesterol Profile
            </span>
            <div className="flex items-center gap-3">
              {/* Unit selector */}
              <div className="flex items-center text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => onChange({ cholesterolUnit: "mg/dL" })}
                  className={`px-2 py-0.5 rounded ${
                    data.cholesterolUnit !== "mmol/L"
                      ? "bg-[#FF6B00] text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  mg/dL
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ cholesterolUnit: "mmol/L" })}
                  className={`px-2 py-0.5 rounded ${
                    data.cholesterolUnit === "mmol/L"
                      ? "bg-[#FF6B00] text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  mmol/L
                </button>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#667085] dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={data.cholesterolUnknown || false}
                  onChange={(e) =>
                    onChange({
                      cholesterolUnknown: e.target.checked,
                      cholesterolTotal: e.target.checked ? undefined : data.cholesterolTotal,
                      cholesterolLdl: e.target.checked ? undefined : data.cholesterolLdl,
                      cholesterolHdl: e.target.checked ? undefined : data.cholesterolHdl,
                      cholesterolTriglycerides: e.target.checked ? undefined : data.cholesterolTriglycerides,
                    })
                  }
                  className="rounded border-[#D9E1EA] text-[#FF6B00] accent-[#FF6B00]"
                />
                <span>I don't know my cholesterol</span>
              </label>
            </div>
          </div>

          {!data.cholesterolUnknown && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-200">
              <div>
                <label className="block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1">
                  Total
                </label>
                <input
                  type="number"
                  value={data.cholesterolTotal || ""}
                  onChange={(e) =>
                    onChange({
                      cholesterolTotal: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 190"
                  className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1">
                  LDL ("Bad")
                </label>
                <input
                  type="number"
                  value={data.cholesterolLdl || ""}
                  onChange={(e) =>
                    onChange({
                      cholesterolLdl: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 110"
                  className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1">
                  HDL ("Good")
                </label>
                <input
                  type="number"
                  value={data.cholesterolHdl || ""}
                  onChange={(e) =>
                    onChange({
                      cholesterolHdl: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 50"
                  className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1">
                  Triglycerides
                </label>
                <input
                  type="number"
                  value={data.cholesterolTriglycerides || ""}
                  onChange={(e) =>
                    onChange({
                      cholesterolTriglycerides: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 140"
                  className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 2: Medical Conditions & Medications ─────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#FF6B00]" />
            <span>Pre-existing Conditions & Pharmacotherapy</span>
          </h3>
          <p className="text-xs text-[#667085] dark:text-slate-400">
            Select recognized diagnoses and ongoing prescription regimens.
          </p>
        </div>

        {/* Medical Conditions */}
        <div className="space-y-1.5">
          <SearchableSelect
            id="field-conditions"
            label="Medical Conditions"
            options={MEDICAL_CONDITIONS}
            selected={data.medicalConditions || []}
            onChange={(val) => onChange({ medicalConditions: val as string[] })}
            isMulti
            allowCustom
            placeholder="Search conditions (e.g. Hypertension, Arrhythmia)..."
            helperText="Multiple selections supported"
          />
        </div>

        {/* Current Medications */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#142033] dark:text-slate-200">
            Current Medications & Daily Regimen
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <SearchableSelect
                options={COMMON_MEDICATIONS}
                selected={newMedName}
                onChange={(val) => setNewMedName(val as string)}
                allowCustom
                placeholder="Search or enter medication (e.g. Metoprolol, Aspirin)..."
              />
            </div>
            <input
              type="text"
              value={newMedDose}
              onChange={(e) => setNewMedDose(e.target.value)}
              placeholder="Dosage (e.g. 50mg daily)"
              className="sm:w-44 rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddMedication}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] px-4 py-2 text-xs font-semibold hover:bg-orange-500/25 transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Medication</span>
            </button>
          </div>

          {/* List of Added Medications */}
          {data.currentMedications && data.currentMedications.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {data.currentMedications.map((med, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#142033] px-3 py-1.5 text-xs font-medium text-[#142033] dark:text-slate-100 shadow-sm"
                >
                  <Pill className="h-3.5 w-3.5 text-orange-500" />
                  <span>{med.name}</span>
                  {med.dosage && (
                    <span className="text-[#667085] dark:text-slate-400 font-mono">
                      ({med.dosage})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(idx)}
                    className="text-slate-400 hover:text-rose-500 ml-1 rounded p-0.5"
                    title="Remove medication"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Family History & Allergies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <SearchableSelect
              id="field-familyHistory"
              label="Family Medical History"
              options={FAMILY_HISTORY_ITEMS}
              selected={data.familyHistory || []}
              onChange={(val) => onChange({ familyHistory: val as string[] })}
              isMulti
              placeholder="Search family history..."
            />
          </div>

          <div className="space-y-1.5">
            <SearchableSelect
              id="field-allergies"
              label="Drug & Substance Allergies"
              options={ALLERGIES_LIST}
              selected={data.allergies || []}
              onChange={(val) => onChange({ allergies: val as string[] })}
              isMulti
              allowCustom
              placeholder="Search allergies..."
            />
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Lifestyle & Additional Info ──────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2">
            <Moon className="h-4 w-4 text-[#FF6B00]" />
            <span>Lifestyle & Behavioral Factors</span>
          </h3>
          <p className="text-xs text-[#667085] dark:text-slate-400">
            Clinical context for personalized AI disease risk scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Smoking Status */}
          <div className="space-y-1.5">
            <SearchableSelect
              id="field-smoking"
              label="Smoking Status"
              options={SMOKING_OPTIONS}
              selected={data.smokingStatus || "Never smoked"}
              onChange={(val) =>
                onChange({
                  smokingStatus: val as CardiacAssessmentData["smokingStatus"],
                })
              }
            />
          </div>

          {/* Physical Activity */}
          <div className="space-y-1.5">
            <SearchableSelect
              id="field-activity"
              label="Physical Activity Level"
              options={PHYSICAL_ACTIVITY_OPTIONS}
              selected={data.physicalActivity || "Moderately active"}
              onChange={(val) =>
                onChange({
                  physicalActivity: val as CardiacAssessmentData["physicalActivity"],
                })
              }
            />
          </div>

          {/* Sleep Duration */}
          <div className="space-y-1.5">
            <label
              htmlFor="field-sleep"
              className="block text-xs font-semibold text-[#142033] dark:text-slate-200"
            >
              Sleep Duration (hrs / night)
            </label>
            <input
              id="field-sleep"
              type="number"
              min={2}
              max={18}
              value={data.sleepDurationHours || 7}
              onChange={(e) =>
                onChange({
                  sleepDurationHours: e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              placeholder="e.g. 7"
              className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
            />
          </div>
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
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all"
        >
          <span>Continue to Symptoms & Wearable</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
