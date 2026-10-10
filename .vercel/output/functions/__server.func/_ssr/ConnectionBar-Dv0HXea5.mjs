import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as useSensorStore, n as isWebSerialSupported } from "./sensorStore-Nqe95hp0.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as StatusPill } from "./StatusPill-OiRdFKlR.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ConnectionBar-Dv0HXea5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useAge(time) {
	const [, tick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => tick((n) => n + 1), 250);
		return () => window.clearInterval(id);
	}, []);
	return time === null ? null : Date.now() - time;
}
function SignalBars({ active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-end gap-[3px] h-5",
		"aria-hidden": true,
		children: [
			3,
			5,
			7,
			9
		].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			style: {
				height: `${h * 2}px`,
				transitionDelay: `${i * 60}ms`
			},
			className: cn("w-1.5 rounded-sm transition-all duration-500", active ? "bg-status-ok" : i === 0 ? "bg-muted-foreground/40" : "bg-muted-foreground/15")
		}, i))
	});
}
function ConnectionBar() {
	const state = useSensorStore();
	const age = useAge(state.lastPacketTime);
	const [supported, setSupported] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => setSupported(isWebSerialSupported()), []);
	const connected = state.connectionState === "CONNECTED";
	const receiving = connected && state.dataState === "RECEIVING" && (age ?? 9999) < 2e3;
	const linkTone = state.connectionState === "CONNECTED" ? "ok" : state.connectionState === "ERROR" ? "error" : "idle";
	const dataTone = receiving ? "ok" : connected ? "warn" : "idle";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Connection status",
		className: cn("rounded-2xl border p-5 transition-all duration-300", "bg-card hover:shadow-lg", connected && receiving && "border-status-ok/25 shadow-status-ok/5", !connected && "border-border"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-x-6 gap-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalBars, { active: receiving }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-1",
								children: "ESP32 Link"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
								tone: linkTone,
								children: state.connectionState
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-1",
							children: "Sensor Data"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
							tone: dataTone,
							children: state.connectionState !== "CONNECTED" ? "NOT RECEIVING" : receiving ? "RECEIVING DATA" : "NO DATA"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "grid grid-cols-2 gap-x-5 gap-y-1.5 sm:grid-cols-4 font-mono text-xs",
							children: [
								["Transport", state.transportType === "serial" ? "USB Serial" : "Wi-Fi WS"],
								["Baud", state.settings.baudRate.toLocaleString()],
								["Packets", state.packetsReceived.toLocaleString()],
								["Last pkt", age === null ? "never" : `${age} ms ago`]
							].map(([dt, dd]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground text-[10px] tracking-wide uppercase",
								children: dt
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-foreground font-medium mt-0.5",
								children: dd
							})] }, String(dt)))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [!connected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-10 rounded-xl border border-input bg-background px-3 text-sm transition-colors hover:border-ring focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30",
						value: state.settings.transportType,
						onChange: (e) => state.setSettings({ transportType: e.target.value }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "serial",
							children: "USB Serial"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "websocket",
							children: "Wi-Fi WS"
						})]
					}), connected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "destructive",
						className: "rounded-xl font-semibold shadow-sm hover:shadow-md transition-all",
						onClick: () => void state.disconnect(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							className: "mr-2 h-4 w-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								strokeLinecap: "round",
								strokeLinejoin: "round",
								d: "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
							})
						}), "Disconnect"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => void state.connect(),
						disabled: state.connectionState === "CONNECTING",
						className: "rounded-xl font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105",
						children: state.connectionState === "CONNECTING" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							className: "mr-2 h-4 w-4 animate-spin-slow",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								strokeLinecap: "round",
								d: "M12 3a9 9 0 1 0 9 9"
							})
						}), "Connecting…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							className: "mr-2 h-4 w-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								strokeLinecap: "round",
								strokeLinejoin: "round",
								d: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
							})
						}), "Connect ESP32"] })
					})]
				})]
			}),
			!supported && state.settings.transportType === "serial" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-3.5 text-sm text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					className: "mt-0.5 h-4 w-4 flex-shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						strokeLinecap: "round",
						strokeLinejoin: "round",
						d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
					})
				}), "Web Serial is not supported by this browser. Please use Chrome or Edge on desktop."]
			}),
			state.lastError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-3.5 font-mono text-xs text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					className: "mt-0.5 h-4 w-4 flex-shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						strokeLinecap: "round",
						strokeLinejoin: "round",
						d: "M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
					})
				}), state.lastError]
			}),
			connected && state.packetsReceived === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-start gap-3 rounded-xl border border-status-warn/30 bg-status-warn/8 p-3.5 text-sm text-status-warn",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					className: "mt-0.5 h-4 w-4 flex-shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						strokeLinecap: "round",
						strokeLinejoin: "round",
						d: "M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
					})
				}), "ESP32 connected, but no valid sensor packets received. Check baud rate and firmware output."]
			})
		]
	});
}
//#endregion
export { ConnectionBar as t };
