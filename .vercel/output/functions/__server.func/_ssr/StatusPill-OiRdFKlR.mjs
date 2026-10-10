import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatusPill-OiRdFKlR.js
var import_jsx_runtime = require_jsx_runtime();
var tones = {
	ok: {
		pill: "border-status-ok/35 bg-status-ok/10 text-status-ok",
		dot: "bg-status-ok",
		pulse: true
	},
	warn: {
		pill: "border-status-warn/35 bg-status-warn/10 text-status-warn",
		dot: "bg-status-warn",
		pulse: false
	},
	error: {
		pill: "border-destructive/45 bg-destructive/10 text-destructive",
		dot: "bg-destructive",
		pulse: false
	},
	idle: {
		pill: "border-border bg-muted/60 text-muted-foreground",
		dot: "bg-muted-foreground/60",
		pulse: false
	}
};
function StatusPill({ tone, children, className }) {
	const { pill, dot, pulse } = tones[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1", "font-mono text-[10px] font-semibold tracking-widest uppercase", "transition-colors duration-300", pill, className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: cn("size-1.5 rounded-full flex-shrink-0", dot, pulse && "animate-pulse-dot")
		}), children]
	});
}
//#endregion
export { StatusPill as t };
