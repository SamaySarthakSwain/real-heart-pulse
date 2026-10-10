import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as ArrowRight, c as ShieldCheck, i as UserPlus, p as LogIn, r as User, s as Sparkles, v as CircleAlert } from "../_libs/lucide-react.mjs";
import { n as usePatientStore } from "./router-CWORNk0n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CEMcgYJm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const navigate = useNavigate();
	const patients = usePatientStore((s) => s.patients);
	const login = usePatientStore((s) => s.login);
	const loginWithCredentials = usePatientStore((s) => s.loginWithCredentials);
	const registerPatient = usePatientStore((s) => s.registerPatient);
	const [activeTab, setActiveTab] = (0, import_react.useState)("login");
	const [identifier, setIdentifier] = (0, import_react.useState)("");
	const [errorMsg, setErrorMsg] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [age, setAge] = (0, import_react.useState)("");
	const [gender, setGender] = (0, import_react.useState)("Male");
	const [email, setEmail] = (0, import_react.useState)("");
	const [bloodType, setBloodType] = (0, import_react.useState)("O+");
	const [condition, setCondition] = (0, import_react.useState)("");
	const [allergies, setAllergies] = (0, import_react.useState)("");
	const [emergencyContact, setEmergencyContact] = (0, import_react.useState)("");
	const handleLoginSubmit = (e) => {
		e.preventDefault();
		setErrorMsg("");
		if (!identifier.trim()) {
			setErrorMsg("Please enter your Patient ID or registered Email address.");
			return;
		}
		if (loginWithCredentials(identifier)) navigate({ to: "/patient" });
		else setErrorMsg("Patient record not found. Try one of the demo profiles below or register a new patient.");
	};
	const handleRegisterSubmit = (e) => {
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
		registerPatient({
			name: name.trim(),
			age: Number(age),
			gender,
			email: email.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@patient-portal.org`,
			bloodType,
			condition: condition.trim() || "General Cardiovascular Monitoring",
			allergies: allergies.trim() || "None",
			emergencyContact: emergencyContact.trim(),
			medications: []
		});
		navigate({ to: "/patient" });
	};
	const selectDemoPatient = (patientId) => {
		login(patientId);
		navigate({ to: "/patient" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-[calc(100vh-65px)] bg-background py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/4 left-1/4 -z-10 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px] pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-5 space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-500",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "HIPAA Compliant Patient Portal" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "text-3xl font-bold tracking-tight text-foreground sm:text-4xl",
								children: ["Ear-to-Heart ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-orange-500",
									children: "Health Hub"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground leading-relaxed",
								children: "Access your real-time cardiac telemetry records, AI diagnosis history, and update your personal clinical profile."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-md shadow-sm space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Quick Access Demo Profiles"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-amber-500" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2.5",
							children: patients.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => selectDemoPatient(p.id),
								className: "w-full group flex items-center justify-between rounded-xl border border-border/60 bg-card/80 p-3 text-left transition-all hover:border-orange-500/50 hover:bg-orange-500/5 hover:shadow-md",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 font-bold text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform",
										children: p.name.charAt(0)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-semibold text-foreground truncate group-hover:text-orange-500 transition-colors",
											children: p.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] text-muted-foreground",
											children: [
												p.age,
												"y • ",
												p.gender,
												" • ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono",
													children: p.id
												})
											]
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1 text-xs font-medium text-orange-500 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Login" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
								})]
							}, p.id))
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-7",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex rounded-xl bg-muted/60 p-1 mb-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setActiveTab("login");
										setErrorMsg("");
									},
									className: `flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all ${activeTab === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Existing Patient Login" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setActiveTab("register");
										setErrorMsg("");
									},
									className: `flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all ${activeTab === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Register New Patient" })]
								})]
							}),
							errorMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errorMsg })]
							}),
							activeTab === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleLoginSubmit,
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs font-semibold text-foreground",
											children: "Patient ID or Registered Email"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "e.g. PT-10492 or robert.chen@hospital-portal.org",
												value: identifier,
												onChange: (e) => setIdentifier(e.target.value),
												className: "w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] text-muted-foreground",
											children: [
												"Tip: Enter ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-foreground font-semibold",
													children: "PT-10492"
												}),
												" or click any demo patient on the left."
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										className: "w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] transition-all",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Access Patient Portal" })]
									})
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleRegisterSubmit,
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "sm:col-span-2 space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs font-semibold text-foreground",
												children: ["Full Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-destructive",
													children: "*"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												required: true,
												placeholder: "e.g. Maya Lin",
												value: name,
												onChange: (e) => setName(e.target.value),
												className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs font-semibold text-foreground",
												children: ["Age ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-destructive",
													children: "*"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												required: true,
												min: 1,
												max: 125,
												placeholder: "e.g. 52",
												value: age,
												onChange: (e) => setAge(e.target.value === "" ? "" : Number(e.target.value)),
												className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs font-semibold text-foreground",
												children: ["Gender ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-destructive",
													children: "*"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: gender,
												onChange: (e) => setGender(e.target.value),
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
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-xs font-semibold text-foreground",
												children: "Blood Type"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: bloodType,
												onChange: (e) => setBloodType(e.target.value),
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
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-xs font-semibold text-foreground",
												children: "Contact Email"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "email",
												placeholder: "e.g. maya.lin@example.com",
												value: email,
												onChange: (e) => setEmail(e.target.value),
												className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "sm:col-span-2 space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "text-xs font-semibold text-foreground",
												children: "Cardiovascular Notes / Pre-existing Condition"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "e.g. Mild Hypertension, Family History of CAD",
												value: condition,
												onChange: (e) => setCondition(e.target.value),
												className: "w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											})]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										className: "w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] transition-all",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Register & Create Patient Profile" })]
									})
								})]
							})
						]
					})
				})]
			})
		]
	});
}
var SplitComponent = LoginPage;
//#endregion
export { SplitComponent as component };
