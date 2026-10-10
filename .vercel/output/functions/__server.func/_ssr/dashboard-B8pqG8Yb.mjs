import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as useSensorStore, r as sessionRows, t as buffers } from "./sensorStore-Nqe95hp0.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as StatusPill } from "./StatusPill-OiRdFKlR.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as ConnectionBar } from "./ConnectionBar-Dv0HXea5.mjs";
import { t as MedicalDisclaimer } from "./MedicalDisclaimer-CHFhVfSO.mjs";
import { t as PipelineFlow } from "./PipelineFlow-BK8pUGKG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-B8pqG8Yb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Shows "--" whenever the hardware has not delivered this measurement. */
function MetricCard({ label, value, unit, decimals = 0, waitingText, statusText, tone, footnote, accentClass = "text-foreground", icon }) {
	const hasValue = value !== null && Number.isFinite(value);
	const isLive = tone === "ok";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("relative rounded-2xl p-5 overflow-hidden", "border bg-card", "transition-all duration-300", "hover:shadow-xl hover:-translate-y-0.5", isLive && "hover:shadow-primary/10"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-primary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xl leading-none",
						children: icon
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-semibold tracking-wide text-muted-foreground uppercase",
						children: label
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
					tone,
					children: statusText
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("mt-4 font-mono text-4xl font-bold tabular-nums leading-none tracking-tight", "transition-colors duration-500", hasValue ? accentClass : "text-muted-foreground/40", hasValue && isLive && "drop-shadow-sm"),
				children: [hasValue ? value.toFixed(decimals) : "——", hasValue && unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-2 text-base font-medium text-muted-foreground",
					children: unit
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground/70 leading-snug",
				children: hasValue ? footnote ?? "From ESP32 sensor data" : waitingText
			}),
			isLive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "absolute bottom-0 left-0 h-[2px] w-full rounded-full",
				style: {
					background: "linear-gradient(90deg, transparent, oklch(0.76 0.17 165 / 60%), transparent)",
					animation: "shimmer 2.5s linear infinite",
					backgroundSize: "200% 100%"
				}
			})
		]
	});
}
/**
* Canvas waveform driven by requestAnimationFrame reading a ring buffer directly.
* No React re-render per sample, and no point is ever generated locally —
* it draws exactly the samples the ESP32 sent.
*/
function WaveformChart({ buffer, color, label, windowSeconds, height = 180, paused = false, emptyMessage, hasData, fillWidth = false }) {
	const canvasRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const styles = getComputedStyle(canvas);
		const gridColor = styles.getPropertyValue("--signal-grid").trim() || "#333";
		const strokeColor = styles.getPropertyValue(color).trim() || "#0f0";
		const draw = () => {
			const dpr = window.devicePixelRatio || 1;
			const width = canvas.clientWidth;
			if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
				canvas.width = width * dpr;
				canvas.height = height * dpr;
			}
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, width, height);
			ctx.strokeStyle = gridColor;
			ctx.lineWidth = 1;
			ctx.beginPath();
			for (let x = 0; x <= width; x += width / 10) {
				ctx.moveTo(x, 0);
				ctx.lineTo(x, height);
			}
			for (let y = 0; y <= height; y += height / 4) {
				ctx.moveTo(0, y);
				ctx.lineTo(width, y);
			}
			ctx.stroke();
			const size = buffer.size;
			if (size > 1) {
				const now = buffer.timeAt(size - 1);
				const windowMs = windowSeconds * 1e3;
				let min = Infinity;
				let max = -Infinity;
				const points = [];
				for (let i = 0; i < size; i++) {
					const t = buffer.timeAt(i);
					if (now - t > windowMs) continue;
					const v = buffer.at(i);
					if (v < min) min = v;
					if (v > max) max = v;
					points.push([t, v]);
				}
				if (points.length > 1 && Number.isFinite(min) && Number.isFinite(max)) {
					const span = max - min || 1;
					const timeMin = points[0]?.[0] ?? now;
					const timeSpanMs = fillWidth ? Math.max(now - timeMin, 1) : windowMs;
					ctx.strokeStyle = strokeColor;
					ctx.lineWidth = 1.6;
					ctx.beginPath();
					points.forEach(([t, v], index) => {
						const x = fillWidth ? (t - timeMin) / timeSpanMs * width : width - (now - t) / timeSpanMs * width;
						const y = height - 8 - (v - min) / span * (height - 16);
						if (index === 0) ctx.moveTo(x, y);
						else ctx.lineTo(x, y);
					});
					ctx.stroke();
				}
			}
			if (!paused) frameRef.current = requestAnimationFrame(draw);
		};
		frameRef.current = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(frameRef.current);
	}, [
		buffer,
		color,
		height,
		windowSeconds,
		paused
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			role: "img",
			"aria-label": `${label} waveform from the ESP32`,
			style: {
				width: "100%",
				height
			}
		}), !hasData && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "absolute inset-0 flex items-center justify-center text-sm text-muted-foreground",
			children: emptyMessage
		})]
	});
}
var COLUMNS = [
	"timestamp",
	"ecg",
	"ppgIR",
	"ppgRed",
	"bpm",
	"spo2",
	"signalQuality",
	"temperature",
	"accelX",
	"accelY",
	"accelZ",
	"gyroX",
	"gyroY",
	"gyroZ"
];
var cell = (value) => value === void 0 ? "" : String(value);
/** CSV of real recorded values only. Missing measurements stay empty — never zero-filled. */
function toCSV(rows) {
	const lines = [COLUMNS.join(",")];
	for (const row of rows) lines.push([
		String(row.t),
		cell(row.ecg),
		cell(row.ppgIR),
		cell(row.ppgRed),
		cell(row.bpm),
		cell(row.spo2),
		cell(row.signalQuality),
		cell(row.temperature),
		cell(row.accelX),
		cell(row.accelY),
		cell(row.accelZ),
		cell(row.gyroX),
		cell(row.gyroY),
		cell(row.gyroZ)
	].join(","));
	return lines.join("\n");
}
function toJSON(rows) {
	return JSON.stringify({
		source: "ESP32 hardware capture",
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		sampleCount: rows.length,
		samples: rows.map((row) => ({
			timestamp: row.t,
			ecg: row.ecg ?? null,
			ppgIR: row.ppgIR ?? null,
			ppgRed: row.ppgRed ?? null,
			bpm: row.bpm ?? null,
			spo2: row.spo2 ?? null,
			signalQuality: row.signalQuality ?? null,
			temperature: row.temperature ?? null,
			accelX: row.accelX ?? null,
			accelY: row.accelY ?? null,
			accelZ: row.accelZ ?? null,
			gyroX: row.gyroX ?? null,
			gyroY: row.gyroY ?? null,
			gyroZ: row.gyroZ ?? null
		}))
	}, null, 2);
}
function downloadFile(filename, content, mime) {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}
function useFreshness(time, windowMs = 2e3) {
	const [, tick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => tick((n) => n + 1), 400);
		return () => window.clearInterval(id);
	}, []);
	return time !== null && Date.now() - time < windowMs;
}
function SectionTitle({ icon, children, trail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "flex items-center gap-2 text-sm font-semibold text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-base leading-none",
				children: icon
			}), children]
		}), trail]
	});
}
function Divider() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: "h-px w-full rounded-full",
		style: { background: "linear-gradient(90deg, transparent 0%, oklch(0.76 0.17 165 / 30%) 50%, transparent 100%)" }
	});
}
function Dashboard() {
	const s = useSensorStore();
	const live = s.connectionState === "CONNECTED";
	const ecgLive = useFreshness(s.lastEcgTime) && live;
	const ppgLive = useFreshness(s.lastPpgTime) && live;
	const bpmFresh = useFreshness(s.lastBpmTime, 8e3) && live;
	const spo2Fresh = useFreshness(s.lastSpo2Time, 8e3) && live;
	const tempFresh = useFreshness(s.lastTemperatureTime, 8e3) && live;
	const imuFresh = useFreshness(s.lastImuTime, 4e3) && live;
	const signalTone = (fresh) => fresh ? "ok" : live ? "warn" : "idle";
	const signalText = (fresh) => fresh ? "LIVE" : live ? "WAITING" : "NO SIGNAL";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "animate-slide-in-up stagger-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionBar, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				icon: "💓",
				children: "Primary Vitals"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-slide-in-up stagger-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
							label: "Heart Rate",
							value: bpmFresh ? s.bpm : null,
							unit: "BPM",
							waitingText: live ? "Waiting for BPM data" : "ESP32 disconnected",
							statusText: bpmFresh ? "LIVE" : live ? "WAITING" : "NO DATA",
							tone: signalTone(bpmFresh),
							accentClass: "text-signal-ecg",
							footnote: "Computed on the ESP32 firmware",
							icon: "🫀"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-slide-in-up stagger-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
							label: "Blood Oxygen",
							value: spo2Fresh ? s.spo2 : null,
							unit: "%",
							waitingText: live ? "Waiting for SpO₂ data" : "ESP32 disconnected",
							statusText: spo2Fresh ? "LIVE" : live ? "WAITING" : "NO DATA",
							tone: signalTone(spo2Fresh),
							accentClass: "text-signal-ir",
							footnote: "MAX30102 ratio-of-ratios on ESP32",
							icon: "🩸"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-slide-in-up stagger-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: cn("relative rounded-2xl border bg-card p-5 overflow-hidden", "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"aria-hidden": true,
									className: "pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-signal-ecg"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-base",
											children: "📈"
										}), " ECG (AD8232)"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
										tone: signalTone(ecgLive),
										children: signalText(ecgLive)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 font-mono text-4xl font-bold tabular-nums leading-none text-signal-ecg",
									children: s.ecgCurrent === null ? "——" : s.ecgCurrent
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 font-mono text-xs text-muted-foreground/70",
									children: [
										s.ecgSampleRate,
										" samples/s · ",
										s.ecgSamples.toLocaleString(),
										" samples"
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-slide-in-up stagger-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: cn("relative rounded-2xl border bg-card p-5 overflow-hidden", "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"aria-hidden": true,
									className: "pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-signal-ir"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-base",
											children: "🔴"
										}), " PPG (MAX30102)"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
										tone: signalTone(ppgLive),
										children: signalText(ppgLive)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-4 font-mono text-lg tabular-nums font-bold text-signal-ir",
									children: [
										"IR ",
										s.ppgIRCurrent ?? "——",
										" · RED ",
										s.ppgRedCurrent ?? "——"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 font-mono text-xs text-muted-foreground/70",
									children: [
										s.ppgSampleRate,
										" samples/s · ",
										s.ppgSamples.toLocaleString(),
										" samples"
									]
								})
							]
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				icon: "🌡️",
				children: "Environment & Motion"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-slide-in-up stagger-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
							label: "Body Temperature",
							value: tempFresh ? s.temperature : null,
							unit: "°C",
							decimals: 1,
							waitingText: live ? "Waiting for Temperature data" : "ESP32 disconnected",
							statusText: tempFresh ? "LIVE" : live ? "WAITING" : "NO DATA",
							tone: signalTone(tempFresh),
							accentClass: "text-signal-red",
							footnote: "Internal/Body temperature",
							icon: "🌡️"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-slide-in-up stagger-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
							label: "Motion Magnitude",
							value: imuFresh ? s.motionMagnitude : null,
							unit: "g",
							decimals: 2,
							waitingText: live ? "Waiting for BMI323 accelerometer data" : "ESP32 disconnected",
							statusText: imuFresh ? "LIVE" : live ? "WAITING" : "NO DATA",
							tone: signalTone(imuFresh),
							footnote: "Used to detect rest vs movement artefacts",
							icon: "📱"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-slide-in-up stagger-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "relative rounded-2xl border bg-card p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"aria-hidden": true,
									className: "pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-primary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🔧" }), " Accelerometer (g)"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
										tone: signalTone(imuFresh),
										children: signalText(imuFresh)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-4 font-mono text-lg tabular-nums font-semibold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-xs",
											children: "X "
										}),
										imuFresh && s.accel ? s.accel.x.toFixed(2) : "——",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-xs",
											children: " Y "
										}),
										imuFresh && s.accel ? s.accel.y.toFixed(2) : "——",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-xs",
											children: " Z "
										}),
										imuFresh && s.accel ? s.accel.z.toFixed(2) : "——"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 font-mono text-xs text-muted-foreground/70",
									children: [s.imuUpdates.toLocaleString(), " IMU samples"]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-slide-in-up stagger-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "relative rounded-2xl border bg-card p-5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"aria-hidden": true,
									className: "pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10 blur-2xl bg-signal-ir"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🌀" }), " Gyroscope (°/s)"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
										tone: signalTone(imuFresh),
										children: signalText(imuFresh)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-4 font-mono text-lg tabular-nums font-semibold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-xs",
											children: "X "
										}),
										imuFresh && s.gyro ? s.gyro.x.toFixed(1) : "——",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-xs",
											children: " Y "
										}),
										imuFresh && s.gyro ? s.gyro.y.toFixed(1) : "——",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-xs",
											children: " Z "
										}),
										imuFresh && s.gyro ? s.gyro.z.toFixed(1) : "——"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 font-mono text-xs text-muted-foreground/70",
									children: "6-DoF BMI323 over I²C"
								})
							]
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionTitle, {
					icon: "📉",
					trail: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							className: "rounded-xl text-xs font-medium",
							onClick: () => s.setPaused(!s.paused),
							children: s.paused ? "▶ Resume" : "⏸ Pause"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							className: "rounded-xl text-xs font-medium",
							onClick: s.clearWaveforms,
							children: "Clear"
						})]
					}),
					children: [
						"ECG Waveform — ",
						s.settings.timeWindowSeconds,
						"s window"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveformChart, {
					buffer: buffers.ecg,
					color: "--signal-ecg",
					label: "ECG",
					hasData: s.ecgSamples > 0,
					paused: s.paused,
					windowSeconds: s.settings.timeWindowSeconds,
					height: 220,
					emptyMessage: live ? "Waiting for ECG samples from the AD8232" : "ECG: no signal — ESP32 disconnected"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 text-sm font-semibold text-signal-ir",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🔵" }), " PPG Infrared (IR)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveformChart, {
						buffer: buffers.ppgIR,
						color: "--signal-ir",
						label: "PPG IR",
						hasData: s.ppgSamples > 0,
						paused: s.paused,
						windowSeconds: s.settings.timeWindowSeconds,
						emptyMessage: live ? "Waiting for MAX30102 IR data" : "PPG IR: no signal"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 text-sm font-semibold text-signal-red",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🔴" }), " PPG Red"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveformChart, {
						buffer: buffers.ppgRed,
						color: "--signal-red",
						label: "PPG RED",
						hasData: s.ppgRedCurrent !== null,
						paused: s.paused,
						windowSeconds: s.settings.timeWindowSeconds,
						emptyMessage: live ? "Waiting for MAX30102 RED data" : "PPG RED: no signal"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				icon: "📊",
				children: "Trend History"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "BPM Trend"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveformChart, {
						buffer: buffers.bpm,
						color: "--signal-ecg",
						label: "BPM trend",
						hasData: s.bpmUpdates > 0,
						paused: s.paused,
						windowSeconds: 120,
						height: 140,
						emptyMessage: "Waiting for BPM data",
						fillWidth: true
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "SpO₂ Trend"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveformChart, {
						buffer: buffers.spo2,
						color: "--signal-ir",
						label: "SpO2 trend",
						hasData: s.spo2Updates > 0,
						paused: s.paused,
						windowSeconds: 120,
						height: 140,
						emptyMessage: "Waiting for SpO₂ data",
						fillWidth: true
					})]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineFlow, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: cn("rounded-2xl border p-5 transition-all duration-300", "bg-card hover:shadow-lg", s.recording && "border-destructive/30 bg-destructive/5"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
					icon: s.recording ? "🔴" : "⏺",
					trail: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							s.recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "destructive",
								className: "rounded-xl font-medium",
								onClick: s.stopSession,
								children: "⏹ Stop Session"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "rounded-xl font-medium",
								onClick: s.startSession,
								children: "▶ Start Session"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								className: "rounded-xl font-medium",
								disabled: s.recordedRows === 0,
								onClick: () => downloadFile(`esp32-session-${Date.now()}.csv`, toCSV(sessionRows), "text/csv"),
								children: "↓ CSV"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								className: "rounded-xl font-medium",
								disabled: s.recordedRows === 0,
								onClick: () => downloadFile(`esp32-session-${Date.now()}.json`, toJSON(sessionRows), "application/json"),
								children: "↓ JSON"
							})
						]
					}),
					children: "Session Recording"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 font-mono text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("font-semibold", s.recording ? "text-destructive" : "text-muted-foreground"),
							children: s.recording ? "● RECORDING" : "○ IDLE"
						}),
						" · ",
						s.recordedRows.toLocaleString(),
						" real sensor rows captured"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedicalDisclaimer, {})
		]
	});
}
var SplitComponent = Dashboard;
//#endregion
export { SplitComponent as component };
