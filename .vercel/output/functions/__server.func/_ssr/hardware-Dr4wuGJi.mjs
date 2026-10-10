import { i as useSensorStore } from "./sensorStore-Nqe95hp0.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as StatusPill } from "./StatusPill-OiRdFKlR.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as MedicalDisclaimer } from "./MedicalDisclaimer-CHFhVfSO.mjs";
import { t as HardwareTest } from "./HardwareTest-FEysSk3q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hardware-Dr4wuGJi.js
var import_jsx_runtime = require_jsx_runtime();
function ConnectionWizard() {
	const s = useSensorStore();
	const steps = [
		[s.settings.transportType === "serial" ? "Choose USB Serial" : "Choose Wi-Fi WebSocket", true],
		["Connect ESP32", s.connectionState === "CONNECTED"],
		["Detect incoming data", s.packetsReceived > 0],
		["Validate packets", s.packetsProcessed > 0],
		["Detect ECG", s.ecgSamples > 0],
		["Detect PPG", s.ppgSamples > 0 || s.ppgRedCurrent !== null],
		["Start monitoring", s.packetsProcessed > 0 && (s.ecgSamples > 0 || s.ppgSamples > 0)]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Device connection wizard",
		className: "rounded-xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Device connection wizard"
			}), s.connectionState !== "CONNECTED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				onClick: () => void s.connect(),
				children: "Connect ESP32"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-3 space-y-2",
			children: steps.map(([label, done], index) => {
				const tone = done ? "ok" : "idle";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mr-2 font-mono text-xs text-muted-foreground",
							children: ["STEP ", index + 1]
						}), label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
						tone,
						children: done ? "DONE" : "WAITING"
					})]
				}, label);
			})
		})]
	});
}
var MAX_PINS = [
	[
		"VIN",
		"3.3V",
		"Power supply"
	],
	[
		"GND",
		"GND",
		"Ground"
	],
	[
		"SDA",
		"GPIO 21",
		"I²C data"
	],
	[
		"SCL",
		"GPIO 22",
		"I²C clock"
	]
];
function HardwareSetup() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 animate-fade-in",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3 mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl",
						children: "🔌"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-semibold text-foreground",
						children: "Hardware Setup"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-sm text-muted-foreground",
						children: [
							"Reference firmware:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-primary underline decoration-primary/40 hover:decoration-primary transition-colors",
								href: "https://github.com/AikyaNova-Pvt-Ltd/Aikyanova_Labs_Embedded_Systems",
								target: "_blank",
								rel: "noreferrer",
								children: "AikyaNova Labs Embedded Systems"
							}),
							". This dashboard reads whatever those sketches print over USB serial at 115200 baud."
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "overflow-auto rounded-xl border border-border bg-background p-4 font-mono text-xs text-muted-foreground leading-relaxed",
					children: `PHYSICAL SENSOR (AD8232 / MAX30102)
   → ESP32 (acquisition + BPM/SpO₂ processing)
   → USB Serial @ 115200 baud
   → Browser (Web Serial API)
   → Parser → Validator → Sensor Store → Real-time Dashboard`
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 text-sm font-semibold text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-base",
							children: "🔴"
						}), " MAX30102 → ESP32 Pin Mapping"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 overflow-auto rounded-xl border border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left font-mono text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-muted/60",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
									"MAX30102",
									"ESP32",
									"Notes"
								].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
									children: h
								}, h)) })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: MAX_PINS.map(([a, b, c]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border hover:bg-accent/40 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 font-semibold text-primary",
										children: a
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-foreground",
										children: b
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-muted-foreground",
										children: c
									})
								]
							}, a)) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: "I²C runs at 400 kHz (I2C_SPEED_FAST) in the reference sketches. Raw values stream at roughly 50 Hz."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "flex items-center gap-2 text-sm font-semibold text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-base",
						children: "📈"
					}), " AD8232 ECG → ESP32"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted-foreground leading-relaxed",
					children: [
						"The reference repository currently documents the MAX30102 wiring only; it does not publish an AD8232 pinout. Pin assignments are therefore not shown here to avoid inventing them — use the analog output pin and lead-off pins defined in your own AD8232 sketch, and make the firmware print the sample as",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground",
							children: "ECG:<value>"
						}),
						" ",
						"or as a CSV row so this dashboard can parse it."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "flex items-center gap-2 text-sm font-semibold text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-base",
							children: "📡"
						}), " Serial Formats Supported"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-4 overflow-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed",
						children: `Max3010x_Raw_Values.ino   IR=52341\tRED=48213
Max3010x_BPM.ino          Signal:120, Threshold:80, BeatMarker:0
Max3010x_SpO2.ino         IR_Signal:120, Threshold:80, Beat:0, BPM:38, SpO2:49
JSON                      {"timestamp":123456,"ecg":2048,"ppgIR":52341,"ppgRed":48213,"bpm":76,"spo2":98}
CSV                       123456,2048,52341,48213,76,98`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: [
							"The SpO₂ sketch prints",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "rounded bg-muted px-1 font-mono text-xs",
								children: "BPM"
							}),
							" and",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "rounded bg-muted px-1 font-mono text-xs",
								children: "SpO₂"
							}),
							" divided by 2 for the Arduino Serial Plotter. The parser multiplies them back by 2; adjust in Settings if your firmware prints true values."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionWizard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardwareTest, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedicalDisclaimer, {})
		]
	});
}
var SplitComponent = HardwareSetup;
//#endregion
export { SplitComponent as component };
