import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as useSensorStore } from "./sensorStore-Nqe95hp0.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Activity, _ as Clock, a as Trash2, b as Calendar, d as PenLine, f as LogOut, g as Droplets, h as FileText, l as Save, m as Heart, n as X, o as Thermometer, r as User, t as Zap, u as Plus, x as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { n as usePatientStore } from "./router-CWORNk0n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/patient-D9GIueu5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PatientProfilePage() {
	const navigate = useNavigate();
	const currentPatient = usePatientStore((s) => s.getCurrentPatient());
	const patients = usePatientStore((s) => s.patients);
	const switchPatient = usePatientStore((s) => s.switchPatient);
	const updatePatientProfile = usePatientStore((s) => s.updatePatientProfile);
	const addTestRecord = usePatientStore((s) => s.addTestRecord);
	const deleteTestRecord = usePatientStore((s) => s.deleteTestRecord);
	const logout = usePatientStore((s) => s.logout);
	const getPatientRecords = usePatientStore((s) => s.getPatientRecords);
	const liveBpm = useSensorStore((s) => s.bpm);
	const liveSpo2 = useSensorStore((s) => s.spo2);
	const liveTemperature = useSensorStore((s) => s.temperature);
	const [isEditingProfile, setIsEditingProfile] = (0, import_react.useState)(false);
	const [isAddingRecord, setIsAddingRecord] = (0, import_react.useState)(false);
	const [filterRisk, setFilterRisk] = (0, import_react.useState)("ALL");
	const [editName, setEditName] = (0, import_react.useState)(currentPatient?.name || "");
	const [editAge, setEditAge] = (0, import_react.useState)(currentPatient?.age || "");
	const [editGender, setEditGender] = (0, import_react.useState)(currentPatient?.gender || "Male");
	const [editBloodType, setEditBloodType] = (0, import_react.useState)(currentPatient?.bloodType || "O+");
	const [editCondition, setEditCondition] = (0, import_react.useState)(currentPatient?.condition || "");
	const [editAllergies, setEditAllergies] = (0, import_react.useState)(currentPatient?.allergies || "");
	const [editEmergencyContact, setEditEmergencyContact] = (0, import_react.useState)(currentPatient?.emergencyContact || "");
	const [recordTestType, setRecordTestType] = (0, import_react.useState)("ECG Monitoring");
	const [recordBpm, setRecordBpm] = (0, import_react.useState)(75);
	const [recordSpo2, setRecordSpo2] = (0, import_react.useState)(98);
	const [recordTemp, setRecordTemp] = (0, import_react.useState)(36.6);
	const [recordBP, setRecordBP] = (0, import_react.useState)("120/80 mmHg");
	const [recordEcgStatus, setRecordEcgStatus] = (0, import_react.useState)("Normal Sinus Rhythm");
	const [recordRiskLevel, setRecordRiskLevel] = (0, import_react.useState)("Low");
	const [recordAiDiagnosis, setRecordAiDiagnosis] = (0, import_react.useState)("1D-CNN DL Model: Normal Sinus Rhythm (Confidence: 96.5%)");
	const [recordNotes, setRecordNotes] = (0, import_react.useState)("");
	if (!currentPatient) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[70vh] flex-col items-center justify-center px-4 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-16 w-16 rounded-full bg-orange-500/15 flex items-center justify-center text-orange-500 mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-8 w-8" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-bold text-foreground",
				children: "No Patient Signed In"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground max-w-md",
				children: "Please log in to view patient personal profile information and historical testing records."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-all",
				children: "Go to Patient Login"
			})
		]
	});
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
	const handleSaveProfile = (e) => {
		e.preventDefault();
		if (!editName.trim() || !editAge) return;
		updatePatientProfile(currentPatient.id, {
			name: editName.trim(),
			age: Number(editAge),
			gender: editGender,
			bloodType: editBloodType,
			condition: editCondition.trim(),
			allergies: editAllergies.trim(),
			emergencyContact: editEmergencyContact.trim()
		});
		setIsEditingProfile(false);
	};
	const handleAutoFillFromLiveSensors = () => {
		if (liveBpm && liveBpm > 30) setRecordBpm(Math.round(liveBpm));
		if (liveSpo2 && liveSpo2 > 50) setRecordSpo2(Math.round(liveSpo2));
		if (liveTemperature && liveTemperature > 30) setRecordTemp(Number(liveTemperature.toFixed(1)));
		setRecordNotes((prev) => prev ? `${prev} (Auto-synced from live ESP32 hardware session)` : "Auto-synced from live ESP32 hardware session");
	};
	const handleCreateRecord = (e) => {
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
			device: "ESP32 Ear-to-Heart Biosensor v2.0"
		});
		setIsAddingRecord(false);
		setRecordNotes("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col sm:flex-row sm:items-center gap-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-3xl font-black text-white shadow-lg shadow-orange-500/30",
								children: currentPatient.name.charAt(0).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
											className: "text-2xl sm:text-3xl font-bold text-foreground",
											children: currentPatient.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-500",
											children: currentPatient.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
											children: currentPatient.gender
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
											children: ["Age: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-foreground",
												children: currentPatient.age
											})]
										}),
										currentPatient.bloodType && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "rounded-full bg-destructive/10 text-destructive px-2.5 py-0.5 text-xs font-semibold",
											children: ["Blood: ", currentPatient.bloodType]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										"Condition: ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-foreground font-medium",
											children: currentPatient.condition || "Routine Telemetry"
										}),
										currentPatient.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" • ", currentPatient.email] })
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleOpenEdit,
									className: "inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-accent hover:border-border transition-all",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-4 w-4 text-orange-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit Details (Name, Age, Gender)" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setIsAddingRecord(true),
									className: "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Record New Test" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "relative group",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: currentPatient.id,
										onChange: (e) => switchPatient(e.target.value),
										className: "h-10 rounded-xl border border-border/80 bg-background/80 px-3 pr-8 text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20",
										"aria-label": "Switch Patient",
										children: patients.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: p.id,
											children: [
												"Switch: ",
												p.name,
												" (",
												p.id,
												")"
											]
										}, p.id))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => {
										logout();
										navigate({ to: "/login" });
									},
									className: "inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all",
									title: "Sign Out",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: "Logout"
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border/60 pt-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border/50 bg-background/50 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground uppercase tracking-wider font-mono",
										children: "Total Tests"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-2xl font-bold text-foreground",
										children: records.length
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground mt-0.5",
										children: "Stored in patient record"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border/50 bg-background/50 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground uppercase tracking-wider font-mono",
										children: "Mean Heart Rate"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-2xl font-bold text-rose-500",
										children: [
											records.length > 0 ? Math.round(records.reduce((acc, r) => acc + r.bpm, 0) / records.length) : "--",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-normal text-muted-foreground",
												children: "BPM"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground mt-0.5",
										children: "Across clinical sessions"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border/50 bg-background/50 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground uppercase tracking-wider font-mono",
										children: "Mean SpO₂"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-2xl font-bold text-sky-500",
										children: [records.length > 0 ? (records.reduce((acc, r) => acc + r.spo2, 0) / records.length).toFixed(1) : "--", "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground mt-0.5",
										children: "Blood oxygen saturation"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border/50 bg-background/50 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground uppercase tracking-wider font-mono",
										children: "Live Hardware"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-emerald-500 animate-ping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-base font-semibold text-foreground",
											children: liveBpm ? `${Math.round(liveBpm)} BPM` : "Standby"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/dashboard",
										className: "text-[11px] text-primary hover:underline inline-flex items-center gap-0.5 mt-0.5",
										children: ["Stream Live ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3 w-3" })]
									})
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5 text-orange-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Past Testing Records & Diagnostic History" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs sm:text-sm text-muted-foreground",
						children: "Clinical log of all ECG waveform runs, pulse oximetry measurements, and Deep Learning risk reports."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1.5 rounded-xl border border-border bg-card/60 p-1",
						children: [
							"ALL",
							"Low",
							"Moderate",
							"High"
						].map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setFilterRisk(level),
							className: `rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${filterRisk === level ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
							children: level === "ALL" ? "All Records" : `${level} Risk`
						}, level))
					})]
				}), filteredRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold text-foreground",
							children: "No Test Records Found"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground max-w-sm mx-auto",
							children: "There are no testing records matching your filter for this patient. Click \"Record New Test\" to log a clinical test."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setIsAddingRecord(true),
							className: "inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-orange-600 transition-all",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), "Record First Test"]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-4",
					children: filteredRecords.map((record) => {
						const isHigh = record.aiRiskLevel === "High" || record.aiRiskLevel === "Critical";
						const isMod = record.aiRiskLevel === "Moderate";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-200 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${isHigh ? "bg-rose-500/15 text-rose-500" : isMod ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-base font-semibold text-foreground",
												children: record.testType
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isHigh ? "bg-rose-500/15 text-rose-500 border border-rose-500/30" : isMod ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"}`,
												children: [record.aiRiskLevel || "Normal", " Risk"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(record.timestamp).toLocaleString() }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono",
													children: record.id
												})
											]
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => deleteTestRecord(currentPatient.id, record.id),
										className: "self-end sm:self-center p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
										title: "Delete Record",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl border border-border/40 bg-background/60 p-3 flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-4 w-4 text-rose-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-mono text-muted-foreground uppercase",
												children: "Heart Rate"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm font-bold text-foreground",
												children: [record.bpm, " BPM"]
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl border border-border/40 bg-background/60 p-3 flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { className: "h-4 w-4 text-sky-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-mono text-muted-foreground uppercase",
												children: "SpO₂ Level"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-sm font-bold text-foreground",
												children: [record.spo2, "%"]
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl border border-border/40 bg-background/60 p-3 flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thermometer, { className: "h-4 w-4 text-amber-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-mono text-muted-foreground uppercase",
												children: "Temperature"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-bold text-foreground",
												children: record.temperature ? `${record.temperature}°C` : "36.6°C"
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl border border-border/40 bg-background/60 p-3 flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-mono text-muted-foreground uppercase",
												children: "Blood Pressure"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-bold text-foreground",
												children: record.bloodPressure || "120/80"
											})] })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-border/60 bg-muted/40 p-3.5 space-y-1.5 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-foreground font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-3.5 w-3.5 text-orange-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Rhythm & AI Analysis: ", record.ecgStatus] })]
										}),
										record.aiDiagnosis && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground leading-relaxed pl-5.5",
											children: record.aiDiagnosis
										}),
										record.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-foreground/90 text-[11px] pt-1 pl-5.5 border-t border-border/40 mt-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-muted-foreground",
													children: "Clinical Note:"
												}),
												" ",
												record.notes
											]
										})
									]
								})
							]
						}, record.id);
					})
				})]
			}),
			isEditingProfile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between pb-4 border-b border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-8 w-8 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center font-bold",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-lg font-bold text-foreground",
								children: "Edit Patient Profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Update Name, Age, Gender and stored medical data"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setIsEditingProfile(false),
							className: "p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSaveProfile,
						className: "mt-5 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-xs font-semibold text-foreground",
									children: ["Patient Full Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-destructive",
										children: "*"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									required: true,
									value: editName,
									onChange: (e) => setEditName(e.target.value),
									className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-xs font-semibold text-foreground",
										children: ["Age (Years) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-destructive",
											children: "*"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										required: true,
										min: 1,
										max: 125,
										value: editAge,
										onChange: (e) => setEditAge(e.target.value === "" ? "" : Number(e.target.value)),
										className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "text-xs font-semibold text-foreground",
										children: ["Gender ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-destructive",
											children: "*"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: editGender,
										onChange: (e) => setEditGender(e.target.value),
										className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Male",
												children: "Male"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Female",
												children: "Female"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Other",
												children: "Other"
											})
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold text-foreground",
										children: "Blood Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: editBloodType,
										onChange: (e) => setEditBloodType(e.target.value),
										className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "A+",
												children: "A+"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "A-",
												children: "A-"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "B+",
												children: "B+"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "B-",
												children: "B-"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "AB+",
												children: "AB+"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "AB-",
												children: "AB-"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "O+",
												children: "O+"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "O-",
												children: "O-"
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold text-foreground",
										children: "Emergency Contact"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "e.g. Spouse / Phone",
										value: editEmergencyContact,
										onChange: (e) => setEditEmergencyContact(e.target.value),
										className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs font-semibold text-foreground",
									children: "Cardiovascular Condition / Clinical Notes"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 2,
									value: editCondition,
									onChange: (e) => setEditCondition(e.target.value),
									className: "w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-3 pt-3 border-t border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setIsEditingProfile(false),
									className: "rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground",
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									className: "inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-orange-600 transition-all",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Save Changes" })]
								})]
							})
						]
					})]
				})
			}),
			isAddingRecord && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between pb-4 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-8 w-8 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-lg font-bold text-foreground",
									children: "Log New Cardiac Test"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										"Add to ",
										currentPatient.name,
										"'s test history"
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setIsAddingRecord(false),
								className: "p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-4 w-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-foreground font-medium",
									children: [
										"ESP32 Live Feed: ",
										liveBpm ? `${Math.round(liveBpm)} BPM` : "-- BPM",
										" • ",
										liveSpo2 ? `${Math.round(liveSpo2)}% SpO₂` : "--%"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleAutoFillFromLiveSensors,
								className: "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all shrink-0",
								children: "Auto-Fill Sensors"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleCreateRecord,
							className: "mt-5 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold text-foreground",
										children: "Test Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: recordTestType,
										onChange: (e) => setRecordTestType(e.target.value),
										className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "ECG Monitoring",
												children: "ECG Monitoring (Lead-I / 12-Lead)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "PPG & Vitals",
												children: "PPG & Vitals (Heart Rate + SpO₂)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "AI Arrhythmia Screening",
												children: "AI Arrhythmia Screening"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Comprehensive Cardiac Panel",
												children: "Comprehensive Cardiac Panel"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-xs font-semibold text-foreground",
												children: "Heart Rate (BPM)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												required: true,
												value: recordBpm,
												onChange: (e) => setRecordBpm(Number(e.target.value)),
												className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-xs font-semibold text-foreground",
												children: "SpO₂ Oxygen (%)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												required: true,
												min: 50,
												max: 100,
												value: recordSpo2,
												onChange: (e) => setRecordSpo2(Number(e.target.value)),
												className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-xs font-semibold text-foreground",
												children: "Temperature (°C)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												step: "0.1",
												value: recordTemp,
												onChange: (e) => setRecordTemp(Number(e.target.value)),
												className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-xs font-semibold text-foreground",
												children: "Blood Pressure"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "120/80 mmHg",
												value: recordBP,
												onChange: (e) => setRecordBP(e.target.value),
												className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-semibold text-foreground",
											children: "ECG Rhythm"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: recordEcgStatus,
											onChange: (e) => setRecordEcgStatus(e.target.value),
											className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-semibold text-foreground",
											children: "Risk Rating"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: recordRiskLevel,
											onChange: (e) => setRecordRiskLevel(e.target.value),
											className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Low",
													children: "Low Risk"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Moderate",
													children: "Moderate Risk"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "High",
													children: "High Risk"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Critical",
													children: "Critical"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-semibold text-foreground",
										children: "Session Notes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										rows: 2,
										placeholder: "e.g. Patient rested 5 mins beforehand. Clean waveform signal.",
										value: recordNotes,
										onChange: (e) => setRecordNotes(e.target.value),
										className: "w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-end gap-3 pt-3 border-t border-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setIsAddingRecord(false),
										className: "rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground",
										children: "Cancel"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										className: "inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-orange-600 transition-all",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Save Test Record" })]
									})]
								})
							]
						})
					]
				})
			})
		]
	});
}
var SplitComponent = PatientProfilePage;
//#endregion
export { SplitComponent as component };
