import { i as useSensorStore } from "./sensorStore-Nqe95hp0.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as MedicalDisclaimer } from "./MedicalDisclaimer-CHFhVfSO.mjs";
import { t as PipelineFlow } from "./PipelineFlow-BK8pUGKG.mjs";
import { t as HardwareTest } from "./HardwareTest-FEysSk3q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/diagnostics-DPeC1mIt.js
var import_jsx_runtime = require_jsx_runtime();
function RawConsole({ limit = 40 }) {
	const rawLog = useSensorStore((s) => s.rawLog);
	const clearRawLog = useSensorStore((s) => s.clearRawLog);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Raw serial console",
		className: "rounded-xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Raw serial console"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				onClick: clearRawLog,
				children: "Clear"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 max-h-96 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs",
			children: rawLog.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Waiting for sensor data from the ESP32…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: rawLog.slice(0, limit).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border-b border-border/60 pb-2 last:border-none",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground",
							children: [
								"RAW PACKET [",
								entry.format,
								"]"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "break-all",
							children: entry.raw
						}),
						entry.packet && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-foreground/80",
							children: [
								"PARSED",
								" ",
								Object.entries(entry.packet).map(([key, value]) => `${key}: ${String(value)}`).join("  |  ")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: entry.valid ? "text-status-ok" : "text-destructive",
							children: [
								"VALIDATION: ",
								entry.valid ? "PASS" : "REJECTED",
								entry.errors.length > 0 ? ` — ${entry.errors.join("; ")}` : ""
							]
						})
					]
				}, entry.id))
			})
		})]
	});
}
function Diagnostics() {
	const s = useSensorStore();
	const stats = [
		[
			"Packets received",
			s.packetsReceived.toLocaleString(),
			"📦"
		],
		[
			"Packets processed",
			s.packetsProcessed.toLocaleString(),
			"✅"
		],
		[
			"Packets rejected",
			s.packetsRejected.toLocaleString(),
			"❌"
		],
		[
			"Packets/sec",
			String(s.packetsPerSecond),
			"⚡"
		],
		[
			"Malformed packets",
			s.malformedPacketCount.toLocaleString(),
			"⚠️"
		],
		[
			"Validation errors",
			s.validationErrorCount.toLocaleString(),
			"🔍"
		],
		[
			"ECG samples",
			s.ecgSamples.toLocaleString(),
			"📈"
		],
		[
			"PPG samples",
			s.ppgSamples.toLocaleString(),
			"🔴"
		],
		[
			"BPM updates",
			s.bpmUpdates.toLocaleString(),
			"💓"
		],
		[
			"SpO₂ updates",
			s.spo2Updates.toLocaleString(),
			"🩸"
		],
		[
			"ECG sample rate",
			`${s.ecgSampleRate} Hz`,
			"📡"
		],
		[
			"PPG sample rate",
			`${s.ppgSampleRate} Hz`,
			"📡"
		],
		[
			"Inter-packet latency",
			s.latencyMs === null ? "——" : `${s.latencyMs} ms`,
			"⏱"
		],
		[
			"Last packet",
			s.lastPacketTime ? new Date(s.lastPacketTime).toLocaleTimeString() : "——",
			"🕐"
		]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 animate-fade-in",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3 mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl",
						children: "🛠"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-semibold text-foreground",
						children: "Diagnostics"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: "Live pipeline statistics from the ESP32 data stream."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
					children: stats.map(([label, value, icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-background p-3.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dt", {
							className: "flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm leading-none",
								children: icon
							}), label]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-2 font-mono text-lg font-bold tabular-nums",
							children: value
						})]
					}, label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineFlow, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardwareTest, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RawConsole, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedicalDisclaimer, {})
		]
	});
}
var SplitComponent = Diagnostics;
//#endregion
export { SplitComponent as component };
