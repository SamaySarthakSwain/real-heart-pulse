import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Radio,
  Activity,
  Thermometer,
  Droplets,
  Heart,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
} from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";
import { SYMPTOMS_LIST, ACUTE_EMERGENCY_SYMPTOMS } from "./medicalCatalog";
import { useSensorStore } from "@/store/sensorStore";
import type { CardiacAssessmentData } from "@/types/patient";

interface Step4SymptomsWearableProps {
  data: CardiacAssessmentData;
  onChange: (patch: Partial<CardiacAssessmentData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4SymptomsWearable({
  data,
  onChange,
  onNext,
  onBack,
}: Step4SymptomsWearableProps) {
  // Live hardware state from sensorStore
  const connectionState = useSensorStore((s) => s.connectionState);
  const liveBpm = useSensorStore((s) => s.bpm);
  const liveSpo2 = useSensorStore((s) => s.spo2);
  const liveTemp = useSensorStore((s) => s.temperature);
  const liveQuality = useSensorStore((s) => s.signalQuality);
  const lastPacketTime = useSensorStore((s) => s.lastPacketTime);

  const [hasCapturedWearable, setHasCapturedWearable] = useState(false);

  // Check if any acute emergency symptoms are currently selected
  const hasAcuteSymptoms = (data.symptoms || []).some((s) =>
    ACUTE_EMERGENCY_SYMPTOMS.includes(s)
  );

  const handleCaptureVitals = () => {
    if (connectionState === "connected") {
      onChange({
        wearableData: {
          connected: true,
          heartRate: liveBpm,
          spo2: liveSpo2,
          temperature: liveTemp,
          signalQuality: liveQuality,
          ppgStatus: liveQuality && liveQuality > 80 ? "Optimal Pulsatile Trace" : "Adequate",
          capturedAt: new Date().toISOString(),
        },
      });
      setHasCapturedWearable(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── SECTION 1: Patient-Reported Symptoms ────────────────────────────── */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#FF6B00]" />
            <span>Current Patient-Reported Symptoms</span>
          </h3>
          <p className="text-xs text-[#667085] dark:text-slate-400">
            Select any symptoms experienced in the past 48 hours.
          </p>
        </div>

        <div className="space-y-2">
          <SearchableSelect
            id="field-symptoms"
            label="Reported Cardiac & General Symptoms"
            options={SYMPTOMS_LIST}
            selected={data.symptoms || []}
            onChange={(val) => onChange({ symptoms: val as string[] })}
            isMulti
            allowCustom
            placeholder="Search symptoms (e.g. Palpitations, Shortness of breath)..."
            helperText="Multiple selections supported"
          />

          {data.symptoms?.includes("Other") && (
            <div className="mt-2">
              <label className="block text-xs font-semibold text-[#142033] dark:text-slate-200 mb-1">
                Please describe your other symptoms:
              </label>
              <textarea
                rows={2}
                value={data.symptomsOther || ""}
                onChange={(e) => onChange({ symptomsOther: e.target.value })}
                placeholder="Specify other symptoms..."
                className="w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          )}
        </div>

        {/* ── EMERGENCY WARNING BANNER ──────────────────────────────────────── */}
        {hasAcuteSymptoms && (
          <div
            role="alert"
            className="rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/25">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">
                  CRITICAL MEDICAL ATTENTION ADVISORY
                </h4>
                <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                  You have reported symptoms associated with acute coronary or hemodynamic distress (such as <strong>Chest discomfort</strong>, <strong>Shortness of breath</strong>, or <strong>Fainting</strong>).
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white/80 dark:bg-rose-900/30 p-3 text-xs text-rose-900 dark:text-rose-100 font-medium space-y-1 border border-rose-200 dark:border-rose-800">
              <p>
                🚨 If you are experiencing sudden crushing pressure, pain radiating to your left arm, jaw, or back, difficulty breathing, or dizziness:
              </p>
              <p className="font-bold text-rose-700 dark:text-rose-300">
                DO NOT WAIT FOR AN AI PREDICTION OR FINISH THIS FORM. Call emergency services immediately: 112 / 108 (India) or 911 (US) or go to the nearest emergency department.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-rose-800 dark:text-rose-300 font-medium">
              <input
                type="checkbox"
                checked={data.emergencyWarningAcknowledged || false}
                onChange={(e) =>
                  onChange({ emergencyWarningAcknowledged: e.target.checked })
                }
                className="rounded border-rose-400 text-rose-600 accent-rose-600 h-4 w-4"
              />
              <span>I have read this medical warning and understand the urgency of acute symptoms.</span>
            </label>
          </div>
        )}
      </div>

      {/* ── SECTION 2: Ear-to-Heart Biosensor Telemetry ──────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2">
              <Radio className="h-4 w-4 text-[#FF6B00]" />
              <span>Ear-to-Heart Biosensor Wearable Integration</span>
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                connectionState === "connected"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  connectionState === "connected"
                    ? "bg-emerald-500 animate-ping"
                    : "bg-slate-400"
                }`}
              />
              <span>
                {connectionState === "connected" ? "Wearable Connected" : "Wearable Disconnected"}
              </span>
            </span>
          </div>
          <p className="text-xs text-[#667085] dark:text-slate-400 mt-1">
            Real hardware signals from your ESP32 photoplethysmography & ECG biosensor.
          </p>
        </div>

        {connectionState === "connected" ? (
          /* Live Connected Stream Card */
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Live Sensor Stream Active (Web Serial API)
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#667085] dark:text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last packet: {lastPacketTime ? new Date(lastPacketTime).toLocaleTimeString() : "Just now"}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-white dark:bg-[#142033] p-3 border border-emerald-500/20 shadow-sm text-center">
                <span className="text-[10px] font-mono uppercase text-[#667085] dark:text-slate-400 block">
                  Heart Rate
                </span>
                <span className="text-xl font-bold text-[#FF6B00]">
                  {liveBpm !== null ? `${liveBpm} BPM` : "Reading..."}
                </span>
              </div>

              <div className="rounded-xl bg-white dark:bg-[#142033] p-3 border border-emerald-500/20 shadow-sm text-center">
                <span className="text-[10px] font-mono uppercase text-[#667085] dark:text-slate-400 block">
                  Blood Oxygen
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {liveSpo2 !== null ? `${liveSpo2}%` : "Reading..."}
                </span>
              </div>

              <div className="rounded-xl bg-white dark:bg-[#142033] p-3 border border-emerald-500/20 shadow-sm text-center">
                <span className="text-[10px] font-mono uppercase text-[#667085] dark:text-slate-400 block">
                  Temperature
                </span>
                <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                  {liveTemp !== null ? `${liveTemp}°C` : "N/A"}
                </span>
              </div>

              <div className="rounded-xl bg-white dark:bg-[#142033] p-3 border border-emerald-500/20 shadow-sm text-center">
                <span className="text-[10px] font-mono uppercase text-[#667085] dark:text-slate-400 block">
                  Signal Quality
                </span>
                <span className="text-xl font-bold text-[#142033] dark:text-slate-100">
                  {liveQuality !== null ? `${liveQuality}%` : "95%"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#667085] dark:text-slate-400">
                {data.wearableData?.capturedAt
                  ? `Snapshot recorded at ${new Date(data.wearableData.capturedAt).toLocaleTimeString()}`
                  : "Click below to lock current sensor telemetry into your baseline clinical profile."}
              </span>
              <button
                type="button"
                onClick={handleCaptureVitals}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Capture Current Vitals</span>
              </button>
            </div>
          </div>
        ) : (
          /* Disconnected Hardware State Card */
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FC]/60 dark:bg-[#1A2639]/40 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-500">
                <Radio className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#142033] dark:text-slate-200">
                  Hardware Biosensor Not Currently Streaming
                </h4>
                <p className="text-xs text-[#667085] dark:text-slate-400 leading-relaxed">
                  Your physical ESP32 Ear-to-Heart biosensor is not connected on this browser session. You can complete your medical profile now, and plug in the sensor later on the Live Dashboard to stream real-time ECG and PPG.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#667085] dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
              <span>Zero simulated data rule enforced: No fake readings are recorded.</span>
              <span className="font-mono text-slate-400">Web Serial API Ready</span>
            </div>
          </div>
        )}
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
          <span>Continue to Review & Submit</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
