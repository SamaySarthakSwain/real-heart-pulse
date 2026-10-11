import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Heart, E as Info, F as CircleX, G as ArrowLeft, I as CircleCheck, K as Activity, L as CircleAlert, M as EyeOff, S as LoaderCircle, T as KeyRound, W as ArrowRight, c as ShieldCheck, j as Eye, k as Hash, l as Send, r as User, s as Sparkles, v as Mail, x as Lock } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as validateUsername, i as validateEmail, n as usePatientStore, r as evaluatePasswordStrength } from "./router-_n_MgLcq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CmQGyJKa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthWaveformGraphic({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative overflow-hidden rounded-2xl border border-white/10 bg-[#142033]/60 p-5 backdrop-blur-md shadow-2xl ${className}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-12 -left-12 h-36 w-36 rounded-full bg-[#FF6B00]/20 blur-3xl pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-15 pointer-events-none",
				style: {
					backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
					backgroundSize: "16px 16px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex items-center justify-between mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative flex h-2.5 w-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF8A00] opacity-75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6B00]" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-mono font-medium tracking-wider text-slate-300 uppercase",
						children: "Live Telemetry • Channel A1"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 font-mono text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "72 BPM" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-400",
							children: "•"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "99% SpO₂" })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 h-28 w-full flex items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 600 120",
					className: "w-full h-full text-[#FF8A00]",
					preserveAspectRatio: "none",
					fill: "none",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M0,60 L70,60 L85,45 L100,75 L115,60 L140,60 L155,20 L168,110 L182,5 L195,85 L210,60 L240,60 L260,52 L280,68 L300,60 L370,60 L385,45 L400,75 L415,60 L440,60 L455,20 L468,110 L482,5 L495,85 L510,60 L540,60 L560,52 L580,68 L600,60",
							stroke: "rgba(255, 107, 0, 0.25)",
							strokeWidth: "3",
							strokeLinecap: "round",
							strokeLinejoin: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M0,60 L70,60 L85,45 L100,75 L115,60 L140,60 L155,20 L168,110 L182,5 L195,85 L210,60 L240,60 L260,52 L280,68 L300,60 L370,60 L385,45 L400,75 L415,60 L440,60 L455,20 L468,110 L482,5 L495,85 L510,60 L540,60 L560,52 L580,68 L600,60",
							stroke: "url(#ecgGradient)",
							strokeWidth: "2.5",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							style: { filter: "drop-shadow(0px 0px 6px rgba(255, 138, 0, 0.7))" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "ecgGradient",
							x1: "0%",
							y1: "0%",
							x2: "100%",
							y2: "0%",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: "#FF6B00",
									stopOpacity: "0.4"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "30%",
									stopColor: "#FF8A00",
									stopOpacity: "0.9"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "60%",
									stopColor: "#FFA633",
									stopOpacity: "1"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "85%",
									stopColor: "#10B981",
									stopOpacity: "0.9"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: "#10B981",
									stopOpacity: "0.3"
								})
							]
						}) })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center font-mono text-[10px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-slate-400 block",
						children: "QRS Duration"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-white font-semibold",
						children: "88 ms"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-slate-400 block",
						children: "QT Interval"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-white font-semibold",
						children: "395 ms"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-slate-400 block",
						children: "Rhythm Quality"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-emerald-400 font-semibold",
						children: "Optimal 98%"
					})] })
				]
			})
		]
	});
}
function AuthLayout({ children, mode, title, subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-[calc(100vh-65px)] bg-[#F3F6F9] dark:bg-[#0D1526] text-[#142033] dark:text-slate-100 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/4 left-1/6 -z-10 h-96 w-96 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/15 blur-[120px] pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-1/4 right-1/6 -z-10 h-96 w-96 rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-[120px] pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-6 flex flex-col justify-center space-y-7 py-2 lg:py-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-[#FF6B00] dark:text-[#FF8A00] shadow-sm backdrop-blur-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex h-2 w-2 rounded-full bg-[#FF6B00] animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ear-to-Heart Health Hub" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#142033] dark:text-white leading-[1.15]",
									children: [
										"Your Heart Health, ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", { className: "hidden sm:inline" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] bg-clip-text text-transparent",
											children: "Connected."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm sm:text-base text-[#667085] dark:text-slate-300 leading-relaxed max-w-lg",
									children: "Securely access your cardiac health reports, real-time monitoring, and AI-powered heart health insights."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden sm:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthWaveformGraphic, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#142033]/70 p-3.5 backdrop-blur-md shadow-sm transition-transform hover:-translate-y-0.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 text-[#FF6B00] mb-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-xs font-semibold text-[#142033] dark:text-white",
											children: "Real-Time Cardiac Monitoring"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] text-[#667085] dark:text-slate-400 leading-snug",
											children: "Sub-millisecond biosensor telemetry & live rhythm stream."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#142033]/70 p-3.5 backdrop-blur-md shadow-sm transition-transform hover:-translate-y-0.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 mb-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-xs font-semibold text-[#142033] dark:text-white",
											children: "AI-Powered Risk Assessment"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] text-[#667085] dark:text-slate-400 leading-snug",
											children: "1D-CNN arrhythmia screening & ischemic early alerts."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#142033]/70 p-3.5 backdrop-blur-md shadow-sm transition-transform hover:-translate-y-0.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 mb-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-xs font-semibold text-[#142033] dark:text-white",
											children: "Secure Patient Records"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] text-[#667085] dark:text-slate-400 leading-snug",
											children: "Encrypted clinical history with isolated patient access."
										})
									]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-6 flex justify-center items-center w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full max-w-[460px] rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-6 sm:p-9 shadow-xl shadow-slate-200/50 dark:shadow-black/40 backdrop-blur-xl transition-all",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center space-y-3 mb-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8A00] text-white shadow-lg shadow-orange-500/25 ring-4 ring-orange-500/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-6 w-6 fill-white stroke-white" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xl sm:text-2xl font-bold tracking-tight text-[#142033] dark:text-white",
									children: title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs sm:text-sm text-[#667085] dark:text-slate-300",
									children: subtitle
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative",
								children
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-center gap-1.5 text-[11px] text-[#667085] dark:text-slate-400 font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3 w-3 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "256-Bit SSL Encryption • HIPAA Compliant Architecture" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[10px] text-slate-400 dark:text-slate-500 leading-tight",
									children: [
										"Your medical data is protected with end-to-end security. By continuing, you agree to our",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: "#privacy",
											className: "underline hover:text-[#FF6B00]",
											children: "Privacy Policy"
										}),
										" ",
										"and",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: "#terms",
											className: "underline hover:text-[#FF6B00]",
											children: "Terms of Service"
										}),
										"."
									]
								})]
							})
						]
					})
				})]
			})
		]
	});
}
function PasswordInput({ label, error, hint, id, className = "", ...props }) {
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5 w-full",
		children: [
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: id,
					className: "text-xs font-semibold text-[#142033] dark:text-slate-200",
					children: label
				}), hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] text-[#667085] dark:text-slate-400",
					children: hint
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id,
						type: showPassword ? "text" : "password",
						className: `w-full rounded-xl border ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-11 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all ${className}`,
						...props
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setShowPassword((prev) => !prev),
						className: "absolute right-3 p-1 rounded-lg text-[#667085] hover:text-[#142033] dark:text-slate-400 dark:hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]",
						"aria-label": showPassword ? "Hide password" : "Show password",
						tabIndex: 0,
						children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, {
							className: "h-4 w-4",
							"aria-hidden": "true"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
							className: "h-4 w-4",
							"aria-hidden": "true"
						})
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1 animate-in fade-in duration-200",
				children: error
			})
		]
	});
}
function LoginForm({ onNavigateToRegister, onNavigateToForgot, onSuccess }) {
	const authenticatePatient = usePatientStore((s) => s.authenticatePatient);
	const [identifier, setIdentifier] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [rememberMe, setRememberMe] = (0, import_react.useState)(true);
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	const [errorMessage, setErrorMessage] = (0, import_react.useState)(null);
	const [fieldErrors, setFieldErrors] = (0, import_react.useState)({});
	const validate = () => {
		const errors = {};
		if (!identifier.trim()) errors.identifier = "Please enter your email, username, or patient ID.";
		if (!password) errors.password = "Please enter your password.";
		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage(null);
		if (!validate()) return;
		setIsLoading(true);
		try {
			const res = await authenticatePatient({
				identifier: identifier.trim(),
				password,
				rememberMe
			});
			if (res.success) onSuccess();
			else setErrorMessage(res.error || "Invalid credentials. Please verify your identifier and password.");
		} catch (err) {
			setErrorMessage("Authentication failed due to a network or server error. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "space-y-5",
		noValidate: true,
		children: [
			errorMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in duration-200",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 leading-relaxed",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold block",
						children: "Authentication Issue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errorMessage })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "auth-identifier",
						className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
						children: "Email, Username, or Patient ID"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "auth-identifier",
							type: "text",
							name: "username",
							autoComplete: "username",
							value: identifier,
							onChange: (e) => {
								setIdentifier(e.target.value);
								if (fieldErrors.identifier) setFieldErrors((prev) => ({
									...prev,
									identifier: void 0
								}));
							},
							placeholder: "Enter your email, username, or patient ID",
							disabled: isLoading,
							className: `w-full rounded-xl border ${fieldErrors.identifier ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`
						})]
					}),
					fieldErrors.identifier && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1",
						children: fieldErrors.identifier
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
					id: "auth-password",
					name: "password",
					label: "Password",
					autoComplete: "current-password",
					value: password,
					onChange: (e) => {
						setPassword(e.target.value);
						if (fieldErrors.password) setFieldErrors((prev) => ({
							...prev,
							password: void 0
						}));
					},
					placeholder: "Enter your password",
					error: fieldErrors.password,
					disabled: isLoading
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-xs pt-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 cursor-pointer select-none text-[#142033] dark:text-slate-300",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: rememberMe,
						onChange: (e) => setRememberMe(e.target.checked),
						disabled: isLoading,
						className: "h-4 w-4 rounded border-[#D9E1EA] text-[#FF6B00] focus:ring-[#FF6B00] focus:ring-offset-0 transition-colors accent-[#FF6B00]"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-[#667085] dark:text-slate-300",
						children: "Remember me"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onNavigateToForgot,
					disabled: isLoading,
					className: "font-medium text-[#FF6B00] hover:text-[#FF8A00] transition-colors focus:outline-none focus:underline",
					children: "Forgot Password?"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: isLoading,
					className: "group relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] py-3 px-4 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-[#E66000] hover:to-[#FF7A00] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-white" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Verifying Credentials..." })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sign In" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-2.5 text-[11px] text-[#667085] dark:text-slate-400",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 font-medium text-[#142033] dark:text-slate-200 mb-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-3 w-3 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Quick Clinic Demo Credentials:" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "leading-relaxed",
					children: [
						"Identifier: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-[#142033] dark:text-slate-200 bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700",
							children: "PT-10492"
						}),
						" or ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-[#142033] dark:text-slate-200 bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700",
							children: "robert.chen"
						}),
						" • Password: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-[#142033] dark:text-slate-200 bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700",
							children: "Heart@2026"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-2 text-center text-xs text-[#667085] dark:text-slate-400 border-t border-slate-100 dark:border-slate-800",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Don't have an account? " }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onNavigateToRegister,
					disabled: isLoading,
					className: "font-semibold text-[#FF6B00] hover:text-[#FF8A00] transition-colors focus:outline-none focus:underline",
					children: "Create an Account"
				})]
			})
		]
	});
}
function RegisterForm({ onNavigateToLogin, onSuccess }) {
	const registerPatientAccount = usePatientStore((s) => s.registerPatientAccount);
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [username, setUsername] = (0, import_react.useState)("");
	const [patientId, setPatientId] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	const [globalError, setGlobalError] = (0, import_react.useState)(null);
	const [fieldErrors, setFieldErrors] = (0, import_react.useState)({});
	const strength = evaluatePasswordStrength(password);
	const validateAll = () => {
		const errors = {};
		if (!name.trim()) errors.name = "Full Name is required.";
		const emailErr = validateEmail(email);
		if (emailErr) errors.email = emailErr;
		const usernameErr = validateUsername(username);
		if (usernameErr) errors.username = usernameErr;
		if (!password) errors.password = "Password is required.";
		else if (!strength.valid) errors.password = "Password does not satisfy the security requirements below.";
		if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
		else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setGlobalError(null);
		if (!validateAll()) return;
		setIsLoading(true);
		try {
			const res = await registerPatientAccount({
				name: name.trim(),
				email: email.trim(),
				username: username.trim(),
				password,
				patientId: patientId.trim() || void 0
			});
			if (res.success) onSuccess();
			else setGlobalError(res.error || "Unable to complete registration. Please check the form.");
		} catch (err) {
			setGlobalError("An unexpected error occurred while processing registration. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "space-y-4",
		noValidate: true,
		children: [
			globalError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in duration-200",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 leading-relaxed",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold block",
						children: "Registration Error"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: globalError })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						htmlFor: "reg-name",
						className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
						children: ["Full Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-rose-500",
							children: "*"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "reg-name",
							type: "text",
							name: "name",
							autoComplete: "name",
							value: name,
							onChange: (e) => {
								setName(e.target.value);
								if (fieldErrors.name) setFieldErrors((prev) => ({
									...prev,
									name: void 0
								}));
							},
							placeholder: "e.g. Sarah Jenkins",
							disabled: isLoading,
							className: `w-full rounded-xl border ${fieldErrors.name ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`
						})]
					}),
					fieldErrors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium text-rose-500 dark:text-rose-400",
						children: fieldErrors.name
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							htmlFor: "reg-email",
							className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
							children: ["Email Address ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-rose-500",
								children: "*"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "reg-email",
								type: "email",
								name: "email",
								autoComplete: "email",
								value: email,
								onChange: (e) => {
									setEmail(e.target.value);
									if (fieldErrors.email) setFieldErrors((prev) => ({
										...prev,
										email: void 0
									}));
								},
								placeholder: "sarah@example.com",
								disabled: isLoading,
								className: `w-full rounded-xl border ${fieldErrors.email ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`
							})]
						}),
						fieldErrors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium text-rose-500 dark:text-rose-400",
							children: fieldErrors.email
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							htmlFor: "reg-username",
							className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
							children: ["Username ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-rose-500",
								children: "*"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-mono font-bold",
									children: "@"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "reg-username",
								type: "text",
								name: "username",
								autoComplete: "username",
								value: username,
								onChange: (e) => {
									setUsername(e.target.value);
									if (fieldErrors.username) setFieldErrors((prev) => ({
										...prev,
										username: void 0
									}));
								},
								placeholder: "sarah_j",
								disabled: isLoading,
								className: `w-full rounded-xl border ${fieldErrors.username ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`
							})]
						}),
						fieldErrors.username && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium text-rose-500 dark:text-rose-400",
							children: fieldErrors.username
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							htmlFor: "reg-patientId",
							className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
							children: ["Patient ID ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#667085] font-normal",
								children: "(Optional)"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] text-[#667085] dark:text-slate-400 flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-3 w-3 text-slate-400" }), "If assigned by healthcare provider"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "reg-patientId",
							type: "text",
							value: patientId,
							onChange: (e) => {
								setPatientId(e.target.value.toUpperCase());
								if (fieldErrors.patientId) setFieldErrors((prev) => ({
									...prev,
									patientId: void 0
								}));
							},
							placeholder: "e.g. PT-10492",
							disabled: isLoading,
							className: `w-full rounded-xl border ${fieldErrors.patientId ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm font-mono text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`
						})]
					}),
					fieldErrors.patientId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium text-rose-500 dark:text-rose-400",
						children: fieldErrors.patientId
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
					id: "reg-password",
					name: "new-password",
					label: "Password *",
					autoComplete: "new-password",
					value: password,
					onChange: (e) => {
						setPassword(e.target.value);
						if (fieldErrors.password) setFieldErrors((prev) => ({
							...prev,
							password: void 0
						}));
					},
					placeholder: "At least 8 characters with numbers",
					error: fieldErrors.password,
					disabled: isLoading
				}), password.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-1.5 space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-[11px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#667085] dark:text-slate-400 font-medium",
								children: "Strength:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `font-semibold ${strength.score <= 1 ? "text-rose-500" : strength.score === 2 ? "text-amber-500" : strength.score === 3 ? "text-emerald-500" : "text-emerald-600"}`,
								children: strength.level
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-4 gap-1 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-full rounded-full transition-all ${strength.score >= 1 ? "bg-rose-500" : "bg-transparent"}` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-full rounded-full transition-all ${strength.score >= 2 ? "bg-amber-500" : "bg-transparent"}` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-full rounded-full transition-all ${strength.score >= 3 ? "bg-emerald-500" : "bg-transparent"}` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-full rounded-full transition-all ${strength.score >= 4 ? "bg-emerald-600" : "bg-transparent"}` })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-x-2 gap-y-1 pt-0.5 text-[10px] text-[#667085] dark:text-slate-400",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [strength.rules.hasLength ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 text-emerald-500 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" }), "8+ characters"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [strength.rules.hasUpper ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 text-emerald-500 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" }), "Uppercase letter"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [strength.rules.hasLower ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 text-emerald-500 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" }), "Lowercase letter"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [strength.rules.hasNumberOrSpecial ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 text-emerald-500 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" }), "Number or symbol"]
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
					id: "reg-confirmPassword",
					name: "confirm-password",
					label: "Confirm Password *",
					autoComplete: "new-password",
					value: confirmPassword,
					onChange: (e) => {
						setConfirmPassword(e.target.value);
						if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({
							...prev,
							confirmPassword: void 0
						}));
					},
					placeholder: "Re-enter your password",
					error: fieldErrors.confirmPassword,
					disabled: isLoading
				}), confirmPassword && password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: `text-[11px] font-medium mt-1 flex items-center gap-1 ${password === confirmPassword ? "text-emerald-500" : "text-rose-500"}`,
					children: password === confirmPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Passwords match" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Passwords do not match" })] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: isLoading,
					className: "group relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] py-3 px-4 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-[#E66000] hover:to-[#FF7A00] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-white" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Creating Healthcare Profile..." })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Create Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-2 text-center text-xs text-[#667085] dark:text-slate-400 border-t border-slate-100 dark:border-slate-800",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Already have an account? " }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onNavigateToLogin,
					disabled: isLoading,
					className: "font-semibold text-[#FF6B00] hover:text-[#FF8A00] transition-colors focus:outline-none focus:underline",
					children: "Sign In"
				})]
			})
		]
	});
}
function ForgotPasswordForm({ onNavigateToLogin }) {
	const requestPasswordReset = usePatientStore((s) => s.requestPasswordReset);
	const [email, setEmail] = (0, import_react.useState)("");
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	const [emailError, setEmailError] = (0, import_react.useState)(null);
	const [isSuccess, setIsSuccess] = (0, import_react.useState)(false);
	const [successMessage, setSuccessMessage] = (0, import_react.useState)(null);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setEmailError(null);
		const err = validateEmail(email);
		if (err) {
			setEmailError(err);
			return;
		}
		setIsLoading(true);
		try {
			const res = await requestPasswordReset(email.trim());
			setIsSuccess(true);
			setSuccessMessage(res.message || "If an account exists with this email address, password reset instructions have been sent. Please check your inbox and spam folder.");
		} catch {
			setEmailError("Unable to process password reset at this moment. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-5",
		children: isSuccess ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5 text-center animate-in fade-in zoom-in-95 duration-200",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-7 w-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-bold text-[#142033] dark:text-slate-100",
						children: "Reset Request Dispatched"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#667085] dark:text-slate-300 leading-relaxed px-2",
						children: successMessage
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3 text-left text-[11px] text-[#667085] dark:text-slate-400 space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-[#142033] dark:text-slate-200 block",
						children: "Security Notice:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "For your health data protection, reset tokens expire after 30 minutes. If you do not see the email, check your spam or junk folder." })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onNavigateToLogin,
					className: "w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-semibold text-[#142033] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Return to Sign In" })]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-4",
			noValidate: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "forgot-email",
							className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
							children: "Email Address"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute left-3.5 flex items-center pointer-events-none text-[#667085] dark:text-slate-400",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "forgot-email",
								type: "email",
								name: "email",
								autoComplete: "email",
								value: email,
								onChange: (e) => {
									setEmail(e.target.value);
									if (emailError) setEmailError(null);
								},
								placeholder: "Enter your registered email address",
								disabled: isLoading,
								className: `w-full rounded-xl border ${emailError ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 dark:placeholder:text-slate-400/60 focus:outline-none focus:ring-2 transition-all disabled:opacity-60`
							})]
						}),
						emailError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1",
							children: emailError
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: isLoading,
						className: "group relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] py-3 px-4 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-[#E66000] hover:to-[#FF7A00] hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-white" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Processing Request..." })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Send Reset Link" })] })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-2 text-center text-xs text-[#667085] dark:text-slate-400 border-t border-slate-100 dark:border-slate-800",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onNavigateToLogin,
						disabled: isLoading,
						className: "inline-flex items-center gap-1.5 font-semibold text-[#142033] dark:text-slate-300 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors focus:outline-none focus:underline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Back to Sign In" })]
					})
				})
			]
		})
	});
}
function LoginPage() {
	const navigate = useNavigate();
	usePatientStore((s) => s.getCurrentPatient());
	const [mode, setMode] = (0, import_react.useState)("login");
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined") {
			const urlMode = new URLSearchParams(window.location.search).get("mode");
			if (urlMode === "register" || urlMode === "forgot" || urlMode === "login") setMode(urlMode);
		}
	}, []);
	const handleModeChange = (newMode) => {
		setMode(newMode);
		if (typeof window !== "undefined") {
			const url = new URL(window.location.href);
			if (newMode === "login") url.searchParams.delete("mode");
			else url.searchParams.set("mode", newMode);
			window.history.replaceState({}, "", url.toString());
		}
	};
	const handleLoginSuccess = () => {
		const patient = usePatientStore.getState().getCurrentPatient();
		if (patient && !patient.hasCompletedAssessment) {
			toast.info(`Welcome, ${patient.name}!`, { description: "Please complete your initial Patient Profile & Health Assessment before entering the dashboard." });
			navigate({ to: "/assessment" });
		} else {
			toast.success(`Welcome back, ${patient?.name || "Patient"}!`, { description: "Secure session verified. Opening your real-time cardiac dashboard..." });
			navigate({ to: "/dashboard" });
		}
	};
	const handleRegisterSuccess = () => {
		usePatientStore.getState().getCurrentPatient();
		toast.success("Account created successfully!", { description: `Welcome to Ear-to-Heart Health Hub. Let's complete your Patient Profile & Health Assessment.` });
		navigate({ to: "/assessment" });
	};
	const modeMetadata = {
		login: {
			title: "Welcome Back",
			subtitle: "Sign in to access your heart health dashboard."
		},
		register: {
			title: "Create Patient Account",
			subtitle: "Register to begin continuous cardiac monitoring and telemetry."
		},
		forgot: {
			title: "Reset Your Password",
			subtitle: "Enter the email address associated with your account."
		}
	}[mode];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthLayout, {
		mode,
		title: modeMetadata.title,
		subtitle: modeMetadata.subtitle,
		children: [
			mode === "login" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, {
				onNavigateToRegister: () => handleModeChange("register"),
				onNavigateToForgot: () => handleModeChange("forgot"),
				onSuccess: handleLoginSuccess
			}),
			mode === "register" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegisterForm, {
				onNavigateToLogin: () => handleModeChange("login"),
				onSuccess: handleRegisterSuccess
			}),
			mode === "forgot" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForgotPasswordForm, { onNavigateToLogin: () => handleModeChange("login") })
		]
	});
}
var SplitComponent = LoginPage;
//#endregion
export { SplitComponent as component };
