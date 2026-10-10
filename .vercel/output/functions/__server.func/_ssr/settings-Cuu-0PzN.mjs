import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as useSensorStore } from "./sensorStore-Nqe95hp0.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Root } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as MedicalDisclaimer } from "./MedicalDisclaimer-CHFhVfSO.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-Cuu-0PzN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var BAUD_RATES = [
	9600,
	19200,
	38400,
	57600,
	115200,
	230400,
	921600
];
function SettingGroup({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-1.5",
		children
	});
}
function SettingsPage() {
	const settings = useSensorStore((s) => s.settings);
	const setSettings = useSensorStore((s) => s.setSettings);
	const connected = useSensorStore((s) => s.connectionState === "CONNECTED");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 animate-fade-in",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl border bg-card p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl",
					children: "⚙️"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-semibold text-foreground",
					children: "Settings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: "Disconnect the ESP32 before changing transport or baud rate."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-5 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "transport",
						className: "text-xs font-semibold tracking-wide uppercase text-muted-foreground",
						children: "Communication method"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "transport",
						className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors hover:border-ring focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30",
						value: settings.transportType,
						disabled: connected,
						onChange: (e) => setSettings({ transportType: e.target.value }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "serial",
							children: "USB Serial (default)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "websocket",
							children: "Wi-Fi WebSocket"
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "baud",
						className: "text-xs font-semibold tracking-wide uppercase text-muted-foreground",
						children: "Baud rate"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						id: "baud",
						className: "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors hover:border-ring focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30",
						value: settings.baudRate,
						disabled: connected,
						onChange: (e) => setSettings({ baudRate: Number(e.target.value) }),
						children: BAUD_RATES.map((rate) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: rate,
							children: [rate.toLocaleString(), " baud"]
						}, rate))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ws",
						className: "text-xs font-semibold tracking-wide uppercase text-muted-foreground",
						children: "ESP32 WebSocket URL"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ws",
						placeholder: "ws://192.168.1.50:81",
						value: settings.websocketUrl,
						onChange: (e) => setSettings({ websocketUrl: e.target.value }),
						className: "rounded-xl"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "window",
						className: "text-xs font-semibold tracking-wide uppercase text-muted-foreground",
						children: "Graph time window (seconds)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "window",
						type: "number",
						min: 2,
						max: 30,
						value: settings.timeWindowSeconds,
						onChange: (e) => setSettings({ timeWindowSeconds: Math.max(2, Number(e.target.value) || 6) }),
						className: "rounded-xl"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ecgbuf",
						className: "text-xs font-semibold tracking-wide uppercase text-muted-foreground",
						children: "ECG buffer size (samples)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ecgbuf",
						type: "number",
						min: 500,
						step: 500,
						value: settings.ecgBufferSize,
						onChange: (e) => setSettings({ ecgBufferSize: Math.max(500, Number(e.target.value) || 5e3) }),
						className: "rounded-xl"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "ppgbuf",
						className: "text-xs font-semibold tracking-wide uppercase text-muted-foreground",
						children: "PPG buffer size (samples)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "ppgbuf",
						type: "number",
						min: 500,
						step: 500,
						value: settings.ppgBufferSize,
						onChange: (e) => setSettings({ ppgBufferSize: Math.max(500, Number(e.target.value) || 2500) }),
						className: "rounded-xl"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingGroup, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "bpmscale",
							className: "text-xs font-semibold tracking-wide uppercase text-muted-foreground",
							children: "BPM plotter scale factor"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "bpmscale",
							type: "number",
							min: 1,
							step: 1,
							value: settings.parser.plotterScaleBpm,
							onChange: (e) => setSettings({ parser: {
								...settings.parser,
								plotterScaleBpm: Number(e.target.value) || 1
							} }),
							className: "rounded-xl"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "The reference SpO₂ sketch prints BPM/2 for the Serial Plotter. Use 1 if your firmware prints true BPM."
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "spo2scale",
						className: "text-xs font-semibold tracking-wide uppercase text-muted-foreground",
						children: "SpO₂ plotter scale factor"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "spo2scale",
						type: "number",
						min: 1,
						step: 1,
						value: settings.parser.plotterScaleSpo2,
						onChange: (e) => setSettings({ parser: {
							...settings.parser,
							plotterScaleSpo2: Number(e.target.value) || 1
						} }),
						className: "rounded-xl"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:bg-accent/50 md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "rawlog",
							className: "text-sm font-medium",
							children: "Raw serial console diagnostics"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: "Shows raw bytes from the serial port in the Diagnostics tab"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "rawlog",
							checked: settings.rawConsoleEnabled,
							onCheckedChange: (checked) => setSettings({ rawConsoleEnabled: checked })
						})]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedicalDisclaimer, {})]
	});
}
var SplitComponent = SettingsPage;
//#endregion
export { SplitComponent as component };
