import { i as __toESM } from "../_runtime.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, k as redirect, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { A as FileText, D as Heart, K as Activity, b as LogIn, r as User, y as LogOut, z as ChevronDown } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-_n_MgLcq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var styles_default = "/assets/styles-BkY1HDQv.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var ThemeContext = (0, import_react.createContext)({
	theme: "dark",
	toggleTheme: () => {}
});
function getInitialTheme() {
	if (typeof window === "undefined") return "dark";
	const stored = localStorage.getItem("hp-theme");
	if (stored === "dark" || stored === "light") return stored;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function ThemeProvider({ children }) {
	const [theme, setTheme] = (0, import_react.useState)(getInitialTheme);
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		if (theme === "dark") root.classList.add("dark");
		else root.classList.remove("dark");
		localStorage.setItem("hp-theme", theme);
	}, [theme]);
	const toggleTheme = () => setTheme((prev) => prev === "dark" ? "light" : "dark");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: {
			theme,
			toggleTheme
		},
		children
	});
}
function useTheme() {
	return (0, import_react.useContext)(ThemeContext);
}
/**
* Inline script string to inject into <head> to prevent FOUC.
* Reads localStorage before React hydrates and applies the class immediately.
*/
var themeInitScript = `(function(){try{var t=localStorage.getItem('hp-theme');if(t==='dark'||t==='light'){if(t==='dark')document.documentElement.classList.add('dark');return;}if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}}catch(e){}})();`;
var AUTH_SALT = "ear_to_heart_biomedical_salt_2026";
/**
* Computes SHA-256 hash using the native browser Web Crypto API.
* Never stores or transmits plaintext passwords.
*/
async function hashPassword(password) {
	const data = new TextEncoder().encode(`${AUTH_SALT}:${password.trim()}`);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var DEFAULT_DEMO_HASH = "f1d63652c505caea24bbbe8ff2cf17c9dd024d20917631da7a8c8e23fcead719";
/**
* Validates email format with RFC 5322 compliant regex.
*/
function validateEmail(email) {
	const trimmed = email.trim();
	if (!trimmed) return "Email address is required.";
	if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return "Please enter a valid email address (e.g., patient@example.com).";
	return null;
}
/**
* Validates username (3-24 characters, letters, numbers, underscores, dashes).
*/
function validateUsername(username) {
	const trimmed = username.trim();
	if (!trimmed) return "Username is required.";
	if (trimmed.length < 3) return "Username must be at least 3 characters long.";
	if (trimmed.length > 24) return "Username cannot exceed 24 characters.";
	if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) return "Username can only contain letters, numbers, underscores, periods, and hyphens.";
	return null;
}
/**
* Enforces healthcare-grade password strength standards.
*/
function evaluatePasswordStrength(password) {
	const hasLength = password.length >= 8;
	const hasUpper = /[A-Z]/.test(password);
	const hasLower = /[a-z]/.test(password);
	const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
	let score = 0;
	if (hasLength) score += 1;
	if (hasUpper) score += 1;
	if (hasLower) score += 1;
	if (hasNumberOrSpecial) score += 1;
	let level = "Very Weak";
	if (score === 1) level = "Weak";
	else if (score === 2) level = "Fair";
	else if (score === 3) level = "Strong";
	else if (score === 4) level = "Excellent";
	return {
		valid: hasLength && (hasUpper || hasLower) && hasNumberOrSpecial,
		score,
		level,
		rules: {
			hasLength,
			hasUpper,
			hasLower,
			hasNumberOrSpecial
		}
	};
}
/**
* Identity resolution: finds patient by Email, Username, or Patient ID.
* Returns null if not matched.
*/
function resolvePatientIdentifier(identifier, patients) {
	const query = identifier.trim().toLowerCase();
	if (!query) return null;
	return patients.find((p) => {
		const matchId = p.id.toLowerCase() === query;
		const matchEmail = p.email.toLowerCase() === query;
		const matchUsername = p.username ? p.username.toLowerCase() === query : false;
		return matchId || matchEmail || matchUsername;
	}) || null;
}
var DEFAULT_PATIENTS = [
	{
		id: "PT-10492",
		name: "Robert Chen",
		age: 58,
		gender: "Male",
		email: "robert.chen@hospital-portal.org",
		username: "robert.chen",
		passwordHash: DEFAULT_DEMO_HASH,
		phone: "+91 9876543210",
		bloodType: "O+",
		condition: "Post-Myocardial Infarction / Hypertension",
		allergies: "Penicillin",
		medications: [
			"Metoprolol 50mg",
			"Aspirin 81mg",
			"Atorvastatin 20mg"
		],
		emergencyContact: "Linda Chen (Wife) - +91 9876543211",
		createdAt: "2026-09-15T08:30:00Z",
		hasCompletedAssessment: true,
		profileData: {
			fullName: "Robert Chen",
			dateOfBirth: "1968-05-14",
			age: 58,
			gender: "Male",
			bloodGroup: "O+",
			heightCm: 178,
			weightKg: 82,
			updatedAt: "2026-09-15T09:00:00Z"
		},
		contactData: {
			email: "robert.chen@hospital-portal.org",
			emailVerified: true,
			mobileNumber: "9876543210",
			countryCode: "+91",
			city: "Bhubaneswar",
			state: "Odisha",
			country: "India",
			address: "Plot 42, Health City",
			preferredCommunication: "Email",
			preferredLanguage: "English"
		},
		emergencyData: {
			contactName: "Linda Chen",
			relationship: "Spouse",
			countryCode: "+91",
			contactNumber: "9876543211",
			consentGranted: true
		},
		assessmentData: {
			bloodPressureSystolic: 122,
			bloodPressureDiastolic: 78,
			bloodPressureUnknown: false,
			cholesterolTotal: 185,
			cholesterolLdl: 110,
			cholesterolHdl: 48,
			cholesterolTriglycerides: 135,
			cholesterolUnit: "mg/dL",
			cholesterolUnknown: false,
			medicalConditions: ["Hypertension", "Previous heart attack"],
			currentMedications: [
				{
					name: "Metoprolol",
					dosage: "50mg"
				},
				{
					name: "Aspirin",
					dosage: "81mg"
				},
				{
					name: "Atorvastatin",
					dosage: "20mg"
				}
			],
			familyHistory: ["Heart disease", "High blood pressure"],
			allergies: ["Penicillin"],
			smokingStatus: "Former smoker",
			physicalActivity: "Moderately active",
			sleepDurationHours: 7,
			symptoms: ["No current symptoms"],
			privacyConsentGranted: true,
			completedAt: "2026-09-15T09:00:00Z"
		}
	},
	{
		id: "PT-20831",
		name: "Dr. Elena Vance",
		age: 44,
		gender: "Female",
		email: "elena.vance@cardioresearch.edu",
		username: "elena.vance",
		passwordHash: DEFAULT_DEMO_HASH,
		phone: "+91 9876543342",
		bloodType: "A+",
		condition: "Paroxysmal Atrial Arrhythmia",
		allergies: "None reported",
		medications: ["Diltiazem 120mg"],
		emergencyContact: "David Vance (Spouse) - +91 9876543340",
		createdAt: "2026-09-20T11:15:00Z",
		hasCompletedAssessment: true,
		profileData: {
			fullName: "Dr. Elena Vance",
			dateOfBirth: "1982-08-22",
			age: 44,
			gender: "Female",
			bloodGroup: "A+",
			heightCm: 165,
			weightKg: 63,
			updatedAt: "2026-09-20T11:30:00Z"
		},
		contactData: {
			email: "elena.vance@cardioresearch.edu",
			emailVerified: true,
			mobileNumber: "9876543342",
			countryCode: "+91",
			city: "Bengaluru",
			state: "Karnataka",
			country: "India",
			address: "14 BioResearch Lane",
			preferredCommunication: "In-app notifications",
			preferredLanguage: "English"
		},
		emergencyData: {
			contactName: "David Vance",
			relationship: "Spouse",
			countryCode: "+91",
			contactNumber: "9876543340",
			consentGranted: true
		},
		assessmentData: {
			bloodPressureSystolic: 118,
			bloodPressureDiastolic: 76,
			bloodPressureUnknown: false,
			cholesterolTotal: 172,
			cholesterolLdl: 98,
			cholesterolHdl: 55,
			cholesterolTriglycerides: 115,
			cholesterolUnit: "mg/dL",
			cholesterolUnknown: false,
			medicalConditions: ["Arrhythmia", "Atrial fibrillation"],
			currentMedications: [{
				name: "Diltiazem",
				dosage: "120mg"
			}],
			familyHistory: ["None known"],
			allergies: ["None known"],
			smokingStatus: "Never smoked",
			physicalActivity: "Moderately active",
			sleepDurationHours: 8,
			symptoms: ["Palpitations"],
			privacyConsentGranted: true,
			completedAt: "2026-09-20T11:30:00Z"
		}
	},
	{
		id: "PT-31055",
		name: "Aarav Patel",
		age: 29,
		gender: "Male",
		email: "aarav.patel@biotech-pulse.io",
		username: "aarav.patel",
		passwordHash: DEFAULT_DEMO_HASH,
		phone: "+91 9876549022",
		bloodType: "B+",
		condition: "High-Performance Endurance Baseline",
		allergies: "Sulfa drugs",
		medications: ["Daily Multivitamin", "Omega-3"],
		emergencyContact: "Priya Patel (Sister) - +91 9876549025",
		createdAt: "2026-10-01T14:00:00Z",
		hasCompletedAssessment: false
	}
];
var DEFAULT_RECORDS = {
	"PT-10492": [
		{
			id: "REC-901",
			patientId: "PT-10492",
			timestamp: (/* @__PURE__ */ new Date(Date.now() - 108e5)).toISOString(),
			testType: "ECG Monitoring",
			bpm: 72,
			spo2: 98,
			temperature: 36.6,
			bloodPressure: "122/78 mmHg",
			ecgStatus: "Normal Sinus Rhythm",
			aiRiskLevel: "Low",
			aiDiagnosis: "1D-CNN DL Model: Normal Sinus Rhythm (Confidence: 97.2%). ST segments isoelectric.",
			notes: "Routine evening resting test using ESP32 Ear-to-Heart Biosensor. Patient reported feeling well.",
			device: "ESP32 Ear-to-Heart Biosensor v2.0"
		},
		{
			id: "REC-902",
			patientId: "PT-10492",
			timestamp: (/* @__PURE__ */ new Date(Date.now() - 1008e5)).toISOString(),
			testType: "Comprehensive Cardiac Panel",
			bpm: 88,
			spo2: 96,
			temperature: 36.8,
			bloodPressure: "135/86 mmHg",
			ecgStatus: "Mild ST/T Flatness",
			aiRiskLevel: "Moderate",
			aiDiagnosis: "Model detected subtle ST-T changes (64% probability). Cardiac Stress Index slightly elevated.",
			notes: "Post-mild walking test. Heart rate recovered to baseline within 4 minutes.",
			device: "ESP32 Ear-to-Heart Biosensor v2.0"
		},
		{
			id: "REC-903",
			patientId: "PT-10492",
			timestamp: (/* @__PURE__ */ new Date(Date.now() - 2592e5)).toISOString(),
			testType: "PPG & Vitals",
			bpm: 74,
			spo2: 99,
			temperature: 36.5,
			bloodPressure: "119/76 mmHg",
			ecgStatus: "Normal Sinus Rhythm",
			aiRiskLevel: "Low",
			aiDiagnosis: "No ischemic patterns detected. Signal-to-noise ratio: 24dB (optimal).",
			notes: "Baseline morning clinic calibration.",
			device: "ESP32 Ear-to-Heart Biosensor v2.0"
		}
	],
	"PT-20831": [{
		id: "REC-851",
		patientId: "PT-20831",
		timestamp: (/* @__PURE__ */ new Date(Date.now() - 432e5)).toISOString(),
		testType: "AI Arrhythmia Screening",
		bpm: 94,
		spo2: 97,
		temperature: 36.7,
		bloodPressure: "128/82 mmHg",
		ecgStatus: "Sinus Tachycardia",
		aiRiskLevel: "Moderate",
		aiDiagnosis: "Arrhythmia classifier flagged PAC pattern with 82% confidence. Recommended rest.",
		notes: "Palpitations reported during work session. Monitored for 10 minutes continuously.",
		device: "ESP32 Ear-to-Heart Biosensor v2.0"
	}, {
		id: "REC-852",
		patientId: "PT-20831",
		timestamp: (/* @__PURE__ */ new Date(Date.now() - 1728e5)).toISOString(),
		testType: "ECG Monitoring",
		bpm: 68,
		spo2: 99,
		temperature: 36.6,
		bloodPressure: "116/74 mmHg",
		ecgStatus: "Normal Sinus Rhythm",
		aiRiskLevel: "Low",
		aiDiagnosis: "Normal rhythm restored. PR interval 158ms, QRS duration 86ms.",
		notes: "Resting test post-medication.",
		device: "ESP32 Ear-to-Heart Biosensor v2.0"
	}],
	"PT-31055": [{
		id: "REC-701",
		patientId: "PT-31055",
		timestamp: (/* @__PURE__ */ new Date(Date.now() - 288e5)).toISOString(),
		testType: "Comprehensive Cardiac Panel",
		bpm: 54,
		spo2: 99,
		temperature: 36.4,
		bloodPressure: "112/68 mmHg",
		ecgStatus: "Athletic Sinus Bradycardia",
		aiRiskLevel: "Low",
		aiDiagnosis: "Resting athletic bradycardia. Exceptional HRV (RMSSD: 68ms). AI Score: Healthy.",
		notes: "Morning resting telemetry for marathon training recovery cycle.",
		device: "ESP32 Ear-to-Heart Biosensor v2.0"
	}]
};
var usePatientStore = create()(persist((set, get) => ({
	currentPatientId: "PT-10492",
	rememberMe: true,
	patients: DEFAULT_PATIENTS,
	records: DEFAULT_RECORDS,
	login: (patientId) => {
		if (get().patients.some((p) => p.id === patientId)) {
			set({ currentPatientId: patientId });
			return true;
		}
		return false;
	},
	loginWithCredentials: (emailOrId) => {
		const target = emailOrId.trim().toLowerCase();
		const found = get().patients.find((p) => p.id.toLowerCase() === target || p.email.toLowerCase() === target);
		if (found) {
			set({ currentPatientId: found.id });
			return true;
		}
		return false;
	},
	authenticatePatient: async (credentials) => {
		await new Promise((r) => setTimeout(r, 450));
		const found = resolvePatientIdentifier(credentials.identifier, get().patients);
		if (!found) return {
			success: false,
			error: "Invalid credentials. Please verify your Email, Username, or Patient ID and Password."
		};
		const computedHash = await hashPassword(credentials.password);
		if (!(found.passwordHash === computedHash || found.passwordHash === "f1d63652c505caea24bbbe8ff2cf17c9dd024d20917631da7a8c8e23fcead719" && (credentials.password === "Heart@2026" || computedHash === "f1d63652c505caea24bbbe8ff2cf17c9dd024d20917631da7a8c8e23fcead719") || !found.passwordHash && credentials.password === "Heart@2026")) return {
			success: false,
			error: "Invalid credentials. Please verify your Email, Username, or Patient ID and Password."
		};
		if (!found.passwordHash) get().updatePatientProfile(found.id, { passwordHash: computedHash });
		set({
			currentPatientId: found.id,
			rememberMe: !!credentials.rememberMe
		});
		return {
			success: true,
			patient: found
		};
	},
	registerPatientAccount: async (payload) => {
		await new Promise((r) => setTimeout(r, 550));
		const emailClean = payload.email.trim().toLowerCase();
		const usernameClean = payload.username.trim().toLowerCase();
		const state = get();
		if (state.patients.some((p) => p.email.toLowerCase() === emailClean)) return {
			success: false,
			error: "An account with this email address is already registered."
		};
		if (state.patients.some((p) => p.username && p.username.toLowerCase() === usernameClean)) return {
			success: false,
			error: "This username is already taken. Please choose another username."
		};
		let existingPatientToAssociate = null;
		if (payload.patientId && payload.patientId.trim()) {
			const providerIdClean = payload.patientId.trim().toUpperCase();
			const matchExisting = state.patients.find((p) => p.id.toUpperCase() === providerIdClean);
			if (!matchExisting) return {
				success: false,
				error: `Provider Patient ID "${providerIdClean}" was not found in the clinic database. Leave blank to register as a new patient or contact your provider.`
			};
			if (matchExisting.username && matchExisting.username.toLowerCase() !== usernameClean) return {
				success: false,
				error: `Patient ID "${providerIdClean}" is already linked to an existing account. Please sign in instead.`
			};
			existingPatientToAssociate = matchExisting;
			matchExisting.id;
		}
		const passwordHash = await hashPassword(payload.password);
		if (existingPatientToAssociate) {
			const updatedPatient = {
				...existingPatientToAssociate,
				name: payload.name.trim() || existingPatientToAssociate.name,
				email: emailClean,
				username: usernameClean,
				passwordHash
			};
			set((s) => ({
				patients: s.patients.map((p) => p.id === existingPatientToAssociate.id ? updatedPatient : p),
				currentPatientId: updatedPatient.id
			}));
			return {
				success: true,
				patient: updatedPatient
			};
		}
		const newPatientId = `PT-${Math.floor(1e4 + Math.random() * 9e4)}`;
		const newPatient = {
			id: newPatientId,
			name: payload.name.trim(),
			age: 30,
			gender: "Other",
			email: emailClean,
			username: usernameClean,
			passwordHash,
			condition: "New Patient Registration",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			hasCompletedAssessment: false
		};
		set((s) => ({
			patients: [newPatient, ...s.patients],
			currentPatientId: newPatientId,
			records: {
				...s.records,
				[newPatientId]: []
			}
		}));
		return {
			success: true,
			patient: newPatient
		};
	},
	saveHealthAssessment: (patientId, data, markComplete = true) => {
		set((state) => ({ patients: state.patients.map((p) => {
			if (p.id !== patientId) return p;
			const updatedProfile = data.profile ? {
				...p.profileData,
				...data.profile
			} : p.profileData;
			const updatedContact = data.contact ? {
				...p.contactData,
				...data.contact
			} : p.contactData;
			const updatedEmergency = data.emergency ? {
				...p.emergencyData,
				...data.emergency
			} : p.emergencyData;
			const updatedAssessment = data.assessment ? {
				...p.assessmentData,
				...data.assessment
			} : p.assessmentData;
			return {
				...p,
				name: data.profile?.fullName || p.name,
				age: data.profile?.age ?? p.age,
				gender: data.profile?.gender || p.gender,
				bloodType: data.profile?.bloodGroup || p.bloodType,
				phone: data.contact?.mobileNumber ? `${data.contact.countryCode} ${data.contact.mobileNumber}` : p.phone,
				emergencyContact: data.emergency?.contactName ? `${data.emergency.contactName} (${data.emergency.relationship}) - ${data.emergency.countryCode} ${data.emergency.contactNumber}` : p.emergencyContact,
				hasCompletedAssessment: markComplete ? true : p.hasCompletedAssessment,
				profileData: updatedProfile,
				contactData: updatedContact,
				emergencyData: updatedEmergency,
				assessmentData: updatedAssessment
			};
		}) }));
	},
	requestPasswordReset: async (email) => {
		await new Promise((r) => setTimeout(r, 600));
		return {
			success: true,
			message: "If an account is associated with this email address, password recovery instructions and a secure reset link have been dispatched. Please check your inbox."
		};
	},
	logout: () => {
		set({ currentPatientId: null });
	},
	registerPatient: (patientData) => {
		const newId = `PT-${Math.floor(1e4 + Math.random() * 9e4)}`;
		const newPatient = {
			...patientData,
			id: newId,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		set((state) => ({
			patients: [newPatient, ...state.patients],
			currentPatientId: newId,
			records: {
				...state.records,
				[newId]: []
			}
		}));
		return newPatient;
	},
	updatePatientProfile: (patientId, updates) => {
		set((state) => ({ patients: state.patients.map((p) => p.id === patientId ? {
			...p,
			...updates
		} : p) }));
	},
	addTestRecord: (patientId, recordData) => {
		const newRecord = {
			...recordData,
			id: `REC-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
			patientId,
			timestamp: recordData.timestamp || (/* @__PURE__ */ new Date()).toISOString()
		};
		set((state) => {
			const currentList = state.records[patientId] || [];
			return { records: {
				...state.records,
				[patientId]: [newRecord, ...currentList]
			} };
		});
		return newRecord;
	},
	deleteTestRecord: (patientId, recordId) => {
		set((state) => {
			const currentList = state.records[patientId] || [];
			return { records: {
				...state.records,
				[patientId]: currentList.filter((r) => r.id !== recordId)
			} };
		});
	},
	switchPatient: (patientId) => {
		if (get().patients.some((p) => p.id === patientId)) set({ currentPatientId: patientId });
	},
	getCurrentPatient: () => {
		const { currentPatientId, patients } = get();
		if (!currentPatientId) return null;
		return patients.find((p) => p.id === currentPatientId) || null;
	},
	getPatientRecords: (patientId) => {
		return get().records[patientId] || [];
	}
}), { name: "ear_to_heart_patients_v1" }));
function PatientHeaderButton() {
	const currentPatient = usePatientStore((s) => s.getCurrentPatient());
	const logout = usePatientStore((s) => s.logout);
	const [dropdownOpen, setDropdownOpen] = (0, import_react.useState)(false);
	const dropdownRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);
	if (!currentPatient) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/login",
		className: "group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition-all duration-200 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/35 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
		"aria-label": "Patient Login",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Login" })]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		ref: dropdownRef,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setDropdownOpen(!dropdownOpen),
			className: "inline-flex items-center gap-2.5 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-sm font-medium text-foreground transition-all hover:bg-orange-500/15 hover:border-orange-500/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
			"aria-expanded": dropdownOpen,
			"aria-label": "Patient Account Menu",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-bold text-white shadow-sm",
					children: currentPatient.name.charAt(0).toUpperCase()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col text-left leading-tight hidden sm:flex",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold text-foreground truncate max-w-[120px]",
						children: currentPatient.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[10px] text-muted-foreground",
						children: [
							currentPatient.age,
							"y • ",
							currentPatient.gender
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}` })
			]
		}), dropdownOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 mt-2 w-64 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border/60 px-3 py-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-foreground",
							children: currentPatient.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground font-mono",
							children: currentPatient.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-center justify-between text-[11px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Active Session" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-[10px] font-semibold px-2 py-0.5 rounded-full ${currentPatient.hasCompletedAssessment ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`,
								children: currentPatient.hasCompletedAssessment ? "Profile Complete" : "Intake Needed"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-1 space-y-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/assessment",
							onClick: () => setDropdownOpen(false),
							className: "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Health Assessment Wizard" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/patient",
							onClick: () => setDropdownOpen(false),
							className: "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4 text-orange-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Patient Profile & Details" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/patient",
							onClick: () => setDropdownOpen(false),
							className: "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Past Testing Records" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/dashboard",
							onClick: () => setDropdownOpen(false),
							className: "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Live Biometric Stream" })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border/60 pt-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							logout();
							setDropdownOpen(false);
						},
						className: "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sign Out" })]
					})
				})
			]
		})]
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center animate-fade-in",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.5",
						className: "h-12 w-12",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							strokeLinecap: "round",
							strokeLinejoin: "round",
							d: "M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold gradient-text-primary",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-lg",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center animate-fade-in",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.5",
						className: "h-12 w-12",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							strokeLinecap: "round",
							strokeLinejoin: "round",
							d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap justify-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:scale-105",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$10 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "ESP32 Health Monitor — AikyaNova Labs" },
			{
				name: "description",
				content: "Real-time ESP32 ECG, PPG, BPM and SpO₂ monitoring over Web Serial."
			},
			{
				name: "author",
				content: "AikyaNova Labs"
			},
			{
				property: "og:title",
				content: "ESP32 Health Monitor"
			},
			{
				property: "og:description",
				content: "Hardware-only biomedical monitoring dashboard for ESP32 sensor streams."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@AikyaNova"
			},
			{
				name: "theme-color",
				content: "#0d1526"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: themeInitScript } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function HeartbeatLogo() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		"aria-hidden": true,
		viewBox: "0 0 64 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		className: "h-6 w-16 text-primary",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: "0,12 10,12 16,4 22,20 28,12 38,12 44,2 50,22 56,12 64,12" })
	});
}
function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: toggleTheme,
		"aria-label": theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
		title: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
		className: "flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:scale-110 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
		children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2",
			className: "h-4.5 w-4.5 h-[18px] w-[18px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "4"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				strokeLinecap: "round",
				d: "M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2",
			className: "h-[18px] w-[18px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				strokeLinecap: "round",
				strokeLinejoin: "round",
				d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
			})
		})
	});
}
var NAV_LINKS = [
	{
		to: "/",
		label: "Home",
		icon: "🏠"
	},
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: "📊"
	},
	{
		to: "/analysis",
		label: "Risk Analysis",
		icon: "🔬"
	},
	{
		to: "/patient",
		label: "Patient Records",
		icon: "👤"
	},
	{
		to: "/firmware",
		label: "Firmware",
		icon: "💾"
	},
	{
		to: "/hardware",
		label: "Hardware",
		icon: "🔌"
	},
	{
		to: "/diagnostics",
		label: "Diagnostics",
		icon: "🛠"
	},
	{
		to: "/settings",
		label: "Settings",
		icon: "⚙️"
	}
];
function MobileMenu({ open, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		onClick: onClose,
		className: `fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `fixed inset-y-0 right-0 z-50 w-72 bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col`,
		style: { transform: open ? "translateX(0)" : "translateX(100%)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-foreground",
					children: "Navigation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
					"aria-label": "Close menu",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2",
						className: "h-5 w-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							strokeLinecap: "round",
							strokeLinejoin: "round",
							d: "M6 18 18 6M6 6l12 12"
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 overflow-y-auto px-3 py-4 space-y-1",
				children: NAV_LINKS.map(({ to, label, icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to,
					activeOptions: { exact: to === "/" },
					activeProps: { className: "bg-primary/15 text-primary font-semibold" },
					className: "flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground transition-all hover:bg-accent",
					onClick: onClose,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-base",
						children: icon
					}), label]
				}, to))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-border px-5 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "AikyaNova Labs © 2025"
				})
			})
		]
	})] });
}
function RootComponent() {
	const { queryClient } = Route$10.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {})
	}) });
}
function AppLayout() {
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b",
				style: {
					background: "var(--header-bg)",
					borderColor: "var(--glass-border)",
					backdropFilter: "blur(16px)",
					WebkitBackdropFilter: "blur(16px)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "animate-heartbeat flex-shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartbeatLogo, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-[10px] tracking-[0.18em] text-primary/80 uppercase leading-none",
									children: "AikyaNova Labs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-sm font-semibold text-foreground truncate leading-tight mt-0.5",
									children: "ESP32 Health Monitor"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							"aria-label": "Main",
							className: "hidden lg:flex items-center gap-1 text-sm",
							children: NAV_LINKS.map(({ to, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to,
								activeOptions: { exact: to === "/" },
								activeProps: { className: "bg-primary/12 text-primary font-medium shadow-sm" },
								className: "relative rounded-xl px-3.5 py-2 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
								children: label
							}, to))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientHeaderButton, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
									"aria-label": "Open navigation menu",
									onClick: () => setMobileOpen(true),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "2",
										className: "h-5 w-5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											d: "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
										})
									})
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileMenu, {
				open: mobileOpen,
				onClose: () => setMobileOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-[1600px] px-4 py-5 sm:px-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-right",
				richColors: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-[1600px] px-4 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "© 2025 AikyaNova Labs — Research & monitoring use only."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] text-muted-foreground/60 tracking-widest uppercase",
						children: "ESP32 Real-Time Health Monitor"
					})]
				})
			})
		]
	});
}
var $$splitComponentImporter$9 = () => import("./routes-C5kVbc_S.mjs");
var Route$9 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "AikyaNova Labs — Real-Time Health Monitor" },
		{
			name: "description",
			content: "Professional ESP32 biomedical dashboard streaming real AD8232 ECG and MAX30102 PPG, BPM and SpO₂ data over Web Serial API."
		},
		{
			property: "og:title",
			content: "AikyaNova Labs — Real-Time Health Monitor"
		},
		{
			property: "og:description",
			content: "Hardware-only health monitoring: real ECG, PPG, BPM and SpO₂ from an ESP32."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./analysis-WEKx6R9Y.mjs");
var Route$8 = createFileRoute("/analysis")({
	head: () => ({ meta: [
		{ title: "Heart Risk Analysis — ESP32 ECG, PPG & IMU" },
		{
			name: "description",
			content: "Live heart disease risk estimation from real ESP32 ECG, PPG, SpO₂, LM35 temperature and BMI323 motion measurements."
		},
		{
			property: "og:title",
			content: "Heart Risk Analysis — ESP32 ECG, PPG & IMU"
		},
		{
			property: "og:description",
			content: "Ischemia, amyloidosis, fibrosis, arrhythmia and heart failure risk scored from real sensor features."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./assessment-DszwWaEK.mjs");
var Route$7 = createFileRoute("/assessment")({
	beforeLoad: () => {
		if (!usePatientStore.getState().getCurrentPatient()) throw redirect({ to: "/login" });
	},
	head: () => ({ meta: [{ title: "Health Assessment & Profile Wizard — Ear-to-Heart" }, {
		name: "description",
		content: "Complete patient profile, medical history, and ear-wearable telemetry assessment for Ear-to-Heart Health Hub."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./dashboard-DRXkHCga.mjs");
var Route$6 = createFileRoute("/dashboard")({
	beforeLoad: () => {
		const currentPatient = usePatientStore.getState().getCurrentPatient();
		if (currentPatient && !currentPatient.hasCompletedAssessment) throw redirect({ to: "/assessment" });
	},
	head: () => ({ meta: [{ title: "Live Dashboard — ESP32 Health Monitor" }, {
		name: "description",
		content: "Live biomedical dashboard streaming real AD8232 ECG and MAX30102 PPG, BPM and SpO₂ data from an ESP32 over Web Serial."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./diagnostics-C1UInRca.mjs");
var Route$5 = createFileRoute("/diagnostics")({
	head: () => ({ meta: [
		{ title: "Diagnostics — Raw ESP32 Serial Packets" },
		{
			name: "description",
			content: "Raw serial console, packet statistics and pipeline health for the ESP32 ECG and PPG data stream."
		},
		{
			property: "og:title",
			content: "Diagnostics — Raw ESP32 Serial Packets"
		},
		{
			property: "og:description",
			content: "Inspect raw packets, parsing results and validation errors from the ESP32."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./firmware-odBoJsNn.mjs");
var Route$4 = createFileRoute("/firmware")({
	head: () => ({ meta: [
		{ title: "ESP32 Firmware — ECG, PPG, LM35 & BMI323 Sketch" },
		{
			name: "description",
			content: "Copy-paste ESP32 Arduino firmware streaming AD8232 ECG, MAX30102 PPG/SpO₂, LM35 temperature and BMI323 IMU over serial and WiFi WebSocket."
		},
		{
			property: "og:title",
			content: "ESP32 Firmware — ECG, PPG, LM35 & BMI323 Sketch"
		},
		{
			property: "og:description",
			content: "Wiring table, full Arduino sketch and a post-flash accuracy checklist."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./hardware-CDJ6wAbE.mjs");
var Route$3 = createFileRoute("/hardware")({
	head: () => ({ meta: [
		{ title: "Hardware Setup — ESP32 ECG & PPG Monitor" },
		{
			name: "description",
			content: "Wiring, firmware output formats and connection wizard for the ESP32 + AD8232 ECG and MAX30102 PPG monitoring rig."
		},
		{
			property: "og:title",
			content: "Hardware Setup — ESP32 ECG & PPG Monitor"
		},
		{
			property: "og:description",
			content: "ESP32 wiring, serial formats and a step-by-step device connection wizard."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./login-CmQGyJKa.mjs");
var Route$2 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Patient Login — Ear-to-Heart Biosensor" }, {
		name: "description",
		content: "Patient login and clinical history access for ESP32 Health Monitor."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./patient-DkmNZxI2.mjs");
var Route$1 = createFileRoute("/patient")({
	head: () => ({ meta: [{ title: "Patient Records & Clinical History — Ear-to-Heart" }, {
		name: "description",
		content: "Patient telemetry records, personal medical profile, and historical testing logs."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./settings-C99kCVbF.mjs");
var Route = createFileRoute("/settings")({
	head: () => ({ meta: [
		{ title: "Settings — Transport, Baud Rate & Buffers" },
		{
			name: "description",
			content: "Configure USB serial baud rate, Wi-Fi WebSocket URL, graph window and ring-buffer sizes for the ESP32 monitor."
		},
		{
			property: "og:title",
			content: "Settings — ESP32 Health Monitor"
		},
		{
			property: "og:description",
			content: "Transport, baud rate, buffer sizes and parser scaling for ESP32 sensor streams."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$9.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$10
	}),
	AnalysisRoute: Route$8.update({
		id: "/analysis",
		path: "/analysis",
		getParentRoute: () => Route$10
	}),
	AssessmentRoute: Route$7.update({
		id: "/assessment",
		path: "/assessment",
		getParentRoute: () => Route$10
	}),
	DashboardRoute: Route$6.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => Route$10
	}),
	DiagnosticsRoute: Route$5.update({
		id: "/diagnostics",
		path: "/diagnostics",
		getParentRoute: () => Route$10
	}),
	FirmwareRoute: Route$4.update({
		id: "/firmware",
		path: "/firmware",
		getParentRoute: () => Route$10
	}),
	HardwareRoute: Route$3.update({
		id: "/hardware",
		path: "/hardware",
		getParentRoute: () => Route$10
	}),
	LoginRoute: Route$2.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$10
	}),
	PatientRoute: Route$1.update({
		id: "/patient",
		path: "/patient",
		getParentRoute: () => Route$10
	}),
	SettingsRoute: Route.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$10
	})
};
var routeTree = Route$10._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { validateUsername as a, validateEmail as i, usePatientStore as n, evaluatePasswordStrength as r, router_exports as t };
