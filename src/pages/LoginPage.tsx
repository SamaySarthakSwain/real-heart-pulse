import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  Heart,
  Activity,
  ArrowRight,
  User,
  Sparkles,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { usePatientStore } from "@/store/patientStore";
import type { PatientGender } from "@/types/patient";

export function LoginPage() {
  const navigate = useNavigate();
  const patients = usePatientStore((s) => s.patients);
  const login = usePatientStore((s) => s.login);
  const loginWithCredentials = usePatientStore((s) => s.loginWithCredentials);
  const registerPatient = usePatientStore((s) => s.registerPatient);

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Registration form state
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<PatientGender>("Male");
  const [email, setEmail] = useState("");
  const [bloodType, setBloodType] = useState("O+");
  const [condition, setCondition] = useState("");
  const [allergies, setAllergies] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier.trim()) {
      setErrorMsg("Please enter your Patient ID or registered Email address.");
      return;
    }

    const ok = loginWithCredentials(identifier);
    if (ok) {
      navigate({ to: "/patient" });
    } else {
      setErrorMsg("Patient record not found. Try one of the demo profiles below or register a new patient.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Patient full name is required.");
      return;
    }
    if (!age || Number(age) <= 0 || Number(age) > 130) {
      setErrorMsg("Please enter a valid age.");
      return;
    }

    const newPatient = registerPatient({
      name: name.trim(),
      age: Number(age),
      gender,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@patient-portal.org`,
      bloodType,
      condition: condition.trim() || "General Cardiovascular Monitoring",
      allergies: allergies.trim() || "None",
      emergencyContact: emergencyContact.trim(),
      medications: [],
    });

    navigate({ to: "/patient" });
  };

  const selectDemoPatient = (patientId: string) => {
    login(patientId);
    navigate({ to: "/patient" });
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] bg-background py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Background ambient medical glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Brand and Demo Profiles (5 columns on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>HIPAA Compliant Patient Portal</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ear-to-Heart <span className="text-orange-500">Health Hub</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access your real-time cardiac telemetry records, AI diagnosis history, and update your personal clinical profile.
            </p>
          </div>

          {/* Quick 1-Click Demo Profiles */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-md shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Access Demo Profiles
              </span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>

            <div className="space-y-2.5">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectDemoPatient(p.id)}
                  className="w-full group flex items-center justify-between rounded-xl border border-border/60 bg-card/80 p-3 text-left transition-all hover:border-orange-500/50 hover:bg-orange-500/5 hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 font-bold text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-orange-500 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.age}y • {p.gender} • <span className="font-mono">{p.id}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-orange-500 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>Login</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Login / Registration Card (7 columns) */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            {/* Tabs */}
            <div className="flex rounded-xl bg-muted/60 p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setErrorMsg("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "login"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>Existing Patient Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setErrorMsg("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "register"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>Register New Patient</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Patient ID or Registered Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. PT-10492 or robert.chen@hospital-portal.org"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Tip: Enter <span className="font-mono text-foreground font-semibold">PT-10492</span> or click any demo patient on the left.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] transition-all"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Access Patient Portal</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Lin"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Age <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={125}
                      placeholder="e.g. 52"
                      value={age}
                      onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Gender <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as PatientGender)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Blood Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Blood Type</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
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

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Contact Email</label>
                    <input
                      type="email"
                      placeholder="e.g. maya.lin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>

                  {/* Medical Condition */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Cardiovascular Notes / Pre-existing Condition
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mild Hypertension, Family History of CAD"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] transition-all"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register & Create Patient Profile</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
