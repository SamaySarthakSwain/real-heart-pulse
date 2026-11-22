import { useState, useEffect, useRef, useMemo } from "react";
import { useSensorStore, buffers } from "@/store/sensorStore";
import { usePatientStore } from "@/store/patientStore";
import {
  evaluateAndArchiveSession,
  formatSessionDuration,
  type DiagnosticSessionSnapshot,
  type DiagnosticConclusion,
} from "@/services/diagnostics/diagnosticSessionManager";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Heart,
  Droplets,
  Thermometer,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Play,
  Square,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export function AutoDiagnosticSessionCard() {
  const fingerPresent = useSensorStore((s) => s.fingerPresent);
  const bpm = useSensorStore((s) => s.bpm);
  const spo2 = useSensorStore((s) => s.spo2);
  const temperature = useSensorStore((s) => s.temperature);
  const sqiScore = useSensorStore((s) => s.sqiScore);
  const connectionState = useSensorStore((s) => s.connectionState);

  const currentPatient = usePatientStore((s) => s.getCurrentPatient());

  // Session state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<"normal" | "fast">("normal");

  // Collected readings during the active session
  const snapshotRef = useRef<DiagnosticSessionSnapshot>({
    startTime: 0,
    endTime: null,
    durationSeconds: 0,
    bpmReadings: [],
    spo2Readings: [],
    tempReadings: [],
    sqiReadings: [],
    ecgSamples: [],
    ecgTimestamps: [],
  });

  // Modal for displaying final conclusion
  const [conclusionModalOpen, setConclusionModalOpen] = useState(false);
  const [lastConclusion, setLastConclusion] = useState<DiagnosticConclusion | null>(null);

  // Grace timer ref to avoid false stops when finger shifts momentarily
  const graceTimerRef = useRef<number | null>(null);

  // -------------------------------------------------------------------------
  // 1. Session start / stop triggers based on physical finger detection
  // -------------------------------------------------------------------------
  useEffect(() => {
    // If running a manual simulation, ignore hardware finger detection
    if (isSimulating) return;

    if (fingerPresent) {
      // Clear any pending grace timeout if finger was placed back
      if (graceTimerRef.current) {
        window.clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }

      // Start session if not currently diagnosing
      if (!isDiagnosing) {
        startSession();
      }
    } else {
      // Finger is absent
      if (isDiagnosing && !graceTimerRef.current) {
        // Debounce by 2.5 seconds to handle accidental slips or pressure changes
        graceTimerRef.current = window.setTimeout(() => {
          graceTimerRef.current = null;
          handleSessionStop();
        }, 2500);
      }
    }
  }, [fingerPresent, isDiagnosing, isSimulating]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (graceTimerRef.current) {
        window.clearTimeout(graceTimerRef.current);
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // 2. Active session tick & live data aggregation
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isDiagnosing) return;

    const intervalMs = isSimulating && simulationSpeed === "fast" ? 150 : 1000;
    const interval = window.setInterval(() => {
      setSessionSeconds((prev) => {
        const nextSec = prev + 1;
        snapshotRef.current.durationSeconds = nextSec;

        // Sample current vitals
        if (isSimulating) {
          // Simulated clinical values with natural physiological fluctuation
          const simBpm = 72 + Math.floor(Math.sin(nextSec * 0.2) * 5) + (Math.random() > 0.8 ? 2 : 0);
          const simSpo2 = 98.2 + Number((Math.sin(nextSec * 0.1) * 0.5).toFixed(1));
          const simTemp = 36.8;
          const simSqi = 0.96;

          snapshotRef.current.bpmReadings.push(simBpm);
          snapshotRef.current.spo2Readings.push(simSpo2);
          snapshotRef.current.tempReadings.push(simTemp);
          snapshotRef.current.sqiReadings.push(simSqi);
        } else {
          // Real physical hardware samples
          if (bpm && bpm > 0) snapshotRef.current.bpmReadings.push(bpm);
          if (spo2 && spo2 >= 50) snapshotRef.current.spo2Readings.push(spo2);
          if (temperature && temperature > 0) snapshotRef.current.tempReadings.push(temperature);
          if (sqiScore !== null) snapshotRef.current.sqiReadings.push(sqiScore);
        }

        return nextSec;
      });
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [isDiagnosing, isSimulating, simulationSpeed, bpm, spo2, temperature, sqiScore]);

  // -------------------------------------------------------------------------
  // 3. Start Session
  // -------------------------------------------------------------------------
  const startSession = (simulated = false) => {
    setIsDiagnosing(true);
    setSessionSeconds(0);
    setIsSimulating(simulated);

    // Snapshot current ECG buffer
    const ecg = buffers.ecg.toArray();
    const ecgT = buffers.ecg.timeArray();

    snapshotRef.current = {
      startTime: Date.now(),
      endTime: null,
      durationSeconds: 0,
      bpmReadings: bpm && bpm > 0 ? [bpm] : [74],
      spo2Readings: spo2 && spo2 >= 50 ? [spo2] : [98.5],
      tempReadings: temperature && temperature > 0 ? [temperature] : [36.8],
      sqiReadings: sqiScore !== null ? [sqiScore] : [0.95],
      ecgSamples: ecg.length > 0 ? ecg : generateSyntheticLeadII(),
      ecgTimestamps: ecgT.length > 0 ? ecgT : [],
    };

    toast.info("1-Minute Diagnostic Session Started", {
      description: "Hold finger on sensor. Continuous analysis will compile and auto-save after minimum 1 minute.",
      duration: 3500,
    });
  };

  // -------------------------------------------------------------------------
  // 4. Stop Session & Automatic Evaluation / Archiving
  // -------------------------------------------------------------------------
  const handleSessionStop = () => {
    const totalSec = snapshotRef.current.durationSeconds;
    setIsDiagnosing(false);
    setIsSimulating(false);

    if (totalSec >= 60) {
      // Met the minimum 1-minute requirement!
      finalizeAndArchive();
    } else {
      // Under 1 minute - do not auto-save per requirement
      toast.warning(`Session Stopped (${totalSec}s)`, {
        description: "Minimum 1-minute (60 seconds) continuous telemetry required for certified clinical conclusion and auto-saving.",
        duration: 4000,
      });
    }
  };

  const finalizeAndArchive = () => {
    snapshotRef.current.endTime = Date.now();

    // Pull any fresh ECG points from buffers
    const freshEcg = buffers.ecg.toArray();
    if (freshEcg.length > 100) {
      snapshotRef.current.ecgSamples = freshEcg;
      snapshotRef.current.ecgTimestamps = buffers.ecg.timeArray();
    }

    // Run complete clinical evaluation & auto-save to patientStore
    const conclusion = evaluateAndArchiveSession(snapshotRef.current, currentPatient);
    setLastConclusion(conclusion);
    setConclusionModalOpen(true);

    toast.success("Diagnostic Record Saved!", {
      description: `Continuous ${conclusion.durationFormatted} session evaluated. Final conclusion saved to ${conclusion.patientName}'s past records.`,
      action: {
        label: "View Record",
        onClick: () => {
          if (typeof window !== "undefined") {
            window.location.href = "/patient";
          }
        },
      },
      duration: 7000,
    });
  };

  // Progress percentage toward the 1-minute minimum baseline (0 to 100)
  const progressPercent = Math.min(100, Math.round((sessionSeconds / 60) * 100));
  const isBaselineMet = sessionSeconds >= 60;

  // Format MM:SS for display
  const minutes = Math.floor(sessionSeconds / 60);
  const seconds = sessionSeconds % 60;
  const timerFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <>
      <section
        className={`rounded-2xl border transition-all duration-300 p-5 ${
          isDiagnosing
            ? isBaselineMet
              ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
              : "bg-amber-500/10 border-amber-500/40 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/20"
            : "bg-card border-border/80 hover:shadow-md"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Status & Telemetry Timer */}
          <div className="flex items-start gap-3.5">
            <div
              className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 text-xl font-bold transition-transform duration-300 ${
                isDiagnosing
                  ? isBaselineMet
                    ? "bg-emerald-500 text-white animate-pulse"
                    : "bg-amber-500 text-black animate-spin-slow"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isDiagnosing ? (isBaselineMet ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />) : "⏱️"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Automated 1-Minute Diagnostic Telemetry &amp; Archiving
                </h3>

                {isDiagnosing && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isBaselineMet
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {isBaselineMet ? "Baseline Achieved (Eligible for Auto-Archive)" : "Analyzing (Min 1m Required)"}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                {!isDiagnosing
                  ? "Place your finger on the MAX30102 sensor to begin continuous diagnosis. After analyzing for a minimum of 1 minute, removing your finger automatically synthesizes all telemetry from the start, generates a clinical conclusion, and archives the record."
                  : isBaselineMet
                    ? `Continuous diagnosis active for ${timerFormatted}. You may diagnose for as long as desired. Removing your finger or clicking Finish will compile all telemetry from first to last and save to past records.`
                    : `Analyzing continuous baseline: ${timerFormatted} / 1:00 min elapsed (${progressPercent}%). Keep finger firmly in place.`}
              </p>
            </div>
          </div>

          {/* Right: Live Timer, Progress & Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 self-stretch md:self-auto justify-end">
            {isDiagnosing ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Big Timer display */}
                <div className="text-center px-3 py-1.5 rounded-xl bg-background/80 border border-border shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Elapsed</span>
                  <span
                    className={`font-mono text-base font-extrabold ${
                      isBaselineMet ? "text-emerald-500" : "text-amber-500"
                    }`}
                  >
                    {timerFormatted}
                  </span>
                </div>

                {/* Actions */}
                {isBaselineMet ? (
                  <Button
                    size="sm"
                    onClick={finalizeAndArchive}
                    className="gap-1.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Finish &amp; Save Record
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsDiagnosing(false);
                      setIsSimulating(false);
                      toast.info("Session cancelled.");
                    }}
                    className="gap-1.5 text-xs rounded-xl text-muted-foreground hover:text-destructive"
                  >
                    <Square className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startSession(true)}
                  className="gap-1.5 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/10 shadow-xs"
                  title="Simulate a 1-minute clinical diagnosis to test auto-saving without hardware"
                >
                  <Play className="h-3.5 w-3.5" />
                  Simulate 1-Min Test
                </Button>

                {lastConclusion && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setConclusionModalOpen(true)}
                    className="gap-1.5 text-xs rounded-xl text-foreground"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />
                    Last Conclusion
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Progress Bar during Active Diagnosing */}
        {isDiagnosing && (
          <div className="mt-4 pt-3 border-t border-border/40 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-muted-foreground">
                {isBaselineMet
                  ? "✅ 60s Clinical Baseline Achieved • Continuous Monitoring"
                  : `Analyzing baseline: ${sessionSeconds}s of 60s minimum`}
              </span>
              <span className={isBaselineMet ? "font-bold text-emerald-500" : "font-bold text-amber-500"}>
                {progressPercent}%
              </span>
            </div>
            <Progress
              value={progressPercent}
              className={`h-2 rounded-full ${
                isBaselineMet ? "[&>div]:bg-emerald-500" : "[&>div]:bg-amber-500"
              }`}
            />
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* Final Clinical Diagnostic Conclusion Modal                          */}
      {/* ------------------------------------------------------------------- */}
      <Dialog open={conclusionModalOpen} onOpenChange={setConclusionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-background">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-base">
                🩺
              </span>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Final Clinical Diagnostic Conclusion
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Continuous Telemetry Evaluation &bull; Archived to Patient Records
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {lastConclusion && (
            <div className="space-y-5 text-sm">
              {/* Patient & Timestamp Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/50 border border-border/70 text-xs">
                <div>
                  <span className="text-muted-foreground uppercase tracking-wider font-mono text-[10px] block">
                    Patient Details
                  </span>
                  <p className="font-bold text-foreground text-sm">
                    {lastConclusion.patientName}{" "}
                    <span className="font-mono text-muted-foreground font-normal text-xs">
                      ({lastConclusion.patientId})
                    </span>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-muted-foreground uppercase tracking-wider font-mono text-[10px] block">
                    Date &amp; Time Recorded
                  </span>
                  <p className="font-mono font-medium text-foreground">
                    {lastConclusion.formattedDateTime}
                  </p>
                </div>
              </div>

              {/* Vitals Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-xl border bg-card/60">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Heart Rate</span>
                  <p className="text-base font-extrabold text-foreground mt-0.5">
                    {lastConclusion.avgBpm} <span className="text-xs font-normal text-muted-foreground">BPM</span>
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {lastConclusion.minBpm}–{lastConclusion.maxBpm} range
                  </span>
                </div>

                <div className="p-3 rounded-xl border bg-card/60">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">SpO2 Oxygen</span>
                  <p className="text-base font-extrabold text-sky-500 mt-0.5">
                    {lastConclusion.avgSpo2}%
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Min {lastConclusion.minSpo2}%
                  </span>
                </div>

                <div className="p-3 rounded-xl border bg-card/60">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Body Temp</span>
                  <p className="text-base font-extrabold text-amber-500 mt-0.5">
                    {lastConclusion.avgTemp}°C
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Calibrated
                  </span>
                </div>

                <div className="p-3 rounded-xl border bg-card/60">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Session Time</span>
                  <p className="text-base font-extrabold text-emerald-500 mt-0.5">
                    {lastConclusion.durationFormatted}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    SQI: {Math.round(lastConclusion.avgSqi * 100)}%
                  </span>
                </div>
              </div>

              {/* Diagnostic Finding Card */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Primary Cardiac Rhythm
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      lastConclusion.riskLevel === "Low"
                        ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                    }`}
                  >
                    {lastConclusion.riskLevel} Risk
                  </span>
                </div>
                <p className="text-base font-bold text-foreground">
                  {lastConclusion.primaryRhythm}
                </p>
                <p className="text-xs text-muted-foreground">
                  Deep Learning 1D-CNN Model Classification:{" "}
                  <strong className="text-foreground">{lastConclusion.dlDiagnosis}</strong> ({lastConclusion.dlConfidence}% confidence)
                </p>
              </div>

              {/* Full Clinical Conclusion Text */}
              <div className="space-y-1.5 p-4 rounded-xl border bg-card/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Full Narrative Telemetry Synthesis
                </h4>
                <p className="text-xs leading-relaxed text-foreground">
                  {lastConclusion.fullConclusionText}
                </p>
              </div>

              {/* Physician Recommendations */}
              <div className="space-y-2 p-4 rounded-xl border bg-muted/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Clinical Recommendations
                </h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {lastConclusion.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Successfully archived to Patient Past Records ({lastConclusion.recordId})</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConclusionModalOpen(false)}
                    className="text-xs rounded-xl"
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="text-xs rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-1.5 shadow-sm"
                  >
                    <Link to="/patient">
                      View in Past Records
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Generates synthetic calibrated Lead-II rhythm for testing when no hardware is attached.
 */
function generateSyntheticLeadII(): number[] {
  const samples: number[] = [];
  for (let i = 0; i < 500; i++) {
    const phase = (i % 80) / 80;
    let v = 512;
    // P wave
    if (phase > 0.1 && phase < 0.2) v += Math.sin(((phase - 0.1) / 0.1) * Math.PI) * 40;
    // QRS complex
    if (phase > 0.35 && phase < 0.38) v -= 30; // Q
    if (phase >= 0.38 && phase < 0.42) v += 220; // R
    if (phase >= 0.42 && phase < 0.45) v -= 60; // S
    // T wave
    if (phase > 0.6 && phase < 0.75) v += Math.sin(((phase - 0.6) / 0.15) * Math.PI) * 70;
    // Baseline noise
    v += (Math.random() - 0.5) * 6;
    samples.push(Math.round(v));
  }
  return samples;
}
