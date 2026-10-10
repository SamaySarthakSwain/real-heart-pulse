import { i as useSensorStore } from "./sensorStore-Nqe95hp0.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as StatusPill } from "./StatusPill-OiRdFKlR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PipelineFlow-BK8pUGKG.js
var import_jsx_runtime = require_jsx_runtime();
function PipelineFlow() {
	const s = useSensorStore();
	const connected = s.connectionState === "CONNECTED";
	const receiving = connected && s.packetsReceived > 0;
	const parsing = s.packetsProcessed > 0;
	const validating = s.packetsProcessed > 0;
	const stored = s.lastValidPacket !== null;
	const stage = (label, icon, ok, errored = false) => [
		label,
		icon,
		errored ? "ERROR" : ok ? "ACTIVE" : "WAITING",
		errored ? "error" : ok ? "ok" : "idle"
	];
	const stages = [
		stage("ESP32", "🔧", connected, s.connectionState === "ERROR"),
		stage(s.transportType === "serial" ? "Serial" : "WebSocket", "📡", receiving),
		stage("Parser", "🔍", parsing, s.malformedPacketCount > 0 && !parsing),
		stage("Validator", "✅", validating, s.packetsRejected > 0 && !validating),
		stage("Sensor Store", "💾", stored),
		stage("Dashboard", "📊", stored)
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Live data flow",
		className: "rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "flex items-center gap-2 text-sm font-semibold text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-base",
				children: "🔄"
			}), " Live Data Flow"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
			children: stages.map(([label, icon, text, tone], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("flex items-center justify-between rounded-xl border px-4 py-3", "transition-all duration-300 hover:shadow-sm", tone === "ok" ? "border-status-ok/25 bg-status-ok/5" : tone === "error" ? "border-destructive/25 bg-destructive/5" : "border-border bg-background"),
				style: { animationDelay: `${i * 60}ms` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2 text-sm font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-base leading-none",
						children: icon
					}), label]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
					tone,
					children: text
				})]
			}, label))
		})]
	});
}
//#endregion
export { PipelineFlow as t };
