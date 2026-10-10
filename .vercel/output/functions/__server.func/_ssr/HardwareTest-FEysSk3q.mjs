import { i as useSensorStore } from "./sensorStore-Nqe95hp0.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as StatusPill } from "./StatusPill-OiRdFKlR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/HardwareTest-FEysSk3q.js
var import_jsx_runtime = require_jsx_runtime();
function HardwareTest() {
	const s = useSensorStore();
	const checks = [
		[
			"ESP32",
			s.connectionState === "CONNECTED",
			s.connectionState === "ERROR"
		],
		[
			"Serial",
			s.connectionState === "CONNECTED" && s.transportType === "serial",
			false
		],
		[
			"Packets",
			s.packetsReceived > 0,
			false
		],
		[
			"Parsing",
			s.packetsProcessed > 0,
			s.packetsReceived > 0 && s.packetsProcessed === 0
		],
		[
			"ECG",
			s.ecgSamples > 0,
			false
		],
		[
			"PPG IR",
			s.ppgIRCurrent !== null,
			false
		],
		[
			"PPG RED",
			s.ppgRedCurrent !== null,
			false
		],
		[
			"BPM",
			s.bpmUpdates > 0,
			false
		],
		[
			"SpO2",
			s.spo2Updates > 0,
			false
		],
		[
			"LM35 temp",
			s.temperatureUpdates > 0,
			false
		],
		[
			"BMI323 IMU",
			s.imuUpdates > 0,
			false
		]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Hardware connection test",
		className: "rounded-xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Test hardware connection"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "A check only passes once real data of that kind has actually arrived from the ESP32."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1.5 font-mono text-sm",
				children: checks.map(([label, pass, failed]) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": true,
								className: "flex-1 border-b border-dotted border-border"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
								tone: failed ? "error" : pass ? "ok" : "idle",
								children: failed ? "FAIL" : pass ? "PASS" : "WAITING"
							})
						]
					}, label);
				})
			})
		]
	});
}
//#endregion
export { HardwareTest as t };
