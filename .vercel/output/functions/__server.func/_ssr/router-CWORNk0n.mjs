import { i as __toESM } from "../_runtime.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { C as Activity, f as LogOut, h as FileText, p as LogIn, r as User, y as ChevronDown } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CWORNk0n.js
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
var styles_default = "/assets/styles-DYwYa00B.css";
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
var DEFAULT_PATIENTS = [
	{
		id: "PT-10492",
		name: "Robert Chen",
		age: 58,
		gender: "Male",
		email: "robert.chen@hospital-portal.org",
		phone: "+1 (555) 234-8910",
		bloodType: "O+",
		condition: "Post-Myocardial Infarction / Hypertension",
		allergies: "Penicillin",
		medications: [
			"Metoprolol 50mg",
			"Aspirin 81mg",
			"Atorvastatin 20mg"
		],
		emergencyContact: "Linda Chen (Wife) - +1 (555) 234-8911",
		createdAt: "2026-09-15T08:30:00Z"
	},
	{
		id: "PT-20831",
		name: "Dr. Elena Vance",
		age: 44,
		gender: "Female",
		email: "elena.vance@cardioresearch.edu",
		phone: "+1 (555) 871-3342",
		bloodType: "A+",
		condition: "Paroxysmal Atrial Arrhythmia",
		allergies: "None reported",
		medications: ["Diltiazem 120mg"],
		emergencyContact: "David Vance (Spouse) - +1 (555) 871-3340",
		createdAt: "2026-09-20T11:15:00Z"
	},
	{
		id: "PT-31055",
		name: "Aarav Patel",
		age: 29,
		gender: "Male",
		email: "aarav.patel@biotech-pulse.io",
		phone: "+1 (555) 412-9022",
		bloodType: "B+",
		condition: "High-Performance Endurance Baseline",
		allergies: "Sulfa drugs",
		medications: ["Daily Multivitamin", "Omega-3"],
		emergencyContact: "Priya Patel (Sister) - +1 (555) 412-9025",
		createdAt: "2026-10-01T14:00:00Z"
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
							className: "mt-1 flex items-center gap-1.5 text-[11px] text-primary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Active Patient Session" })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-1 space-y-0.5",
					children: [
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
var Route$9 = createRootRouteWithContext()({
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
	const { queryClient } = Route$9.useRouteContext();
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
var $$splitComponentImporter$8 = () => import("./routes-C5kVbc_S.mjs");
var Route$8 = createFileRoute("/")({
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
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./analysis-BTlrIntR.mjs");
var Route$7 = createFileRoute("/analysis")({
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
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./dashboard-B8pqG8Yb.mjs");
var Route$6 = createFileRoute("/dashboard")({
	head: () => ({ meta: [{ title: "Live Dashboard — ESP32 Health Monitor" }, {
		name: "description",
		content: "Live biomedical dashboard streaming real AD8232 ECG and MAX30102 PPG, BPM and SpO₂ data from an ESP32 over Web Serial."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./diagnostics-DPeC1mIt.mjs");
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
var $$splitComponentImporter$4 = () => import("./firmware-CkyAYwpZ.mjs");
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
var $$splitComponentImporter$3 = () => import("./hardware-Dr4wuGJi.mjs");
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
var $$splitComponentImporter$2 = () => import("./login-CEMcgYJm.mjs");
var Route$2 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Patient Login — Ear-to-Heart Biosensor" }, {
		name: "description",
		content: "Patient login and clinical history access for ESP32 Health Monitor."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./patient-D9GIueu5.mjs");
var Route$1 = createFileRoute("/patient")({
	head: () => ({ meta: [{ title: "Patient Records & Clinical History — Ear-to-Heart" }, {
		name: "description",
		content: "Patient telemetry records, personal medical profile, and historical testing logs."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./settings-Cuu-0PzN.mjs");
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
	IndexRoute: Route$8.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$9
	}),
	AnalysisRoute: Route$7.update({
		id: "/analysis",
		path: "/analysis",
		getParentRoute: () => Route$9
	}),
	DashboardRoute: Route$6.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => Route$9
	}),
	DiagnosticsRoute: Route$5.update({
		id: "/diagnostics",
		path: "/diagnostics",
		getParentRoute: () => Route$9
	}),
	FirmwareRoute: Route$4.update({
		id: "/firmware",
		path: "/firmware",
		getParentRoute: () => Route$9
	}),
	HardwareRoute: Route$3.update({
		id: "/hardware",
		path: "/hardware",
		getParentRoute: () => Route$9
	}),
	LoginRoute: Route$2.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$9
	}),
	PatientRoute: Route$1.update({
		id: "/patient",
		path: "/patient",
		getParentRoute: () => Route$9
	}),
	SettingsRoute: Route.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$9
	})
};
var routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
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
export { usePatientStore as n, router_exports as t };
