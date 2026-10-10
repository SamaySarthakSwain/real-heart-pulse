import { useState } from "react";
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
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { usePatientStore } from "@/store/patientStore";
import { useSensorStore } from "@/store/sensorStore";
import type { PatientGender, RiskLevel, TestRecord } from "@/types/patient";

export function PatientProfilePage() {
  const navigate = useNavigate();
  const currentPatient = usePatientStore((s) => s.getCurrentPatient());
  const patients = usePatientStore((s) => s.patients);
  const switchPatient = usePatientStore((s) => s.switchPatient);
  const updatePatientProfile = usePatientStore((s) => s.updatePatientProfile);
  const addTestRecord = usePatientStore((s) => s.addTestRecord);
  const deleteTestRecord = usePatientStore((s) => s.deleteTestRecord);
  const logout = usePatientStore((s) => s.logout);
  const getPatientRecords = usePatientStore((s) => s.getPatientRecords);

  // Live telemetry from sensorStore
  const liveBpm = useSensorStore((s) => s.bpm);
  const liveSpo2 = useSensorStore((s) => s.spo2);
  const liveTemperature = useSensorStore((s) => s.temperature);

  // Modal / Form States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  // Profile Edit State
  const [editName, setEditName] = useState(currentPatient?.name || "");
  const [editAge, setEditAge] = useState<number | "">(currentPatient?.age || "");
  const [editGender, setEditGender] = useState<PatientGender>(currentPatient?.gender || "Male");
  const [editBloodType, setEditBloodType] = useState(currentPatient?.bloodType || "O+");
  const [editCondition, setEditCondition] = useState(currentPatient?.condition || "");
  const [editAllergies, setEditAllergies] = useState(currentPatient?.allergies || "");
  const [editEmergencyContact, setEditEmergencyContact] = useState(currentPatient?.emergencyContact || "");

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
          Please log in to view patient personal profile information and historical testing records.
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

    setIsEditingProfile(false);
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

    setIsAddingRecord(false);
    setRecordNotes("");
  };

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
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <p className="text-base font-semibold text-foreground">
                {liveBpm ? `${Math.round(liveBpm)} BPM` : "Standby"}
              </p>
            </div>
            <Link
              to="/dashboard"
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5 mt-0.5"
            >
              Stream Live <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── PAST RECORDS OF TESTING SECTION ─────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <span>Past Testing Records & Diagnostic History</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Clinical log of all ECG waveform runs, pulse oximetry measurements, and Deep Learning risk reports.
            </p>
          </div>

          {/* Filter Pills */}
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
        </div>

        {/* Records Cards / Table */}
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
