import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as useSensorStore, t as buffers } from "./sensorStore-Nqe95hp0.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as StatusPill } from "./StatusPill-OiRdFKlR.mjs";
import { t as ConnectionBar } from "./ConnectionBar-Dv0HXea5.mjs";
import { t as MedicalDisclaimer } from "./MedicalDisclaimer-CHFhVfSO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analysis-BTlrIntR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function stats(values) {
	const clean = values.filter((v) => Number.isFinite(v));
	if (clean.length === 0) return {
		mean: null,
		min: null,
		max: null,
		sd: null,
		count: 0
	};
	const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
	const variance = clean.reduce((a, b) => a + (b - mean) ** 2, 0) / clean.length;
	return {
		mean,
		min: Math.min(...clean),
		max: Math.max(...clean),
		sd: Math.sqrt(variance),
		count: clean.length
	};
}
function median(values) {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 1) return sorted[mid];
	return (sorted[mid - 1] + sorted[mid]) / 2;
}
var EMPTY_ECG = {
	sampleCount: 0,
	samplingHz: null,
	beatCount: 0,
	heartRate: null,
	sdnn: null,
	rmssd: null,
	pnn50: null,
	irregularity: null,
	qrsAmplitude: null,
	qrsDuration: null,
	stDeviation: null
};
/**
* Pan-Tompkins-style R peak detection, simplified for the AD8232 analog stream:
* derivative -> squaring -> moving-window integration -> adaptive threshold.
*/
function extractEcgFeatures(values, times) {
	const n = values.length;
	if (n < 200 || times.length !== n) return {
		...EMPTY_ECG,
		sampleCount: n
	};
	const durationMs = times[n - 1] - times[0];
	if (!(durationMs > 1e3)) return {
		...EMPTY_ECG,
		sampleCount: n
	};
	const fs = (n - 1) / durationMs * 1e3;
	const squared = new Float64Array(n);
	for (let i = 2; i < n - 2; i++) {
		const d = (2 * values[i + 2] + values[i + 1] - values[i - 1] - 2 * values[i - 2]) / 8;
		squared[i] = d * d;
	}
	const win = Math.max(3, Math.round(fs * .12));
	const integrated = new Float64Array(n);
	let running = 0;
	for (let i = 0; i < n; i++) {
		running += squared[i];
		if (i >= win) running -= squared[i - win];
		integrated[i] = running / Math.min(i + 1, win);
	}
	let sum = 0;
	let peak = 0;
	for (let i = 0; i < n; i++) {
		sum += integrated[i];
		if (integrated[i] > peak) peak = integrated[i];
	}
	const mean = sum / n;
	const threshold = mean + .35 * (peak - mean);
	if (!(threshold > 0)) return {
		...EMPTY_ECG,
		sampleCount: n,
		samplingHz: fs
	};
	const refractory = Math.max(1, Math.round(fs * .2));
	const peaks = [];
	let i = 1;
	while (i < n - 1) if (integrated[i] > threshold) {
		let best = i;
		let j = i;
		while (j < n && integrated[j] > threshold) {
			if (integrated[j] > integrated[best]) best = j;
			j++;
		}
		const span = Math.max(2, Math.round(fs * .06));
		let apex = best;
		for (let k = Math.max(0, best - span); k <= Math.min(n - 1, best + span); k++) if (values[k] > values[apex]) apex = k;
		if (peaks.length === 0 || apex - peaks[peaks.length - 1] > refractory) peaks.push(apex);
		i = j + refractory;
	} else i++;
	if (peaks.length < 3) return {
		...EMPTY_ECG,
		sampleCount: n,
		samplingHz: fs,
		beatCount: peaks.length
	};
	const rr = [];
	for (let k = 1; k < peaks.length; k++) {
		const dt = times[peaks[k]] - times[peaks[k - 1]];
		if (dt > 240 && dt < 3e3) rr.push(dt);
	}
	if (rr.length < 2) return {
		...EMPTY_ECG,
		sampleCount: n,
		samplingHz: fs,
		beatCount: peaks.length
	};
	const rrMean = rr.reduce((a, b) => a + b, 0) / rr.length;
	const sdnn = Math.sqrt(rr.reduce((a, b) => a + (b - rrMean) ** 2, 0) / rr.length);
	const diffs = rr.slice(1).map((v, idx) => v - rr[idx]);
	const rmssd = Math.sqrt(diffs.reduce((a, b) => a + b * b, 0) / diffs.length);
	const pnn50 = diffs.filter((d) => Math.abs(d) > 50).length / diffs.length;
	const rrMedian = median(rr);
	const irregularity = rr.filter((v) => Math.abs(v - rrMedian) / rrMedian > .2).length / rr.length;
	const amplitudes = [];
	const widths = [];
	const stLevels = [];
	const pqOffset = Math.round(fs * .06);
	const stOffset = Math.round(fs * .08);
	for (const p of peaks) {
		const from = Math.max(0, p - Math.round(fs * .1));
		const to = Math.min(n - 1, p + Math.round(fs * .1));
		let low = values[from];
		for (let k = from; k <= to; k++) if (values[k] < low) low = values[k];
		const amp = values[p] - low;
		if (amp > 0) amplitudes.push(amp);
		const cut = low + .25 * amp;
		let left = p;
		while (left > from && values[left] > cut) left--;
		let right = p;
		while (right < to && values[right] > cut) right++;
		widths.push((right - left) / fs * 1e3);
		const baselineIndex = p - pqOffset;
		const stIndex = p + stOffset;
		if (baselineIndex >= 0 && stIndex < n && amp > 0) stLevels.push((values[stIndex] - values[baselineIndex]) / amp);
	}
	const ampStats = stats(amplitudes);
	const widthStats = stats(widths);
	const stStats = stats(stLevels);
	return {
		sampleCount: n,
		samplingHz: fs,
		beatCount: peaks.length,
		heartRate: 6e4 / rrMean,
		sdnn,
		rmssd,
		pnn50,
		irregularity,
		qrsAmplitude: ampStats.mean,
		qrsDuration: widthStats.mean,
		stDeviation: stStats.mean
	};
}
var sigmoid = (z) => 1 / (1 + Math.exp(-z));
function band(p) {
	if (p < 15) return "low";
	if (p < 35) return "moderate";
	if (p < 60) return "elevated";
	return "high";
}
function score(intercept, terms) {
	let z = intercept;
	const contributions = [];
	const missing = [];
	for (const term of terms) {
		if (term.value === null || !Number.isFinite(term.value)) {
			missing.push(term.label);
			continue;
		}
		const raw = (term.value - term.reference) * term.weight;
		const clipped = Math.max(-term.clip, Math.min(term.clip, raw));
		z += clipped;
		if (Math.abs(clipped) > .05) contributions.push({
			label: term.label,
			value: term.format(term.value),
			weight: Math.abs(clipped),
			direction: clipped > 0 ? "raises" : "lowers"
		});
	}
	contributions.sort((a, b) => b.weight - a.weight);
	return {
		probability: sigmoid(z) * 100,
		contributions,
		missing
	};
}
var f1 = (v) => v.toFixed(1);
var f0 = (v) => v.toFixed(0);
function analyseRisk(input) {
	const ecg = extractEcgFeatures(input.ecgValues, input.ecgTimes);
	const bpm = stats(input.bpmValues);
	const spo2 = stats(input.spo2Values);
	const temperature = stats(input.temperatureValues);
	const motion = stats(input.motionValues);
	const windowSeconds = input.ecgTimes.length > 1 ? (input.ecgTimes[input.ecgTimes.length - 1] - input.ecgTimes[0]) / 1e3 : 0;
	const restingLikely = motion.sd !== null ? motion.sd < .08 : false;
	const heartRate = ecg.heartRate ?? bpm.mean;
	const hasEcg = ecg.beatCount >= 3 && windowSeconds >= 8;
	const hasVitals = spo2.count > 0 || bpm.count > 0;
	const hasEnoughData = hasEcg || hasVitals;
	const reason = hasEnoughData ? null : windowSeconds === 0 ? "No ECG samples have been received from the ESP32 yet." : "Not enough clean beats detected yet — keep the electrodes still for at least 10 seconds.";
	let confidence = 0;
	if (hasEcg) confidence += Math.min(45, windowSeconds / 30 * 45);
	if (ecg.beatCount >= 10) confidence += 10;
	if (spo2.count > 0) confidence += 15;
	if (bpm.count > 0) confidence += 10;
	if (temperature.count > 0) confidence += 10;
	if (motion.count > 0) confidence += 10;
	if (!restingLikely && motion.count > 0) confidence *= .75;
	confidence = Math.round(Math.max(0, Math.min(100, confidence)));
	const conditions = [];
	conditions.push({
		id: "ischemia",
		name: "Myocardial ischemia",
		...score(-2.6, [
			{
				label: "ST deviation (fraction of R amplitude)",
				value: ecg.stDeviation === null ? null : Math.abs(ecg.stDeviation),
				format: (v) => `${(v * 100).toFixed(1)}%`,
				weight: 22,
				reference: .05,
				clip: 2.5
			},
			{
				label: "Resting heart rate",
				value: restingLikely ? heartRate : null,
				format: (v) => `${f0(v)} bpm`,
				weight: .035,
				reference: 75,
				clip: 1.2
			},
			{
				label: "SpO₂",
				value: spo2.mean,
				format: (v) => `${f1(v)} %`,
				weight: -.22,
				reference: 96,
				clip: 1.5
			},
			{
				label: "HRV (RMSSD)",
				value: ecg.rmssd,
				format: (v) => `${f0(v)} ms`,
				weight: -.02,
				reference: 30,
				clip: 1
			}
		]),
		band: "low"
	});
	conditions.push({
		id: "amyloidosis",
		name: "Cardiac amyloidosis pattern",
		...score(-3, [
			{
				label: "QRS amplitude (low voltage)",
				value: ecg.qrsAmplitude,
				format: (v) => `${f0(v)} ADC counts`,
				weight: -.006,
				reference: 500,
				clip: 2.2
			},
			{
				label: "HRV (SDNN)",
				value: ecg.sdnn,
				format: (v) => `${f0(v)} ms`,
				weight: -.025,
				reference: 50,
				clip: 1.2
			},
			{
				label: "Resting heart rate",
				value: restingLikely ? heartRate : null,
				format: (v) => `${f0(v)} bpm`,
				weight: .03,
				reference: 80,
				clip: 1
			}
		]),
		band: "low"
	});
	conditions.push({
		id: "fibrosis",
		name: "Cardiac fibrosis / conduction delay",
		...score(-2.8, [
			{
				label: "QRS duration",
				value: ecg.qrsDuration,
				format: (v) => `${f0(v)} ms`,
				weight: .05,
				reference: 100,
				clip: 2.5
			},
			{
				label: "Beat-to-beat irregularity",
				value: ecg.irregularity,
				format: (v) => `${(v * 100).toFixed(0)} % of beats`,
				weight: 4,
				reference: .05,
				clip: 1.8
			},
			{
				label: "HRV (SDNN)",
				value: ecg.sdnn,
				format: (v) => `${f0(v)} ms`,
				weight: -.015,
				reference: 50,
				clip: .9
			}
		]),
		band: "low"
	});
	conditions.push({
		id: "arrhythmia",
		name: "Arrhythmia burden",
		...score(-3.2, [
			{
				label: "Beat-to-beat irregularity",
				value: ecg.irregularity,
				format: (v) => `${(v * 100).toFixed(0)} % of beats`,
				weight: 7,
				reference: .05,
				clip: 2.8
			},
			{
				label: "pNN50",
				value: ecg.pnn50,
				format: (v) => `${(v * 100).toFixed(0)} %`,
				weight: 2.5,
				reference: .3,
				clip: 1.2
			},
			{
				label: "Heart rate",
				value: heartRate,
				format: (v) => `${f0(v)} bpm`,
				weight: .02,
				reference: 90,
				clip: 1
			}
		]),
		band: "low"
	});
	conditions.push({
		id: "heartFailure",
		name: "Heart failure / decompensation",
		...score(-3.1, [
			{
				label: "Resting heart rate",
				value: restingLikely ? heartRate : null,
				format: (v) => `${f0(v)} bpm`,
				weight: .05,
				reference: 80,
				clip: 2
			},
			{
				label: "SpO₂",
				value: spo2.mean,
				format: (v) => `${f1(v)} %`,
				weight: -.3,
				reference: 95,
				clip: 2.2
			},
			{
				label: "HRV (RMSSD)",
				value: ecg.rmssd,
				format: (v) => `${f0(v)} ms`,
				weight: -.03,
				reference: 30,
				clip: 1.2
			},
			{
				label: "Body temperature",
				value: temperature.mean,
				format: (v) => `${f1(v)} °C`,
				weight: .35,
				reference: 37,
				clip: .8
			},
			{
				label: "QRS duration",
				value: ecg.qrsDuration,
				format: (v) => `${f0(v)} ms`,
				weight: .02,
				reference: 100,
				clip: 1
			}
		]),
		band: "low"
	});
	for (const condition of conditions) condition.band = band(condition.probability);
	conditions.sort((a, b) => b.probability - a.probability);
	return {
		hasEnoughData,
		reason,
		confidence,
		windowSeconds,
		ecg,
		bpm,
		spo2,
		temperature,
		motion,
		restingLikely,
		conditions
	};
}
var bandTone = {
	low: "ok",
	moderate: "warn",
	elevated: "warn",
	high: "error"
};
var barColor = {
	low: "bg-status-ok",
	moderate: "bg-status-warn",
	elevated: "bg-status-warn",
	high: "bg-destructive"
};
function num(value, digits = 0, unit = "") {
	return value === null || !Number.isFinite(value) ? "--" : `${value.toFixed(digits)}${unit}`;
}
function RiskPanel() {
	const connectionState = useSensorStore((s) => s.connectionState);
	const ecgSamples = useSensorStore((s) => s.ecgSamples);
	const [tick, setTick] = (0, import_react.useState)(0);
	const [dlAnalysis, setDlAnalysis] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(async () => {
			setTick((n) => n + 1);
			const ecgValues = buffers.ecg.toArray();
			if (ecgValues.length > 500) {
				let padded = ecgValues.slice(-1e3);
				if (padded.length < 1e3) padded = [...new Array(1e3 - padded.length).fill(0), ...padded];
				try {
					const res = await fetch("http://localhost:8000/predict/ecg", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ signals: [padded] })
					});
					if (res.ok) {
						const data = await res.json();
						setDlAnalysis(data);
					}
				} catch (e) {
					console.error("DL API Error:", e);
				}
			}
		}, 2e3);
		return () => window.clearInterval(id);
	}, []);
	const analysis = (0, import_react.useMemo)(() => analyseRisk({
		ecgValues: buffers.ecg.toArray(),
		ecgTimes: buffers.ecg.timeArray(),
		bpmValues: buffers.bpm.toArray(),
		spo2Values: buffers.spo2.toArray(),
		temperatureValues: buffers.temperature.toArray(),
		motionValues: buffers.motion.toArray()
	}), [tick, ecgSamples]);
	const { ecg } = analysis;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Heart disease risk estimation"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Computed live from real ECG, PPG, SpO₂, LM35 temperature and BMI323 motion data only."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
						tone: analysis.hasEnoughData ? "ok" : "idle",
						children: analysis.hasEnoughData ? `CONFIDENCE ${analysis.confidence}%` : "NO ANALYSIS"
					})]
				}), !analysis.hasEnoughData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 rounded-lg border border-border bg-background p-3 font-mono text-xs text-muted-foreground",
					children: connectionState === "CONNECTED" ? analysis.reason : "ESP32 disconnected — no physiological data to analyse."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6 mt-4",
					children: [dlAnalysis && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-primary/30 bg-primary/5 p-4 relative overflow-hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute top-0 right-0 p-2 opacity-20",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-4xl font-bold",
									children: "AI"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-bold text-primary tracking-widest uppercase mb-4",
								children: "PyTorch 1D-CNN (PTB-XL Model)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-6 flex items-center justify-between bg-background rounded-lg p-3 border border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-lg",
									children: dlAnalysis.primary_diagnosis
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StatusPill, {
									tone: "ok",
									children: [
										"CONFIDENCE ",
										(dlAnalysis.confidence * 100).toFixed(1),
										"%"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-3",
								children: dlAnalysis.detailed_analysis.sort((a, b) => b.probability - a.probability).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: c.description
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono tabular-nums",
										children: [(c.probability * 100).toFixed(1), "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `h-full rounded-full ${c.probability > .5 ? "bg-destructive" : "bg-primary"}`,
										style: { width: `${Math.min(100, c.probability * 100)}%` }
									})
								})] }, c.class))
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-4 border-t border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs font-semibold text-muted-foreground uppercase mb-3",
							children: "Local Heuristic Fallback"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-4",
							children: analysis.conditions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium",
										children: c.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-sm tabular-nums",
											children: [c.probability.toFixed(1), "%"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
											tone: bandTone[c.band],
											children: c.band.toUpperCase()
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `h-full rounded-full ${barColor[c.band]}`,
										style: { width: `${Math.min(100, c.probability)}%` }
									})
								}),
								c.contributions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground",
									children: c.contributions.slice(0, 3).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
										f.direction === "raises" ? "▲" : "▼",
										" ",
										f.label,
										": ",
										f.value
									] }, f.label))
								}),
								c.missing.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-[11px] text-muted-foreground",
									children: ["Not measured yet: ", c.missing.join(", ")]
								})
							] }, c.id))
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Extracted signal features (real measurements)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
					className: "mt-3 grid gap-x-6 gap-y-2 font-mono text-xs sm:grid-cols-2 lg:grid-cols-3",
					children: [
						["Analysis window", `${analysis.windowSeconds.toFixed(1)} s`],
						["ECG sampling", num(ecg.samplingHz, 0, " Hz")],
						["Detected beats", String(ecg.beatCount)],
						["ECG heart rate", num(ecg.heartRate, 0, " bpm")],
						["SDNN", num(ecg.sdnn, 0, " ms")],
						["RMSSD", num(ecg.rmssd, 0, " ms")],
						["pNN50", ecg.pnn50 === null ? "--" : `${(ecg.pnn50 * 100).toFixed(0)} %`],
						["RR irregularity", ecg.irregularity === null ? "--" : `${(ecg.irregularity * 100).toFixed(0)} %`],
						["QRS amplitude", num(ecg.qrsAmplitude, 0, " counts")],
						["QRS duration", num(ecg.qrsDuration, 0, " ms")],
						["ST deviation", ecg.stDeviation === null ? "--" : `${(ecg.stDeviation * 100).toFixed(1)} % of R`],
						["Mean SpO₂", num(analysis.spo2.mean, 1, " %")],
						["Mean BPM (firmware)", num(analysis.bpm.mean, 0, " bpm")],
						["Mean temperature", num(analysis.temperature.mean, 1, " °C")],
						["Motion (|a|)", num(analysis.motion.mean, 2, " g")],
						["Subject state", analysis.motion.count === 0 ? "--" : analysis.restingLikely ? "AT REST" : "MOVING"]
					].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between gap-3 border-b border-border/60 py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular-nums",
							children: value
						})]
					}, label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "How this estimate is produced"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "R peaks are detected with a Pan-Tompkins style pipeline (derivative → squaring → 120 ms integration → adaptive threshold) on the raw AD8232 stream." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Each condition uses an interpretable logistic model over those features. Weights come from published clinical thresholds — ST deviation for ischemia, QRS low voltage for amyloidosis, QRS widening and RR irregularity for fibrosis, resting tachycardia with desaturation for heart failure." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "A feature that has not been measured is reported as missing and simply left out of the score — it is never replaced by an assumed value." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Single-lead ECG plus PPG cannot diagnose these diseases. Treat every percentage as a screening signal for follow-up with a clinician, not a diagnosis." })
					]
				})]
			})
		]
	});
}
function Analysis() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "sr-only",
				children: "Heart disease risk analysis"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MedicalDisclaimer, {})
		]
	});
}
var SplitComponent = Analysis;
//#endregion
export { SplitComponent as component };
