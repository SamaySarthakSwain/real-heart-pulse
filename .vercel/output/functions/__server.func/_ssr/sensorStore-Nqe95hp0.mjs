import { n as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sensorStore-Nqe95hp0.js
/** Fixed-capacity ring buffer. Never grows beyond `capacity`. */
var RingBuffer = class {
	capacity;
	data;
	times;
	start = 0;
	length = 0;
	constructor(capacity) {
		this.capacity = capacity;
		this.data = new Float64Array(capacity);
		this.times = new Float64Array(capacity);
	}
	get size() {
		return this.length;
	}
	get max() {
		return this.capacity;
	}
	push(value, time) {
		const index = (this.start + this.length) % this.capacity;
		this.data[index] = value;
		this.times[index] = time;
		if (this.length < this.capacity) this.length += 1;
		else this.start = (this.start + 1) % this.capacity;
	}
	clear() {
		this.start = 0;
		this.length = 0;
	}
	resize(capacity) {
		const values = this.toArray();
		const times = this.timeArray();
		this.capacity = capacity;
		this.data = new Float64Array(capacity);
		this.times = new Float64Array(capacity);
		this.start = 0;
		this.length = 0;
		const from = Math.max(0, values.length - capacity);
		for (let i = from; i < values.length; i++) this.push(values[i], times[i]);
	}
	at(i) {
		return this.data[(this.start + i) % this.capacity];
	}
	timeAt(i) {
		return this.times[(this.start + i) % this.capacity];
	}
	last() {
		return this.length === 0 ? void 0 : this.at(this.length - 1);
	}
	toArray() {
		const out = new Array(this.length);
		for (let i = 0; i < this.length; i++) out[i] = this.at(i);
		return out;
	}
	timeArray() {
		const out = new Array(this.length);
		for (let i = 0; i < this.length; i++) out[i] = this.timeAt(i);
		return out;
	}
};
var DEFAULT_PARSER_OPTIONS = {
	plotterScaleBpm: 1,
	plotterScaleSpo2: 1,
	csvColumns: [
		"timestamp",
		"ecg",
		"ppgIR",
		"ppgRed",
		"bpm",
		"spo2"
	]
};
/** Firmware label / JSON key -> normalized SensorPacket field. */
var FIELD_ALIASES = {
	timestamp: "timestamp",
	time: "timestamp",
	ts: "timestamp",
	millis: "timestamp",
	ecg: "ecg",
	ecg_signal: "ecg",
	ad8232: "ecg",
	ir: "ppgIR",
	ir_signal: "ppgIR",
	irvalue: "ppgIR",
	ppgir: "ppgIR",
	red: "ppgRed",
	red_signal: "ppgRed",
	redvalue: "ppgRed",
	ppgred: "ppgRed",
	signal: "ppgWave",
	wave: "ppgWave",
	ppg: "ppgWave",
	bpm: "bpm",
	heartrate: "bpm",
	hr: "bpm",
	spo2: "spo2",
	sp02: "spo2",
	oxygen: "spo2",
	threshold: "threshold",
	thresh: "threshold",
	beat: "beat",
	beatmarker: "beat",
	quality: "signalQuality",
	signalquality: "signalQuality",
	leadoff: "ecgLeadOff",
	lo: "ecgLeadOff",
	temp: "temperature",
	temperature: "temperature",
	tempc: "temperature",
	lm35: "temperature",
	bodytemp: "temperature",
	bmi_temp: "temperature",
	bmi_temperature: "temperature",
	max30102_temp: "temperature",
	max30102_temperature: "temperature",
	ax: "accelX",
	accelx: "accelX",
	accx: "accelX",
	ay: "accelY",
	accely: "accelY",
	accy: "accelY",
	az: "accelZ",
	accelz: "accelZ",
	accz: "accelZ",
	bmi_ax: "accelX",
	bmi_ay: "accelY",
	bmi_az: "accelZ",
	gx: "gyroX",
	gyrox: "gyroX",
	gy: "gyroY",
	gyroy: "gyroY",
	gz: "gyroZ",
	gyroz: "gyroZ",
	bmi_gx: "gyroX",
	bmi_gy: "gyroY",
	bmi_gz: "gyroZ"
};
var normalizeKey = (key) => key.trim().toLowerCase().replace(/[\s-]+/g, "_").replace(/_+$/g, "");
function toNumber(value) {
	if (typeof value === "number") return Number.isFinite(value) ? value : void 0;
	if (typeof value !== "string") return void 0;
	const trimmed = value.trim();
	if (trimmed === "") return void 0;
	const n = Number(trimmed);
	return Number.isFinite(n) ? n : void 0;
}
function assign(packet, rawKey, rawValue, options) {
	const field = FIELD_ALIASES[normalizeKey(rawKey)];
	if (!field) return false;
	if (field === "beat") {
		const n = toNumber(rawValue);
		if (n === void 0) return false;
		packet.beat = n > 0;
		return true;
	}
	if (field === "ecgLeadOff") {
		const n = toNumber(rawValue);
		if (n === void 0) return false;
		packet.ecgLeadOff = n > 0;
		return true;
	}
	const n = toNumber(rawValue);
	if (n === void 0) return false;
	if (field === "bpm") packet.bpm = n * options.plotterScaleBpm;
	else if (field === "spo2") packet.spo2 = n * options.plotterScaleSpo2;
	else packet[field] = n;
	return true;
}
function hasData(packet) {
	return Object.keys(packet).length > 0;
}
function fail(raw, format, error) {
	return {
		raw,
		format,
		error
	};
}
/**
* Parse a single complete line coming from the ESP32.
* Returns a normalized packet, or an error for status text / malformed lines.
* Never fabricates a field that was not present in the line.
*/
function parseLine(line, options = DEFAULT_PARSER_OPTIONS) {
	const raw = line.replace(/\r/g, "").trim();
	if (raw === "") return fail(line, "unknown", "Empty line");
	if (raw.startsWith("{")) try {
		const obj = JSON.parse(raw);
		const packet = {};
		for (const [key, value] of Object.entries(obj)) assign(packet, key, value, options);
		if (!hasData(packet)) return fail(raw, "json", "No recognized sensor fields");
		return {
			raw,
			format: "json",
			packet
		};
	} catch {
		return fail(raw, "json", "Malformed JSON");
	}
	if (/[:=]/.test(raw)) {
		const tokens = raw.split(/[,;\t]+/);
		const packet = {};
		let recognized = 0;
		let pairs = 0;
		for (const token of tokens) {
			const match = token.match(/^\s*([A-Za-z_0-9 -]+)\s*[:=]\s*(-?[0-9.eE+]+)\s*$/);
			if (!match) continue;
			pairs += 1;
			if (assign(packet, match[1] ?? "", match[2] ?? "", options)) recognized += 1;
		}
		if (pairs === 0) return fail(raw, "unknown", "Status text, not a data packet");
		if (recognized === 0) return fail(raw, "labeled", "No recognized sensor fields");
		return {
			raw,
			format: raw.includes(":") ? "labeled" : "keyvalue",
			packet
		};
	}
	const parts = raw.split(",").map((p) => p.trim());
	if (parts.length > 1 && parts.every((p) => p !== "" && Number.isFinite(Number(p)))) {
		if (parts.length !== options.csvColumns.length) return fail(raw, "csv", `CSV column count ${parts.length} does not match configured layout (${options.csvColumns.join(",")})`);
		const packet = {};
		parts.forEach((value, index) => assign(packet, options.csvColumns[index] ?? "", value, options));
		if (!hasData(packet)) return fail(raw, "csv", "No recognized sensor fields");
		return {
			raw,
			format: "csv",
			packet
		};
	}
	return fail(raw, "unknown", "Unrecognized line (firmware status text?)");
}
/** Physiologically / electrically plausible ranges for the referenced hardware. */
var RANGES = {
	ecg: {
		min: 0,
		max: 4095
	},
	ppgIR: {
		min: 0,
		max: 524287
	},
	ppgRed: {
		min: 0,
		max: 524287
	},
	ppgWave: {
		min: -524287,
		max: 524287
	},
	bpm: {
		min: 20,
		max: 250
	},
	spo2: {
		min: 50,
		max: 100
	},
	signalQuality: {
		min: 0,
		max: 100
	},
	temperature: {
		min: 10,
		max: 60
	},
	accelX: {
		min: -16,
		max: 16
	},
	accelY: {
		min: -16,
		max: 16
	},
	accelZ: {
		min: -16,
		max: 16
	},
	gyroX: {
		min: -2e3,
		max: 2e3
	},
	gyroY: {
		min: -2e3,
		max: 2e3
	},
	gyroZ: {
		min: -2e3,
		max: 2e3
	}
};
/**
* Validates a parsed packet. Out-of-range numeric fields are dropped
* (never clamped into a plausible-looking fake value) and reported.
*/
function validatePacket(packet) {
	const errors = [];
	if (!packet || typeof packet !== "object") return {
		ok: false,
		errors: ["Packet is not an object"]
	};
	const clean = {};
	if (packet.timestamp !== void 0) {
		if (typeof packet.timestamp === "number" && Number.isFinite(packet.timestamp) && packet.timestamp >= 0) clean.timestamp = packet.timestamp;
		else errors.push("timestamp is not a finite non-negative number");
	}
	for (const field of Object.keys(RANGES)) {
		const value = packet[field];
		if (value === void 0) continue;
		if (typeof value !== "number" || !Number.isFinite(value)) {
			errors.push(`${field} is not a finite number`);
			continue;
		}
		const { min, max } = RANGES[field];
		if (value < min || value > max) {
			errors.push(`${field}=${value} is outside the plausible range ${min}..${max}`);
			continue;
		}
		clean[field] = value;
	}
	if (packet.beat !== void 0) {
		if (typeof packet.beat === "boolean") clean.beat = packet.beat;
		else errors.push("beat is not a boolean");
	}
	if (packet.ecgLeadOff !== void 0) {
		if (typeof packet.ecgLeadOff === "boolean") clean.ecgLeadOff = packet.ecgLeadOff;
		else errors.push("ecgLeadOff is not a boolean");
	}
	if (packet.threshold !== void 0) {
		if (typeof packet.threshold === "number" && Number.isFinite(packet.threshold)) clean.threshold = packet.threshold;
		else errors.push("threshold is not a finite number");
	}
	if (Object.keys(clean).filter((k) => k !== "timestamp").length === 0) return {
		ok: false,
		errors: errors.length ? errors : ["Packet contained no usable measurements"]
	};
	return {
		ok: true,
		packet: clean,
		errors
	};
}
function isWebSerialSupported() {
	return typeof navigator !== "undefined" && "serial" in navigator;
}
/**
* ESP32 -> USB -> browser transport.
* Handles chunked reads, partial packets, CR/LF, and disconnects.
* Emits complete text lines only; parsing happens downstream.
*/
var SerialTransport = class {
	events;
	options;
	type = "serial";
	port = null;
	reader = null;
	buffer = "";
	connected = false;
	closing = false;
	name = null;
	constructor(events, options) {
		this.events = events;
		this.options = options;
	}
	setOptions(options) {
		this.options = options;
	}
	isConnected() {
		return this.connected;
	}
	deviceName() {
		return this.name;
	}
	setState(state, detail) {
		this.events.onConnectionChange(state, detail);
	}
	async connect() {
		if (!isWebSerialSupported()) {
			this.setState("ERROR", "unsupported");
			this.events.onError("Web Serial is not supported by this browser. Please use a supported Chromium-based browser such as Google Chrome or Microsoft Edge on desktop.");
			return;
		}
		this.setState("CONNECTING");
		try {
			this.port = await navigator.serial.requestPort();
			await this.port.open({ baudRate: this.options.baudRate });
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			this.port = null;
			this.setState("ERROR", message);
			if (/No port selected/i.test(message)) this.events.onError("No serial port was selected. Click Connect ESP32 and pick the ESP32 COM port.");
			else if (/denied|permission/i.test(message)) this.events.onError("Serial permission denied. Allow access to the ESP32 port and try again.");
			else if (/open|busy|access/i.test(message)) this.events.onError(`Could not open the serial port: ${message}. Close the Arduino Serial Monitor or any other program using the port.`);
			else this.events.onError(`Serial connection failed: ${message}`);
			return;
		}
		this.connected = true;
		this.closing = false;
		this.buffer = "";
		const info = this.port?.getInfo?.();
		this.name = info?.usbVendorId ? `USB device ${info.usbVendorId.toString(16)}:${(info.usbProductId ?? 0).toString(16)}` : "Serial device";
		this.setState("CONNECTED", this.name);
		this.readLoop();
	}
	async readLoop() {
		const decoder = new TextDecoder();
		while (this.port?.readable && !this.closing) {
			this.reader = this.port.readable.getReader();
			try {
				while (true) {
					const { value, done } = await this.reader.read();
					if (done) break;
					if (!value) continue;
					this.buffer += decoder.decode(value, { stream: true });
					const lines = this.buffer.split(/\r?\n/);
					this.buffer = lines.pop() ?? "";
					if (this.buffer.length > 8192) this.buffer = "";
					for (const line of lines) {
						const trimmed = line.trim();
						if (trimmed !== "") this.events.onData(trimmed);
					}
				}
			} catch (error) {
				if (!this.closing) {
					const message = error instanceof Error ? error.message : String(error);
					this.events.onError(`Serial read error: ${message}`);
					this.setState("ERROR", message);
				}
				break;
			} finally {
				try {
					this.reader?.releaseLock();
				} catch {}
				this.reader = null;
			}
		}
		if (!this.closing) await this.teardown("ESP32 disconnected");
	}
	async teardown(reason) {
		this.connected = false;
		try {
			await this.port?.close();
		} catch {}
		this.port = null;
		this.name = null;
		this.setState("DISCONNECTED", reason);
	}
	async disconnect() {
		this.closing = true;
		try {
			await this.reader?.cancel();
		} catch {}
		await this.teardown("Disconnected by user");
	}
};
/**
* Future Wi-Fi path: ESP32 -> Wi-Fi -> WebSocket -> browser.
* Emits the exact same complete-line events as SerialTransport, so the parser,
* validator, store and dashboard need no changes when Wi-Fi is enabled.
*/
var WebSocketTransport = class {
	events;
	url;
	type = "websocket";
	socket = null;
	buffer = "";
	connected = false;
	constructor(events, url) {
		this.events = events;
		this.url = url;
	}
	isConnected() {
		return this.connected;
	}
	deviceName() {
		return this.connected ? this.url : null;
	}
	setState(state, detail) {
		this.events.onConnectionChange(state, detail);
	}
	async connect() {
		if (!this.url) {
			this.events.onError("No WebSocket URL configured for the ESP32 (Settings > Communication).");
			this.setState("ERROR", "missing url");
			return;
		}
		this.setState("CONNECTING");
		await new Promise((resolve) => {
			try {
				this.socket = new WebSocket(this.url);
			} catch (error) {
				this.events.onError(`WebSocket connection failed: ${String(error)}`);
				this.setState("ERROR");
				resolve();
				return;
			}
			this.socket.onopen = () => {
				this.connected = true;
				this.setState("CONNECTED", this.url);
				resolve();
			};
			this.socket.onmessage = (event) => {
				this.buffer += typeof event.data === "string" ? event.data : "";
				const lines = this.buffer.split(/\r?\n/);
				this.buffer = lines.pop() ?? "";
				for (const line of lines) {
					const trimmed = line.trim();
					if (trimmed !== "") this.events.onData(trimmed);
				}
			};
			this.socket.onerror = () => {
				this.events.onError("WebSocket error while talking to the ESP32.");
				this.setState("ERROR");
			};
			this.socket.onclose = () => {
				this.connected = false;
				this.setState("DISCONNECTED", "WebSocket closed");
				resolve();
			};
		});
	}
	async disconnect() {
		this.socket?.close();
		this.socket = null;
		this.connected = false;
		this.setState("DISCONNECTED", "Disconnected by user");
	}
};
var DEFAULT_SETTINGS = {
	transportType: "serial",
	baudRate: 115200,
	websocketUrl: "",
	timeWindowSeconds: 6,
	ecgBufferSize: 5e3,
	ppgBufferSize: 2500,
	vitalsBufferSize: 300,
	rawConsoleEnabled: true,
	parser: { ...DEFAULT_PARSER_OPTIONS }
};
/** Waveform data lives outside React state — charts read it in requestAnimationFrame. */
var buffers = {
	ecg: new RingBuffer(DEFAULT_SETTINGS.ecgBufferSize),
	ppgIR: new RingBuffer(DEFAULT_SETTINGS.ppgBufferSize),
	ppgRed: new RingBuffer(DEFAULT_SETTINGS.ppgBufferSize),
	ppgWave: new RingBuffer(DEFAULT_SETTINGS.ppgBufferSize),
	bpm: new RingBuffer(DEFAULT_SETTINGS.vitalsBufferSize),
	spo2: new RingBuffer(DEFAULT_SETTINGS.vitalsBufferSize),
	temperature: new RingBuffer(DEFAULT_SETTINGS.vitalsBufferSize),
	motion: new RingBuffer(DEFAULT_SETTINGS.vitalsBufferSize)
};
var sessionRows = [];
var MAX_SESSION_ROWS = 5e5;
var emptyCounters = {
	packetsReceived: 0,
	packetsProcessed: 0,
	packetsRejected: 0,
	malformedPacketCount: 0,
	validationErrorCount: 0,
	ecgSamples: 0,
	ppgSamples: 0,
	bpmUpdates: 0,
	spo2Updates: 0,
	temperatureUpdates: 0,
	imuUpdates: 0
};
var transport = null;
var rawId = 0;
var recentPacketTimes = [];
var recentEcgTimes = [];
var recentPpgTimes = [];
function rate(times, now) {
	while (times.length > 0 && now - times[0] > 1e3) times.shift();
	return times.length;
}
var useSensorStore = create((set, get) => ({
	...emptyCounters,
	settings: { ...DEFAULT_SETTINGS },
	connectionState: "DISCONNECTED",
	connectionDetail: null,
	transportType: "serial",
	deviceName: null,
	lastError: null,
	dataState: "NO_DATA",
	lastPacketTime: null,
	lastValidPacket: null,
	latencyMs: null,
	packetsPerSecond: 0,
	ecgSampleRate: 0,
	ppgSampleRate: 0,
	bpm: null,
	spo2: null,
	ecgCurrent: null,
	ppgIRCurrent: null,
	ppgRedCurrent: null,
	signalQuality: null,
	temperature: null,
	accel: null,
	gyro: null,
	motionMagnitude: null,
	lastEcgTime: null,
	lastPpgTime: null,
	lastBpmTime: null,
	lastSpo2Time: null,
	lastTemperatureTime: null,
	lastImuTime: null,
	rawLog: [],
	paused: false,
	recording: false,
	recordingStartedAt: null,
	recordedRows: 0,
	connect: async () => {
		if (transport?.isConnected()) return;
		const { settings } = get();
		const events = {
			onData: (line) => get().ingestLine(line),
			onError: (message) => set({ lastError: message }),
			onConnectionChange: (state, detail) => {
				set({
					connectionState: state,
					connectionDetail: detail ?? null,
					deviceName: transport?.deviceName() ?? null
				});
				if (state === "DISCONNECTED" || state === "ERROR") set({
					dataState: "NO_DATA",
					bpm: null,
					spo2: null,
					ecgCurrent: null,
					ppgIRCurrent: null,
					ppgRedCurrent: null,
					signalQuality: null,
					temperature: null,
					accel: null,
					gyro: null,
					motionMagnitude: null,
					packetsPerSecond: 0,
					ecgSampleRate: 0,
					ppgSampleRate: 0,
					latencyMs: null
				});
			}
		};
		if (settings.transportType === "serial") {
			if (!isWebSerialSupported()) {
				set({
					lastError: "Web Serial is not supported by this browser. Please use a supported Chromium-based browser such as Google Chrome or Microsoft Edge on desktop.",
					connectionState: "ERROR"
				});
				return;
			}
			transport = new SerialTransport(events, { baudRate: settings.baudRate });
		} else transport = new WebSocketTransport(events, settings.websocketUrl);
		set({
			lastError: null,
			transportType: settings.transportType
		});
		await transport.connect();
	},
	disconnect: async () => {
		await transport?.disconnect();
		transport = null;
	},
	ingestLine: (line) => {
		const state = get();
		if (state.paused) return;
		const now = Date.now();
		const result = parseLine(line, state.settings.parser);
		const validation = result.packet ? validatePacket(result.packet) : {
			ok: false,
			errors: [result.error ?? "Unparseable line"],
			packet: void 0
		};
		const patch = {
			packetsReceived: state.packetsReceived + 1,
			lastPacketTime: now,
			dataState: "RECEIVING",
			latencyMs: state.lastPacketTime ? now - state.lastPacketTime : null
		};
		if (state.settings.rawConsoleEnabled) patch.rawLog = [{
			id: rawId++,
			receivedAt: now,
			raw: result.raw,
			format: result.format,
			packet: validation.packet,
			valid: validation.ok,
			errors: validation.errors
		}, ...state.rawLog].slice(0, 200);
		if (!validation.ok || !validation.packet) {
			patch.packetsRejected = state.packetsRejected + 1;
			if (!result.packet) patch.malformedPacketCount = state.malformedPacketCount + 1;
			else patch.validationErrorCount = state.validationErrorCount + 1;
			set(patch);
			return;
		}
		const packet = validation.packet;
		patch.packetsProcessed = state.packetsProcessed + 1;
		patch.lastValidPacket = packet;
		if (validation.errors.length > 0) patch.validationErrorCount = state.validationErrorCount + validation.errors.length;
		recentPacketTimes.push(now);
		patch.packetsPerSecond = rate(recentPacketTimes, now);
		if (packet.ecg !== void 0) {
			buffers.ecg.push(packet.ecg, now);
			recentEcgTimes.push(now);
			patch.ecgCurrent = packet.ecg;
			patch.ecgSamples = state.ecgSamples + 1;
			patch.ecgSampleRate = rate(recentEcgTimes, now);
			patch.lastEcgTime = now;
		}
		if (packet.ppgIR !== void 0) {
			buffers.ppgIR.push(packet.ppgIR, now);
			recentPpgTimes.push(now);
			patch.ppgIRCurrent = packet.ppgIR;
			patch.ppgSamples = state.ppgSamples + 1;
			patch.ppgSampleRate = rate(recentPpgTimes, now);
			patch.lastPpgTime = now;
		}
		if (packet.ppgRed !== void 0) {
			buffers.ppgRed.push(packet.ppgRed, now);
			patch.ppgRedCurrent = packet.ppgRed;
			patch.lastPpgTime = now;
		}
		if (packet.ppgWave !== void 0) {
			buffers.ppgWave.push(packet.ppgWave, now);
			patch.lastPpgTime = now;
		}
		if (packet.bpm !== void 0) {
			buffers.bpm.push(packet.bpm, now);
			patch.bpm = packet.bpm;
			patch.bpmUpdates = state.bpmUpdates + 1;
			patch.lastBpmTime = now;
		}
		if (packet.spo2 !== void 0) {
			buffers.spo2.push(packet.spo2, now);
			patch.spo2 = packet.spo2;
			patch.spo2Updates = state.spo2Updates + 1;
			patch.lastSpo2Time = now;
		}
		if (packet.signalQuality !== void 0) patch.signalQuality = packet.signalQuality;
		if (packet.temperature !== void 0) {
			buffers.temperature.push(packet.temperature, now);
			patch.temperature = packet.temperature;
			patch.temperatureUpdates = state.temperatureUpdates + 1;
			patch.lastTemperatureTime = now;
		}
		if (packet.accelX !== void 0 || packet.accelY !== void 0 || packet.accelZ !== void 0) {
			const x = packet.accelX ?? state.accel?.x ?? 0;
			const y = packet.accelY ?? state.accel?.y ?? 0;
			const z = packet.accelZ ?? state.accel?.z ?? 0;
			const magnitude = Math.sqrt(x * x + y * y + z * z);
			buffers.motion.push(magnitude, now);
			patch.accel = {
				x,
				y,
				z
			};
			patch.motionMagnitude = magnitude;
			patch.imuUpdates = state.imuUpdates + 1;
			patch.lastImuTime = now;
		}
		if (packet.gyroX !== void 0 || packet.gyroY !== void 0 || packet.gyroZ !== void 0) {
			patch.gyro = {
				x: packet.gyroX ?? state.gyro?.x ?? 0,
				y: packet.gyroY ?? state.gyro?.y ?? 0,
				z: packet.gyroZ ?? state.gyro?.z ?? 0
			};
			patch.lastImuTime = now;
		}
		if (state.recording && sessionRows.length < MAX_SESSION_ROWS) {
			sessionRows.push({
				t: packet.timestamp ?? now,
				ecg: packet.ecg,
				ppgIR: packet.ppgIR,
				ppgRed: packet.ppgRed,
				bpm: packet.bpm,
				spo2: packet.spo2,
				signalQuality: packet.signalQuality,
				temperature: packet.temperature,
				accelX: packet.accelX,
				accelY: packet.accelY,
				accelZ: packet.accelZ,
				gyroX: packet.gyroX,
				gyroY: packet.gyroY,
				gyroZ: packet.gyroZ
			});
			patch.recordedRows = sessionRows.length;
		}
		set(patch);
	},
	setSettings: (patch) => {
		const settings = {
			...get().settings,
			...patch,
			parser: {
				...get().settings.parser,
				...patch.parser ?? {}
			}
		};
		if (patch.ecgBufferSize) buffers.ecg.resize(patch.ecgBufferSize);
		if (patch.ppgBufferSize) {
			buffers.ppgIR.resize(patch.ppgBufferSize);
			buffers.ppgRed.resize(patch.ppgBufferSize);
			buffers.ppgWave.resize(patch.ppgBufferSize);
		}
		if (patch.vitalsBufferSize) {
			buffers.bpm.resize(patch.vitalsBufferSize);
			buffers.spo2.resize(patch.vitalsBufferSize);
			buffers.temperature.resize(patch.vitalsBufferSize);
			buffers.motion.resize(patch.vitalsBufferSize);
		}
		set({ settings });
	},
	setPaused: (paused) => set({ paused }),
	clearWaveforms: () => {
		Object.values(buffers).forEach((b) => b.clear());
		set({
			ecgCurrent: null,
			ppgIRCurrent: null,
			ppgRedCurrent: null
		});
	},
	startSession: () => {
		sessionRows.length = 0;
		set({
			recording: true,
			recordingStartedAt: Date.now(),
			recordedRows: 0
		});
	},
	stopSession: () => set({ recording: false }),
	clearSession: () => {
		sessionRows.length = 0;
		set({
			recordedRows: 0,
			recordingStartedAt: null
		});
	},
	clearRawLog: () => set({ rawLog: [] }),
	resetStats: () => set({ ...emptyCounters })
}));
/** Marks the stream stale when no packet has arrived recently. */
if (typeof window !== "undefined") window.setInterval(() => {
	const s = useSensorStore.getState();
	if (s.connectionState !== "CONNECTED") return;
	if (!s.lastPacketTime) return;
	if (Date.now() - s.lastPacketTime > 2e3 && s.dataState !== "STALE") useSensorStore.setState({ dataState: "STALE" });
}, 500);
//#endregion
export { useSensorStore as i, isWebSerialSupported as n, sessionRows as r, buffers as t };
