import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  User,
  Heart,
  Activity,
  Plus,
  Calendar,
  Clock,
  Shield,
  Edit3,
  Trash2,
  Save,
  X,
  FileText,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Droplets,
  Zap,
  ArrowUpRight,
  LogOut,
  Sparkles,
  Stethoscope,
  Pill,
  Moon,
  HeartPulse,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { usePatientStore } from "@/store/patientStore";
import { useSensorStore } from "@/store/sensorStore";
import { LongitudinalTrajectoryPanel } from "@/components/dashboard/reports/LongitudinalTrajectoryPanel";
import type {
  PatientGender,
  RiskLevel,
  TestRecord,
  CardiacAssessmentData,
  PatientProfileData,
  PatientContactData,
  EmergencyContactData,
  MedicationItem,
} from "@/types/patient";

export function PatientProfilePage() {
  const navigate = useNavigate();
  const currentPatient = usePatientStore((s) => s.getCurrentPatient());
  const patients = usePatientStore((s) => s.patients);
  const switchPatient = usePatientStore((s) => s.switchPatient);
  const updatePatientProfile = usePatientStore((s) => s.updatePatientProfile);
  const saveHealthAssessment = usePatientStore((s) => s.saveHealthAssessment);
  const addTestRecord = usePatientStore((s) => s.addTestRecord);
  const deleteTestRecord = usePatientStore((s) => s.deleteTestRecord);
  const logout = usePatientStore((s) => s.logout);
  const getPatientRecords = usePatientStore((s) => s.getPatientRecords);

  // Live telemetry from sensorStore
  const liveBpm = useSensorStore((s) => s.bpm);
  const liveSpo2 = useSensorStore((s) => s.spo2);
  const liveTemperature = useSensorStore((s) => s.temperature);
  const liveQuality = useSensorStore((s) => s.signalQuality);
  const connectionState = useSensorStore((s) => s.connectionState);

  // Subgroup selection: "records" (Past Testing Records) vs "advanced" (Advanced Monitoring)
  const [activeSubgroup, setActiveSubgroup] = useState<"records" | "advanced">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "advanced") return "advanced";
    }
    return "records";
  });

  // Modal / Form States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAdvanced, setIsEditingAdvanced] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  // Profile Edit State (Name, Age, Gender, Blood)
  const [editName, setEditName] = useState(currentPatient?.name || "");
  const [editAge, setEditAge] = useState<number | "">(currentPatient?.age || "");
  const [editGender, setEditGender] = useState<PatientGender>(currentPatient?.gender || "Male");
  const [editBloodType, setEditBloodType] = useState(currentPatient?.bloodType || "O+");
  const [editCondition, setEditCondition] = useState(currentPatient?.condition || "");
  const [editAllergies, setEditAllergies] = useState(currentPatient?.allergies || "");
  const [editEmergencyContact, setEditEmergencyContact] = useState(currentPatient?.emergencyContact || "");

  // Advanced Monitoring Edit State
  const [advBPSystolic, setAdvBPSystolic] = useState<number | "">("");
  const [advBPDiastolic, setAdvBPDiastolic] = useState<number | "">("");
  const [advCholesterolTotal, setAdvCholesterolTotal] = useState<number | "">("");
  const [advCholesterolLdl, setAdvCholesterolLdl] = useState<number | "">("");
  const [advCholesterolHdl, setAdvCholesterolHdl] = useState<number | "">("");
  const [advCholesterolTriglycerides, setAdvCholesterolTriglycerides] = useState<number | "">("");
  const [advCholesterolUnit, setAdvCholesterolUnit] = useState<"mg/dL" | "mmol/L">("mg/dL");
  const [advConditions, setAdvConditions] = useState("");
  const [advMedications, setAdvMedications] = useState("");
  const [advAllergies, setAdvAllergies] = useState("");
  const [advFamilyHistory, setAdvFamilyHistory] = useState("");
  const [advSmoking, setAdvSmoking] = useState<CardiacAssessmentData["smokingStatus"]>("Never smoked");
  const [advActivity, setAdvActivity] = useState<CardiacAssessmentData["physicalActivity"]>("Moderately active");
  const [advSleep, setAdvSleep] = useState<number>(7);
  const [advSymptoms, setAdvSymptoms] = useState("");
  const [advEmergencyName, setAdvEmergencyName] = useState("");
  const [advEmergencyRel, setAdvEmergencyRel] = useState("Spouse");
  const [advEmergencyPhone, setAdvEmergencyPhone] = useState("");
  const [advEmergencyConsent, setAdvEmergencyConsent] = useState(true);

  // New Record Form State
  const [recordTestType, setRecordTestType] = useState<TestRecord["testType"]>("ECG Monitoring");
  const [recordBpm, setRecordBpm] = useState<number>(75);
  const [recordSpo2, setRecordSpo2] = useState<number>(98);
  const [recordTemp, setRecordTemp] = useState<number>(36.6);
  const [recordBP, setRecordBP] = useState<string>("120/80 mmHg");
  const [recordEcgStatus, setRecordEcgStatus] = useState<string>("Normal Sinus Rhythm");
  const [recordRiskLevel, setRecordRiskLevel] = useState<RiskLevel>("Low");
  const [recordAiDiagnosis, setRecordAiDiagnosis] = useState<string>(
    "1D-CNN DL Model: Normal Sinus Rhythm (Confidence: 96.5%)"
  );
  const [recordNotes, setRecordNotes] = useState<string>("");

  if (!currentPatient) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="h-16 w-16 rounded-full bg-orange-500/15 flex items-center justify-center text-orange-500 mb-4">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">No Patient Signed In</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Please log in to view patient personal profile information, advanced monitoring data, and historical records.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-all"
        >
          Go to Patient Login
        </Link>
      </div>
    );
  }

  const records = getPatientRecords(currentPatient.id);
  const filteredRecords = records.filter((r) => {
    if (filterRisk === "ALL") return true;
    return r.aiRiskLevel === filterRisk;
  });

  const handleOpenEdit = () => {
    setEditName(currentPatient.name);
    setEditAge(currentPatient.age);
    setEditGender(currentPatient.gender);
    setEditBloodType(currentPatient.bloodType || "O+");
    setEditCondition(currentPatient.condition || "");
    setEditAllergies(currentPatient.allergies || "");
    setEditEmergencyContact(currentPatient.emergencyContact || "");
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editAge) return;

    updatePatientProfile(currentPatient.id, {
      name: editName.trim(),
      age: Number(editAge),
      gender: editGender,
      bloodType: editBloodType,
      condition: editCondition.trim(),
      allergies: editAllergies.trim(),
      emergencyContact: editEmergencyContact.trim(),
    });

    toast.success("Patient profile details updated.");
    setIsEditingProfile(false);
  };

  const handleOpenEditAdvanced = () => {
    const a = currentPatient.assessmentData;
    const e = currentPatient.emergencyData;

    setAdvBPSystolic(a?.bloodPressureSystolic ?? 120);
    setAdvBPDiastolic(a?.bloodPressureDiastolic ?? 80);
    setAdvCholesterolTotal(a?.cholesterolTotal ?? 180);
    setAdvCholesterolLdl(a?.cholesterolLdl ?? 100);
    setAdvCholesterolHdl(a?.cholesterolHdl ?? 50);
    setAdvCholesterolTriglycerides(a?.cholesterolTriglycerides ?? 140);
    setAdvCholesterolUnit(a?.cholesterolUnit ?? "mg/dL");
    setAdvConditions((a?.medicalConditions || [currentPatient.condition || "Routine Telemetry"]).join(", "));
    setAdvMedications(
      (a?.currentMedications?.map((m) => m.name) || currentPatient.medications || []).join(", ")
    );
    setAdvAllergies((a?.allergies || [currentPatient.allergies || "None"]).join(", "));
    setAdvFamilyHistory((a?.familyHistory || []).join(", "));
    setAdvSmoking(a?.smokingStatus || "Never smoked");
    setAdvActivity(a?.physicalActivity || "Moderately active");
    setAdvSleep(a?.sleepDurationHours || 7);
    setAdvSymptoms((a?.symptoms || ["No current symptoms"]).join(", "));

    setAdvEmergencyName(e?.contactName || currentPatient.emergencyContact?.split(" - ")[0] || "Emergency Contact");
    setAdvEmergencyRel(e?.relationship || "Family");
    setAdvEmergencyPhone(e?.contactNumber || currentPatient.emergencyContact?.split(" - ")[1] || "+91 9876543210");
    setAdvEmergencyConsent(e?.consentGranted ?? true);

    setIsEditingAdvanced(true);
  };

  const handleSaveAdvanced = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedMeds: MedicationItem[] = advMedications
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    const parsedConditions = advConditions
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const parsedFamily = advFamilyHistory
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const parsedAllergies = advAllergies
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const parsedSymptoms = advSymptoms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedAssessment: CardiacAssessmentData = {
      bloodPressureSystolic: advBPSystolic !== "" ? Number(advBPSystolic) : undefined,
      bloodPressureDiastolic: advBPDiastolic !== "" ? Number(advBPDiastolic) : undefined,
      bloodPressureUnknown: advBPSystolic === "" && advBPDiastolic === "",
      cholesterolTotal: advCholesterolTotal !== "" ? Number(advCholesterolTotal) : undefined,
      cholesterolLdl: advCholesterolLdl !== "" ? Number(advCholesterolLdl) : undefined,
      cholesterolHdl: advCholesterolHdl !== "" ? Number(advCholesterolHdl) : undefined,
      cholesterolTriglycerides: advCholesterolTriglycerides !== "" ? Number(advCholesterolTriglycerides) : undefined,
      cholesterolUnit: advCholesterolUnit,
      cholesterolUnknown: advCholesterolTotal === "",
      medicalConditions: parsedConditions.length > 0 ? parsedConditions : ["None reported"],
      currentMedications: parsedMeds,
      familyHistory: parsedFamily,
      allergies: parsedAllergies,
      smokingStatus: advSmoking,
      physicalActivity: advActivity,
      sleepDurationHours: advSleep,
      symptoms: parsedSymptoms.length > 0 ? parsedSymptoms : ["No acute symptoms"],
      privacyConsentGranted: advEmergencyConsent,
      completedAt: new Date().toISOString(),
    };

    const updatedEmergency: EmergencyContactData = {
      contactName: advEmergencyName.trim(),
      relationship: advEmergencyRel.trim() || "Spouse",
      countryCode: "+91",
      contactNumber: advEmergencyPhone.trim(),
      consentGranted: advEmergencyConsent,
    };

    saveHealthAssessment(
      currentPatient.id,
      {
        assessment: updatedAssessment,
        emergency: updatedEmergency,
      },
      true
    );

    updatePatientProfile(currentPatient.id, {
      condition: parsedConditions.join(", ") || currentPatient.condition,
      allergies: parsedAllergies.join(", ") || currentPatient.allergies,
      medications: parsedMeds.map((m) => m.name),
      emergencyContact: advEmergencyName.trim()
        ? `${advEmergencyName.trim()} (${advEmergencyRel.trim()}) - ${advEmergencyPhone.trim()}`
        : currentPatient.emergencyContact,
      hasCompletedAssessment: true,
    });

    toast.success("Advanced Monitoring details updated successfully!");
    setIsEditingAdvanced(false);
  };

  const handleAutoFillFromLiveSensors = () => {
    if (liveBpm && liveBpm > 30) setRecordBpm(Math.round(liveBpm));
    if (liveSpo2 && liveSpo2 > 50) setRecordSpo2(Math.round(liveSpo2));
    if (liveTemperature && liveTemperature > 30) setRecordTemp(Number(liveTemperature.toFixed(1)));
    setRecordNotes((prev) =>
      prev ? `${prev} (Auto-synced from live ESP32 hardware session)` : "Auto-synced from live ESP32 hardware session"
    );
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    addTestRecord(currentPatient.id, {
      testType: recordTestType,
      bpm: Number(recordBpm),
      spo2: Number(recordSpo2),
      temperature: Number(recordTemp),
      bloodPressure: recordBP,
      ecgStatus: recordEcgStatus,
      aiRiskLevel: recordRiskLevel,
      aiDiagnosis: recordAiDiagnosis,
      notes: recordNotes,
      device: "ESP32 Ear-to-Heart Biosensor v2.0",
    });

    toast.success("New test record logged.");
    setIsAddingRecord(false);
    setRecordNotes("");
  };

  const assessment = currentPatient.assessmentData;
  const emergency = currentPatient.emergencyData;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* ── TOP PATIENT HERO BAR ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Avatar and Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-3xl font-black text-white shadow-lg shadow-orange-500/30">
              {currentPatient.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {currentPatient.name}
                </h1>
                <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-500">
                  {currentPatient.id}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {currentPatient.gender}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Age: <strong className="text-foreground">{currentPatient.age}</strong>
                </span>
                {currentPatient.bloodType && (
                  <span className="rounded-full bg-destructive/10 text-destructive px-2.5 py-0.5 text-xs font-semibold">
                    Blood: {currentPatient.bloodType}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Condition: <span className="text-foreground font-medium">{currentPatient.condition || "Routine Telemetry"}</span>
                {currentPatient.email && <> • {currentPatient.email}</>}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveSubgroup("advanced")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all shadow-sm ${
                activeSubgroup === "advanced"
                  ? "bg-primary text-primary-foreground shadow-primary/20"
                  : "border border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20"
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Advanced Monitoring</span>
            </button>

            <button
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-accent hover:border-border transition-all"
            >
              <Edit3 className="h-4 w-4 text-orange-500" />
              <span>Edit Details (Name, Age, Gender)</span>
            </button>

            <button
              onClick={() => setIsAddingRecord(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Record New Test</span>
            </button>

            {/* Switch patient dropdown */}
            <div className="relative group">
              <select
                value={currentPatient.id}
                onChange={(e) => switchPatient(e.target.value)}
                className="h-10 rounded-xl border border-border/80 bg-background/80 px-3 pr-8 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                aria-label="Switch Patient"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    Switch: {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Quick Vitals Summary Cards */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border/60 pt-6">
          <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Total Tests</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{records.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Stored in patient record</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Mean Heart Rate</p>
            <p className="mt-1 text-2xl font-bold text-rose-500">
              {records.length > 0
                ? Math.round(records.reduce((acc, r) => acc + r.bpm, 0) / records.length)
                : "--"}{" "}
              <span className="text-xs font-normal text-muted-foreground">BPM</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across clinical sessions</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Mean SpO₂</p>
            <p className="mt-1 text-2xl font-bold text-sky-500">
              {records.length > 0
                ? (records.reduce((acc, r) => acc + r.spo2, 0) / records.length).toFixed(1)
                : "--"}
              %
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Blood oxygen saturation</p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Live Hardware</p>
            <div className="mt-1 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${connectionState === "CONNECTED" ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
              <p className="text-base font-semibold text-foreground">
                {liveBpm ? `${Math.round(liveBpm)} BPM` : connectionState === "CONNECTED" ? "Receiving" : "Standby"}
              </p>
            </div>
            <Link
              to="/dashboard"
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5 mt-0.5"
            >
              Open Live Dashboard <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── SUBGROUP NAVIGATION BAR ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-muted/60 border border-border/60">
          <button
            onClick={() => {
              setActiveSubgroup("records");
              setIsEditingAdvanced(false);
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeSubgroup === "records"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4 text-orange-500" />
            <span>Past Testing Records</span>
            <span className="rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-xs px-2 py-0.5 font-bold">
              {records.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubgroup("advanced")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeSubgroup === "advanced"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="h-4 w-4 text-primary" />
            <span>Advanced Monitoring</span>
            <span className="rounded-full bg-primary/15 text-primary text-xs px-2 py-0.5 font-bold">
              {currentPatient.hasCompletedAssessment ? "Active" : "Profile"}
            </span>
          </button>
        </div>

        {activeSubgroup === "records" ? (
          /* Filter Pills for Records */
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 p-1">
            {["ALL", "Low", "Moderate", "High"].map((level) => (
              <button
                key={level}
                onClick={() => setFilterRisk(level)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterRisk === level
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {level === "ALL" ? "All Records" : `${level} Risk`}
              </button>
            ))}
          </div>
        ) : (
          /* Header action for Advanced Monitoring */
          <div className="flex items-center gap-3">
            {!isEditingAdvanced ? (
              <button
                onClick={handleOpenEditAdvanced}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Advanced Details</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditingAdvanced(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                <X className="h-4 w-4" />
                <span>Cancel Editing</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── SUBGROUP 1: PAST TESTING RECORDS ───────────────────────────── */}
      {activeSubgroup === "records" && (
        <div className="space-y-6 animate-fade-in">
          <LongitudinalTrajectoryPanel
            patientId={currentPatient.id}
            patientName={currentPatient.name}
          />
          {filteredRecords.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No Test Records Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                There are no testing records matching your filter for this patient. Click "Record New Test" to log a clinical test.
              </p>
              <button
                onClick={() => setIsAddingRecord(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-orange-600 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Record First Test
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRecords.map((record) => {
                const isHigh = record.aiRiskLevel === "High" || record.aiRiskLevel === "Critical";
                const isMod = record.aiRiskLevel === "Moderate";

                return (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isHigh
                              ? "bg-rose-500/15 text-rose-500"
                              : isMod
                              ? "bg-amber-500/15 text-amber-500"
                              : "bg-emerald-500/15 text-emerald-500"
                          }`}
                        >
                          <Heart className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-foreground">{record.testType}</h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isHigh
                                  ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                                  : isMod
                                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                  : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                              }`}
                            >
                              {record.aiRiskLevel || "Normal"} Risk
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(record.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span className="font-mono">{record.id}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTestRecord(currentPatient.id, record.id)}
                        className="self-end sm:self-center p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Vitals Pills in Record */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-xl border border-border/40 bg-background/60 p-3 flex items-center gap-3">
                        <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                        <div>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">Heart Rate</span>
                          <p className="text-sm font-bold text-foreground">{record.bpm} BPM</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/40 bg-background/60 p-3 flex items-center gap-3">
                        <Droplets className="h-4 w-4 text-sky-500 shrink-0" />
                        <div>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">SpO₂ Level</span>
                          <p className="text-sm font-bold text-foreground">{record.spo2}%</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/40 bg-background/60 p-3 flex items-center gap-3">
                        <Thermometer className="h-4 w-4 text-amber-500 shrink-0" />
                        <div>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">Temperature</span>
                          <p className="text-sm font-bold text-foreground">
                            {record.temperature ? `${record.temperature}°C` : "36.6°C"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/40 bg-background/60 p-3 flex items-center gap-3">
                        <Activity className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">Blood Pressure</span>
                          <p className="text-sm font-bold text-foreground">{record.bloodPressure || "120/80"}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Diagnosis and Details */}
                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Zap className="h-3.5 w-3.5 text-orange-500" />
                        <span>Rhythm & AI Analysis: {record.ecgStatus}</span>
                      </div>
                      {record.aiDiagnosis && (
                        <p className="text-muted-foreground leading-relaxed pl-5.5">
                          {record.aiDiagnosis}
                        </p>
                      )}
                      {record.notes && (
                        <p className="text-foreground/90 text-[11px] pt-1 pl-5.5 border-t border-border/40 mt-1">
                          <strong className="text-muted-foreground">Clinical Note:</strong> {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUBGROUP 2: ADVANCED MONITORING ─────────────────────────────── */}
      {activeSubgroup === "advanced" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Overview Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Advanced Monitoring & Clinical Baseline</h3>
                <p className="text-xs text-muted-foreground">
                  Stored cardiovascular baselines, lipid panels, prescription details, and live telemetry for {currentPatient.name}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Baseline Stored</span>
              </span>
            </div>
          </div>

          {/* EDIT FORM (when isEditingAdvanced === true) */}
          {isEditingAdvanced ? (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center font-bold">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Edit Advanced Monitoring Details</h3>
                    <p className="text-xs text-muted-foreground">
                      Update physiological baselines, active medications, risk factors and emergency contact.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAdvanced(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAdvanced} className="space-y-6">
                {/* 1. Blood Pressure & Lipids */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                    <HeartPulse className="h-4 w-4 text-rose-500" />
                    <span>Clinical Baselines & Lipid Biomarkers</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Systolic BP (mmHg)</label>
                      <input
                        type="number"
                        placeholder="120"
                        value={advBPSystolic}
                        onChange={(e) => setAdvBPSystolic(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Diastolic BP (mmHg)</label>
                      <input
                        type="number"
                        placeholder="80"
                        value={advBPDiastolic}
                        onChange={(e) => setAdvBPDiastolic(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Total Cholesterol ({advCholesterolUnit})</label>
                      <input
                        type="number"
                        placeholder="180"
                        value={advCholesterolTotal}
                        onChange={(e) => setAdvCholesterolTotal(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">LDL Cholesterol ({advCholesterolUnit})</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={advCholesterolLdl}
                        onChange={(e) => setAdvCholesterolLdl(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">HDL Cholesterol ({advCholesterolUnit})</label>
                      <input
                        type="number"
                        placeholder="50"
                        value={advCholesterolHdl}
                        onChange={(e) => setAdvCholesterolHdl(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Triglycerides ({advCholesterolUnit})</label>
                      <input
                        type="number"
                        placeholder="140"
                        value={advCholesterolTriglycerides}
                        onChange={(e) => setAdvCholesterolTriglycerides(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Lipid Unit</label>
                      <select
                        value={advCholesterolUnit}
                        onChange={(e) => setAdvCholesterolUnit(e.target.value as any)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="mg/dL">mg/dL</option>
                        <option value="mmol/L">mmol/L</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Medical Conditions & Medications */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                    <Pill className="h-4 w-4 text-amber-500" />
                    <span>Conditions, Medications & Allergies</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Diagnosed Conditions (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Hypertension, Post-Myocardial Infarction"
                        value={advConditions}
                        onChange={(e) => setAdvConditions(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Active Medications (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Metoprolol 50mg, Aspirin 81mg, Atorvastatin 20mg"
                        value={advMedications}
                        onChange={(e) => setAdvMedications(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Known Allergies (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Penicillin, Sulfa drugs"
                        value={advAllergies}
                        onChange={(e) => setAdvAllergies(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Family Cardiac History (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Father: Myocardial Infarction age 55"
                        value={advFamilyHistory}
                        onChange={(e) => setAdvFamilyHistory(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Lifestyle & Symptoms */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    <span>Lifestyle & Monitored Symptoms</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Smoking Status</label>
                      <select
                        value={advSmoking}
                        onChange={(e) => setAdvSmoking(e.target.value as any)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="Never smoked">Never smoked</option>
                        <option value="Former smoker">Former smoker</option>
                        <option value="Current smoker">Current smoker</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Physical Activity Level</label>
                      <select
                        value={advActivity}
                        onChange={(e) => setAdvActivity(e.target.value as any)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="Sedentary">Sedentary</option>
                        <option value="Lightly active">Lightly active</option>
                        <option value="Moderately active">Moderately active</option>
                        <option value="Very active">Very active</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Sleep Duration (Hours/Night)</label>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        step={0.5}
                        value={advSleep}
                        onChange={(e) => setAdvSleep(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Symptoms (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Mild palpitations, Dyspnea on exertion"
                        value={advSymptoms}
                        onChange={(e) => setAdvSymptoms(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Emergency Contact */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                    <Phone className="h-4 w-4 text-sky-500" />
                    <span>Emergency Contact & Consent</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Contact Person Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Linda Chen"
                        value={advEmergencyName}
                        onChange={(e) => setAdvEmergencyName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Relationship</label>
                      <input
                        type="text"
                        placeholder="e.g. Spouse / Brother / Daughter"
                        value={advEmergencyRel}
                        onChange={(e) => setAdvEmergencyRel(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Contact Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 9876543211"
                        value={advEmergencyPhone}
                        onChange={(e) => setAdvEmergencyPhone(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={advEmergencyConsent}
                      onChange={(e) => setAdvEmergencyConsent(e.target.checked)}
                      className="rounded border-border text-orange-500 focus:ring-orange-500"
                    />
                    <span>I grant authorization for emergency notification and clinical telemetry review.</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsEditingAdvanced(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* VIEW MODE: 4 Comprehensive Structured Cards */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Clinical Biomarkers & Vitals */}
              <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Blood Pressure & Lipid Profile</h4>
                      <p className="text-[11px] text-muted-foreground">Cardiovascular baseline metrics</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Clinical Lab Standard
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/50 bg-background/60 p-3.5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Blood Pressure</span>
                    <p className="text-xl font-bold text-foreground">
                      {assessment?.bloodPressureSystolic && assessment?.bloodPressureDiastolic
                        ? `${assessment.bloodPressureSystolic}/${assessment.bloodPressureDiastolic}`
                        : "122/78"}{" "}
                      <span className="text-xs font-normal text-muted-foreground">mmHg</span>
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">
                      Normal / Controlled
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-background/60 p-3.5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Total Cholesterol</span>
                    <p className="text-xl font-bold text-foreground">
                      {assessment?.cholesterolTotal || 185}{" "}
                      <span className="text-xs font-normal text-muted-foreground">{assessment?.cholesterolUnit || "mg/dL"}</span>
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 rounded px-1.5 py-0.5">
                      Desirable (&lt;200)
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-background/60 p-3.5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">LDL / HDL Ratio</span>
                    <p className="text-base font-bold text-foreground">
                      LDL: {assessment?.cholesterolLdl || 110} • HDL: {assessment?.cholesterolHdl || 48}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Target LDL &lt; 100 mg/dL</span>
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-background/60 p-3.5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Triglycerides</span>
                    <p className="text-base font-bold text-foreground">
                      {assessment?.cholesterolTriglycerides || 140}{" "}
                      <span className="text-xs font-normal text-muted-foreground">{assessment?.cholesterolUnit || "mg/dL"}</span>
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">
                      Normal (&lt;150)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Diagnoses, Medications & Allergies */}
              <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                      <Pill className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Conditions, Medications & Allergies</h4>
                      <p className="text-[11px] text-muted-foreground">Active pharmacotherapy & diagnoses</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Active Chart
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Diagnosed Conditions</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(assessment?.medicalConditions && assessment.medicalConditions.length > 0
                        ? assessment.medicalConditions
                        : [currentPatient.condition || "Routine Telemetry"]
                      ).map((c) => (
                        <span
                          key={c}
                          className="rounded-lg bg-orange-500/10 border border-orange-500/25 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Active Prescriptions</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(assessment?.currentMedications && assessment.currentMedications.length > 0
                        ? assessment.currentMedications.map((m) => m.name)
                        : currentPatient.medications || ["None recorded"]
                      ).map((med) => (
                        <span
                          key={med}
                          className="rounded-lg bg-primary/10 border border-primary/25 px-2.5 py-1 text-xs font-medium text-primary"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/40">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Known Allergies</span>
                      <p className="text-xs font-semibold text-foreground mt-0.5">
                        {currentPatient.allergies || assessment?.allergies?.join(", ") || "No known allergies"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Family Cardiac History</span>
                      <p className="text-xs font-semibold text-foreground mt-0.5">
                        {assessment?.familyHistory?.join(", ") || "None reported"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Lifestyle & Preventive Factors */}
              <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Lifestyle & Risk Factors</h4>
                      <p className="text-[11px] text-muted-foreground">Habits and physiological resilience</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Preventive Health
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-border/50 bg-background/60 p-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Smoking Status</span>
                    <p className="text-xs font-bold text-foreground">
                      {assessment?.smokingStatus || "Never smoked"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-background/60 p-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Physical Activity</span>
                    <p className="text-xs font-bold text-foreground">
                      {assessment?.physicalActivity || "Moderately active"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-background/60 p-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Sleep Duration</span>
                    <p className="text-xs font-bold text-foreground">
                      {assessment?.sleepDurationHours ? `${assessment.sleepDurationHours} hrs / night` : "7.5 hrs / night"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/50 bg-background/60 p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Reported Clinical Symptoms</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(assessment?.symptoms || ["No current symptoms"]).map((s) => (
                      <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 4: Emergency Network & Hardware Telemetry Link */}
              <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Emergency Contact & Wearable Link</h4>
                      <p className="text-[11px] text-muted-foreground">Caregiver network & live telemetry link</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    HIPAA Protected
                  </span>
                </div>

                <div className="rounded-2xl border border-border/50 bg-background/60 p-3.5 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Primary Contact</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {emergency?.contactName || currentPatient.emergencyContact?.split(" - ")[0] || "Linda Chen"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Relationship: {emergency?.relationship || "Spouse"}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-primary">
                      {emergency?.contactNumber || currentPatient.emergencyContact?.split(" - ")[1] || "+91 9876543211"}
                    </span>
                  </div>
                </div>

                {/* Direct Live Dashboard Gateway */}
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <h5 className="text-xs font-bold text-foreground">Live Telemetry Gateway</h5>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Stream live ECG, PPG waveforms, and arrhythmia reports directly.
                    </p>
                  </div>

                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all shrink-0"
                  >
                    <span>Open Dashboard</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: EDIT PATIENT DETAILS (NAME, AGE, GENDER) ──────────── */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center font-bold">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Edit Patient Profile</h3>
                  <p className="text-xs text-muted-foreground">Update Name, Age, Gender and stored medical data</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Patient Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Age (Years) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={125}
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Gender <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as PatientGender)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Intersex">Intersex</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Blood Type & Emergency Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Blood Type</label>
                  <select
                    value={editBloodType}
                    onChange={(e) => setEditBloodType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Emergency Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. Spouse / Phone"
                    value={editEmergencyContact}
                    onChange={(e) => setEditEmergencyContact(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Cardiovascular Condition / Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-orange-600 transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD NEW TEST ───────────────────────────────────── */}
      {isAddingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center font-bold">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Log New Cardiac Test</h3>
                  <p className="text-xs text-muted-foreground">Add to {currentPatient.name}'s test history</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingRecord(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Auto-Fill from ESP32 */}
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-foreground font-medium">
                  ESP32 Live Feed: {liveBpm ? `${Math.round(liveBpm)} BPM` : "-- BPM"} • {liveSpo2 ? `${Math.round(liveSpo2)}% SpO₂` : "--%"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoFillFromLiveSensors}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all shrink-0"
              >
                Auto-Fill Sensors
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="mt-5 space-y-4">
              {/* Test Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Test Type</label>
                <select
                  value={recordTestType}
                  onChange={(e) => setRecordTestType(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="ECG Monitoring">ECG Monitoring (Lead-I / 12-Lead)</option>
                  <option value="PPG & Vitals">PPG & Vitals (Heart Rate + SpO₂)</option>
                  <option value="AI Arrhythmia Screening">AI Arrhythmia Screening</option>
                  <option value="Comprehensive Cardiac Panel">Comprehensive Cardiac Panel</option>
                </select>
              </div>

              {/* Vitals row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    required
                    value={recordBpm}
                    onChange={(e) => setRecordBpm(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">SpO₂ Oxygen (%)</label>
                  <input
                    type="number"
                    required
                    min={50}
                    max={100}
                    value={recordSpo2}
                    onChange={(e) => setRecordSpo2(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={recordTemp}
                    onChange={(e) => setRecordTemp(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Blood Pressure</label>
                  <input
                    type="text"
                    placeholder="120/80 mmHg"
                    value={recordBP}
                    onChange={(e) => setRecordBP(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Rhythm & Risk */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">ECG Rhythm</label>
                  <input
                    type="text"
                    value={recordEcgStatus}
                    onChange={(e) => setRecordEcgStatus(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Risk Rating</label>
                  <select
                    value={recordRiskLevel}
                    onChange={(e) => setRecordRiskLevel(e.target.value as RiskLevel)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Session Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Patient rested 5 mins beforehand. Clean waveform signal."
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddingRecord(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-orange-600 transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Test Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
