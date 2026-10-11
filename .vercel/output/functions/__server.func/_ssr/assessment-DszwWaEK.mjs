import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as useSensorStore } from "./sensorStore-Nqe95hp0.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as Check, C as LayoutGrid, D as Heart, G as ArrowLeft, I as CircleCheck, K as Activity, O as HeartPulse, P as Clock, R as ChevronRight, S as LoaderCircle, V as Camera, W as ArrowRight, _ as MapPin, a as Trash2, c as ShieldCheck, d as Radio, f as Plus, g as Moon, h as PenLine, i as TriangleAlert, m as Phone, n as X, p as Pill, r as User, u as Save, v as Mail, w as Layers, x as Lock, z as ChevronDown } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as usePatientStore } from "./router-_n_MgLcq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assessment-DszwWaEK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SearchableSelect({ id, label, required, options, selected, onChange, placeholder = "Search...", isMulti = false, allowCustom = false, error, helperText, className = "" }) {
	const [isOpen, setIsOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [activeIndex, setActiveIndex] = (0, import_react.useState)(-1);
	const containerRef = (0, import_react.useRef)(null);
	const inputRef = (0, import_react.useRef)(null);
	const selectedArray = Array.isArray(selected) ? selected : selected ? [selected] : [];
	const filteredOptions = options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase().trim()));
	const isExactMatch = options.some((opt) => opt.toLowerCase() === query.trim().toLowerCase());
	(0, import_react.useEffect)(() => {
		function handleClickOutside(e) {
			if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);
	const handleSelect = (item) => {
		if (isMulti) {
			const current = Array.isArray(selected) ? selected : [];
			if (current.includes(item)) onChange(current.filter((i) => i !== item));
			else if (item.toLowerCase().includes("none") || item.toLowerCase().includes("no current")) onChange([item]);
			else onChange([...current.filter((i) => !i.toLowerCase().includes("none") && !i.toLowerCase().includes("no current")), item]);
		} else {
			onChange(item);
			setIsOpen(false);
		}
		setQuery("");
	};
	const handleRemove = (itemToRemove, e) => {
		e.stopPropagation();
		if (isMulti) onChange((Array.isArray(selected) ? selected : []).filter((i) => i !== itemToRemove));
		else onChange("");
	};
	const handleAddCustom = () => {
		const trimmed = query.trim();
		if (!trimmed) return;
		if (isMulti) {
			const current = Array.isArray(selected) ? selected : [];
			if (!current.includes(trimmed)) onChange([...current, trimmed]);
		} else {
			onChange(trimmed);
			setIsOpen(false);
		}
		setQuery("");
	};
	const handleKeyDown = (e) => {
		if (!isOpen) {
			if (e.key === "ArrowDown" || e.key === "Enter") {
				setIsOpen(true);
				e.preventDefault();
			}
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((prev) => prev < filteredOptions.length - 1 ? prev + 1 : prev);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((prev) => prev > 0 ? prev - 1 : 0);
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (activeIndex >= 0 && activeIndex < filteredOptions.length) handleSelect(filteredOptions[activeIndex]);
			else if (allowCustom && query.trim() && !isExactMatch) handleAddCustom();
		} else if (e.key === "Escape") setIsOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `space-y-1.5 w-full relative ${className}`,
		ref: containerRef,
		children: [
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				htmlFor: id,
				className: "flex items-center justify-between text-xs font-semibold text-[#142033] dark:text-slate-200",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					label,
					" ",
					required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-rose-500",
						children: "*"
					})
				] }), helperText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] font-normal text-[#667085] dark:text-slate-400",
					children: helperText
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onClick: () => {
					setIsOpen(true);
					inputRef.current?.focus();
				},
				className: `min-h-[42px] w-full rounded-xl border ${error ? "border-rose-500 ring-2 ring-rose-500/20" : isOpen ? "border-[#FF6B00] ring-2 ring-orange-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 hover:border-slate-400"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 px-3 py-1.5 text-sm transition-all flex flex-wrap items-center gap-1.5 cursor-pointer`,
				children: [
					isMulti && selectedArray.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] dark:text-[#FF8A00] px-2 py-0.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: (e) => handleRemove(item, e),
							className: "hover:text-rose-600 rounded p-0.5",
							"aria-label": `Remove ${item}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
						})]
					}, item)),
					!isMulti && selected && !isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium text-[#142033] dark:text-slate-100 truncate flex-1",
						children: selected
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						id,
						type: "text",
						value: query,
						onChange: (e) => {
							setQuery(e.target.value);
							setActiveIndex(0);
							if (!isOpen) setIsOpen(true);
						},
						onFocus: () => setIsOpen(true),
						onKeyDown: handleKeyDown,
						placeholder: selectedArray.length === 0 ? placeholder : isMulti ? "Add more..." : "",
						className: "flex-1 min-w-[120px] bg-transparent text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 text-[#667085] ml-auto",
						children: [!isMulti && selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: (e) => handleRemove(selected, e),
							className: "p-0.5 hover:text-rose-500 rounded",
							title: "Clear selection",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#FF6B00]" : ""}` })]
					})
				]
			}),
			isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#142033] p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150",
				children: [filteredOptions.length > 0 ? filteredOptions.map((opt, idx) => {
					const isSelected = selectedArray.includes(opt);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => handleSelect(opt),
						onMouseEnter: () => setActiveIndex(idx),
						className: `flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${activeIndex === idx ? "bg-orange-500/10 text-[#FF6B00] dark:text-[#FF8A00]" : isSelected ? "bg-slate-100/70 dark:bg-slate-800 text-[#142033] dark:text-white" : "text-[#142033] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: opt
						}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-[#FF6B00] shrink-0 ml-2" })]
					}, opt);
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-3 px-3 text-center text-xs text-[#667085] dark:text-slate-400",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No matching results" }), allowCustom && query.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleAddCustom,
						className: "mt-2 inline-flex items-center gap-1 rounded-lg bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-xs font-semibold text-[#FF6B00] hover:bg-orange-500/25 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Add \"",
							query.trim(),
							"\""
						] })]
					})]
				}), allowCustom && query.trim() && !isExactMatch && filteredOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: handleAddCustom,
					className: "mt-1 border-t border-slate-100 dark:border-slate-800 pt-1 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#FF6B00] hover:bg-orange-500/10 cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Add custom: \"",
						query.trim(),
						"\""
					] })]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1",
				children: error
			})
		]
	});
}
/**
* Standardized Healthcare & Medical Autocomplete Catalogs
* Ear-to-Heart Health Hub
*/
var BLOOD_GROUPS = [
	"A+",
	"A-",
	"B+",
	"B-",
	"AB+",
	"AB-",
	"O+",
	"O-",
	"I don't know my blood group",
	"Unknown"
];
var GENDERS = [
	"Male",
	"Female",
	"Intersex",
	"Prefer not to say",
	"Other"
];
var MEDICAL_CONDITIONS = [
	"Hypertension",
	"Type 1 diabetes",
	"Type 2 diabetes",
	"Prediabetes",
	"Coronary artery disease",
	"Previous heart attack",
	"Heart failure",
	"Arrhythmia",
	"Atrial fibrillation",
	"Previous stroke",
	"Dilated cardiomyopathy",
	"Hypertrophic cardiomyopathy",
	"Pericarditis",
	"Valvular heart disease",
	"Peripheral artery disease",
	"None of the above",
	"I don't know"
];
var COMMON_MEDICATIONS = [
	"Metoprolol",
	"Atorvastatin",
	"Aspirin",
	"Lisinopril",
	"Amlodipine",
	"Losartan",
	"Clopidogrel",
	"Warfarin",
	"Apixaban",
	"Metformin",
	"Carvedilol",
	"Furosemide",
	"Spironolactone",
	"Diltiazem",
	"Nitroglycerin",
	"Rosuvastatin",
	"Digoxin",
	"Amiodarone",
	"Hydrochlorothiazide",
	"None"
];
var ALLERGIES_LIST = [
	"Penicillin",
	"Sulfa drugs",
	"Aspirin / NSAIDs",
	"ACE inhibitors",
	"Latex",
	"Shellfish",
	"Contrast iodine dye",
	"Peanuts",
	"Soy",
	"No known allergies",
	"Unknown allergy status"
];
var FAMILY_HISTORY_ITEMS = [
	"Heart disease",
	"Heart attack",
	"Stroke",
	"High blood pressure",
	"Diabetes",
	"Sudden cardiac arrest",
	"None known",
	"Unknown"
];
var SYMPTOMS_LIST = [
	"Chest discomfort",
	"Shortness of breath",
	"Palpitations",
	"Dizziness",
	"Fainting",
	"Unusual fatigue",
	"Swelling in the legs",
	"Rapid irregular heartbeat",
	"Cold sweats",
	"Nausea",
	"No current symptoms"
];
var ACUTE_EMERGENCY_SYMPTOMS = [
	"Chest discomfort",
	"Fainting",
	"Shortness of breath"
];
var EMERGENCY_RELATIONSHIPS = [
	"Spouse",
	"Parent",
	"Child",
	"Sibling",
	"Relative",
	"Guardian",
	"Friend",
	"Colleague",
	"Other"
];
var COUNTRIES = [
	"India",
	"United States",
	"United Kingdom",
	"Canada",
	"Australia",
	"Germany",
	"Singapore",
	"United Arab Emirates",
	"Other"
];
var INDIAN_STATES = [
	"Odisha",
	"Maharashtra",
	"Karnataka",
	"Delhi",
	"Tamil Nadu",
	"Andhra Pradesh",
	"Telangana",
	"West Bengal",
	"Kerala",
	"Gujarat",
	"Uttar Pradesh",
	"Rajasthan",
	"Punjab",
	"Haryana",
	"Madhya Pradesh",
	"Bihar",
	"Assam",
	"Jharkhand",
	"Goa",
	"Other"
];
var SMOKING_OPTIONS = [
	"Never smoked",
	"Former smoker",
	"Current smoker",
	"Prefer not to say"
];
var PHYSICAL_ACTIVITY_OPTIONS = [
	"Sedentary",
	"Lightly active",
	"Moderately active",
	"Very active"
];
var COMMUNICATION_METHODS = [
	"Email",
	"SMS",
	"Phone call",
	"In-app notifications"
];
var LANGUAGES = [
	"English",
	"Hindi",
	"Odia",
	"Other"
];
function Step1Personal({ data, onChange, onNext }) {
	const [unitHeight, setUnitHeight] = (0, import_react.useState)("cm");
	const [unitWeight, setUnitWeight] = (0, import_react.useState)("kg");
	const [feet, setFeet] = (0, import_react.useState)(data.heightCm ? Math.floor(data.heightCm / 30.48) : 5);
	const [inches, setInches] = (0, import_react.useState)(data.heightCm ? Math.round(data.heightCm % 30.48 / 2.54) : 9);
	const [lbs, setLbs] = (0, import_react.useState)(data.weightKg ? Math.round(data.weightKg * 2.20462) : 154);
	const [errors, setErrors] = (0, import_react.useState)({});
	const handleDobChange = (dob) => {
		let calculatedAge = data.age;
		if (dob) {
			const birthDate = new Date(dob);
			const today = /* @__PURE__ */ new Date();
			let age = today.getFullYear() - birthDate.getFullYear();
			const m = today.getMonth() - birthDate.getMonth();
			if (m < 0 || m === 0 && today.getDate() < birthDate.getDate()) age--;
			if (age >= 0 && age <= 130) calculatedAge = age;
		}
		onChange({
			dateOfBirth: dob,
			age: calculatedAge
		});
		if (errors.dateOfBirth) setErrors((prev) => ({
			...prev,
			dateOfBirth: ""
		}));
	};
	const handlePhotoUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (![
			"image/jpeg",
			"image/png",
			"image/webp"
		].includes(file.type)) {
			setErrors((prev) => ({
				...prev,
				photo: "Please upload a JPG, PNG, or WebP image."
			}));
			return;
		}
		if (file.size > 5242880) {
			setErrors((prev) => ({
				...prev,
				photo: "File size must be under 5MB."
			}));
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			onChange({ profilePhoto: reader.result });
			setErrors((prev) => ({
				...prev,
				photo: ""
			}));
		};
		reader.readAsDataURL(file);
	};
	const validateAndProceed = () => {
		const newErrors = {};
		if (!data.fullName?.trim()) newErrors.fullName = "Full name is required.";
		if (!data.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
		if (!data.gender) newErrors.gender = "Please select your gender.";
		if (!data.bloodGroup) newErrors.bloodGroup = "Please select your blood group.";
		if (!data.heightCm || data.heightCm < 40 || data.heightCm > 250) newErrors.heightCm = "Please enter a valid height.";
		if (!data.weightKg || data.weightKg < 20 || data.weightKg > 350) newErrors.weightKg = "Please enter a valid weight.";
		setErrors(newErrors);
		if (Object.keys(newErrors).length === 0) onNext();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-100 dark:border-slate-800 pb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative group",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-20 w-20 rounded-full border-2 border-dashed border-orange-500/40 bg-orange-500/5 dark:bg-orange-500/10 flex items-center justify-center overflow-hidden text-orange-500 shadow-sm transition-transform group-hover:scale-105",
						children: data.profilePhoto ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: data.profilePhoto,
							alt: data.fullName || "Patient photo",
							className: "h-full w-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-10 w-10 text-orange-400 dark:text-orange-300" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						htmlFor: "patient-photo-input",
						className: "absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-orange-600 transition-colors",
						title: "Upload profile photo",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "patient-photo-input",
							type: "file",
							accept: "image/png, image/jpeg, image/webp",
							onChange: handlePhotoUpload,
							className: "hidden"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Profile Photo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-normal text-[#667085] dark:text-slate-400",
								children: "(Optional, JPG/PNG under 5MB)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#667085] dark:text-slate-400",
							children: "A photo helps healthcare professionals confirm identity during clinical consultations."
						}),
						data.profilePhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onChange({ profilePhoto: void 0 }),
							className: "inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors pt-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Remove photo" })]
						}),
						errors.photo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-rose-500",
							children: errors.photo
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-2 space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								htmlFor: "field-fullName",
								className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
								children: ["Full Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-rose-500",
									children: "*"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "field-fullName",
								type: "text",
								value: data.fullName || "",
								onChange: (e) => {
									onChange({ fullName: e.target.value });
									if (errors.fullName) setErrors((prev) => ({
										...prev,
										fullName: ""
									}));
								},
								placeholder: "Enter full name",
								className: `w-full rounded-xl border ${errors.fullName ? "border-rose-500 ring-2 ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`
							}),
							errors.fullName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-rose-500",
								children: errors.fullName
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: "field-dob",
									className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
									children: ["Date of Birth ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-rose-500",
										children: "*"
									})]
								}), data.age !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full",
									children: [
										"Age: ",
										data.age,
										" years"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "field-dob",
									type: "date",
									value: data.dateOfBirth || "",
									onChange: (e) => handleDobChange(e.target.value),
									className: `w-full rounded-xl border ${errors.dateOfBirth ? "border-rose-500 ring-2 ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 focus:outline-none transition-all`
								})
							}),
							errors.dateOfBirth && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-rose-500",
								children: errors.dateOfBirth
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							id: "field-gender",
							label: "Gender / Sex",
							required: true,
							options: GENDERS,
							selected: data.gender || "",
							onChange: (val) => {
								onChange({ gender: val });
								if (errors.gender) setErrors((prev) => ({
									...prev,
									gender: ""
								}));
							},
							placeholder: "Select gender",
							error: errors.gender
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:col-span-2 space-y-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							id: "field-bloodGroup",
							label: "Blood Group",
							required: true,
							options: BLOOD_GROUPS,
							selected: data.bloodGroup || "",
							onChange: (val) => {
								onChange({ bloodGroup: val });
								if (errors.bloodGroup) setErrors((prev) => ({
									...prev,
									bloodGroup: ""
								}));
							},
							placeholder: "Select blood group",
							helperText: "Select 'I don't know' if uncertain",
							error: errors.bloodGroup
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: "field-height",
									className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
									children: [
										"Height (",
										unitHeight,
										") ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-rose-500",
											children: "*"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-700 rounded-lg p-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setUnitHeight("cm"),
										className: `px-1.5 py-0.5 rounded ${unitHeight === "cm" ? "bg-[#FF6B00] text-white shadow-sm" : "text-slate-600 dark:text-slate-300"}`,
										children: "cm"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setUnitHeight("ft"),
										className: `px-1.5 py-0.5 rounded ${unitHeight === "ft" ? "bg-[#FF6B00] text-white shadow-sm" : "text-slate-600 dark:text-slate-300"}`,
										children: "ft/in"
									})]
								})]
							}),
							unitHeight === "cm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "field-height",
								type: "number",
								min: 40,
								max: 250,
								value: data.heightCm || "",
								onChange: (e) => {
									onChange({ heightCm: e.target.value === "" ? void 0 : Number(e.target.value) });
									if (errors.heightCm) setErrors((prev) => ({
										...prev,
										heightCm: ""
									}));
								},
								placeholder: "e.g. 175",
								className: `w-full rounded-xl border ${errors.heightCm ? "border-rose-500 ring-2 ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 2,
									max: 8,
									value: feet,
									onChange: (e) => {
										const ft = Number(e.target.value);
										setFeet(ft);
										onChange({ heightCm: Math.round(ft * 30.48 + inches * 2.54) });
									},
									placeholder: "ft",
									className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3 text-sm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 0,
									max: 11,
									value: inches,
									onChange: (e) => {
										const inc = Number(e.target.value);
										setInches(inc);
										onChange({ heightCm: Math.round(feet * 30.48 + inc * 2.54) });
									},
									placeholder: "in",
									className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3 text-sm"
								})]
							}),
							errors.heightCm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-rose-500",
								children: errors.heightCm
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: "field-weight",
									className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
									children: [
										"Weight (",
										unitWeight,
										") ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-rose-500",
											children: "*"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-700 rounded-lg p-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setUnitWeight("kg"),
										className: `px-1.5 py-0.5 rounded ${unitWeight === "kg" ? "bg-[#FF6B00] text-white shadow-sm" : "text-slate-600 dark:text-slate-300"}`,
										children: "kg"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setUnitWeight("lbs"),
										className: `px-1.5 py-0.5 rounded ${unitWeight === "lbs" ? "bg-[#FF6B00] text-white shadow-sm" : "text-slate-600 dark:text-slate-300"}`,
										children: "lbs"
									})]
								})]
							}),
							unitWeight === "kg" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "field-weight",
								type: "number",
								min: 20,
								max: 350,
								value: data.weightKg || "",
								onChange: (e) => {
									onChange({ weightKg: e.target.value === "" ? void 0 : Number(e.target.value) });
									if (errors.weightKg) setErrors((prev) => ({
										...prev,
										weightKg: ""
									}));
								},
								placeholder: "e.g. 70",
								className: `w-full rounded-xl border ${errors.weightKg ? "border-rose-500 ring-2 ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "field-weight-lbs",
								type: "number",
								min: 44,
								max: 770,
								value: lbs,
								onChange: (e) => {
									const val = Number(e.target.value);
									setLbs(val);
									onChange({ weightKg: Math.round(val / 2.20462) });
								},
								placeholder: "e.g. 154",
								className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 focus:outline-none"
							}),
							errors.weightKg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-rose-500",
								children: errors.weightKg
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-4 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: validateAndProceed,
					className: "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Continue to Contact Details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
				})
			})
		]
	});
}
function Step2Contact({ contactData, emergencyData, onContactChange, onEmergencyChange, onNext, onBack }) {
	const [errors, setErrors] = (0, import_react.useState)({});
	const validateAndProceed = () => {
		const newErrors = {};
		if (!contactData.mobileNumber?.trim()) newErrors.mobileNumber = "Mobile number is required.";
		else if (contactData.mobileNumber.replace(/\D/g, "").length < 7) newErrors.mobileNumber = "Please enter a valid mobile number.";
		if (!emergencyData.contactName?.trim()) newErrors.contactName = "Emergency contact name is required.";
		if (!emergencyData.relationship?.trim()) newErrors.relationship = "Please specify relationship.";
		if (!emergencyData.contactNumber?.trim()) newErrors.contactNumber = "Emergency contact number is required.";
		else if (emergencyData.contactNumber.replace(/\D/g, "").length < 7) newErrors.contactNumber = "Please enter a valid emergency phone number.";
		if (!emergencyData.consentGranted) newErrors.consent = "Consent to contact in medical emergencies is required.";
		setErrors(newErrors);
		if (Object.keys(newErrors).length === 0) onNext();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-slate-100 dark:border-slate-800 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Primary Contact Details" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#667085] dark:text-slate-400",
						children: "How clinical staff and automated telemetry alerts communicate with you."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:col-span-2 space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "field-email",
										className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
										children: ["Email Address ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-rose-500",
											children: "*"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Verified Account Email" })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute left-3.5 flex items-center pointer-events-none text-[#667085]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "field-email",
										type: "email",
										value: contactData.email || "",
										readOnly: true,
										className: "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-[#142033] dark:text-slate-200 cursor-not-allowed"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-[#667085] dark:text-slate-400",
									children: "Authentication email is linked to your account. To change this, use the security verification settings."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: "field-mobile",
									className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
									children: ["Mobile Number ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-rose-500",
										children: "*"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: contactData.countryCode || "+91",
										onChange: (e) => onContactChange({ countryCode: e.target.value }),
										className: "rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1A2639]/90 px-2.5 py-2.5 text-xs font-semibold text-[#142033] dark:text-slate-100 focus:outline-none focus:border-[#FF6B00]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "+91",
												children: "+91 (IN)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "+1",
												children: "+1 (US)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "+44",
												children: "+44 (UK)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "+61",
												children: "+61 (AU)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "+65",
												children: "+65 (SG)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "+971",
												children: "+971 (AE)"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "field-mobile",
										type: "tel",
										value: contactData.mobileNumber || "",
										onChange: (e) => {
											onContactChange({ mobileNumber: e.target.value });
											if (errors.mobileNumber) setErrors((prev) => ({
												...prev,
												mobileNumber: ""
											}));
										},
										placeholder: "e.g. 9876543210",
										className: `flex-1 rounded-xl border ${errors.mobileNumber ? "border-rose-500 ring-2 ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`
									})]
								}),
								errors.mobileNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-rose-500",
									children: errors.mobileNumber
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								htmlFor: "field-altMobile",
								className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
								children: ["Alternate Number ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#667085] font-normal",
									children: "(Optional)"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: contactData.alternateCountryCode || "+91",
									onChange: (e) => onContactChange({ alternateCountryCode: e.target.value }),
									className: "rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1A2639]/90 px-2.5 py-2.5 text-xs font-semibold text-[#142033] dark:text-slate-100 focus:outline-none",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "+91",
											children: "+91 (IN)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "+1",
											children: "+1 (US)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "+44",
											children: "+44 (UK)"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "field-altMobile",
									type: "tel",
									value: contactData.alternateNumber || "",
									onChange: (e) => onContactChange({ alternateNumber: e.target.value }),
									placeholder: "Enter alternate number",
									className: "flex-1 rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
								})]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-slate-100 dark:border-slate-800 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Residential Address" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#667085] dark:text-slate-400",
						children: "For rapid dispatch of emergency cardiac medical personnel if required."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "field-city",
								className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
								children: "City"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "field-city",
								type: "text",
								value: contactData.city || "",
								onChange: (e) => onContactChange({ city: e.target.value }),
								placeholder: "e.g. Bhubaneswar",
								className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
								id: "field-state",
								label: "State / Province",
								options: INDIAN_STATES,
								selected: contactData.state || "Odisha",
								onChange: (val) => onContactChange({ state: val }),
								placeholder: "Select state",
								allowCustom: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
								id: "field-country",
								label: "Country",
								options: COUNTRIES,
								selected: contactData.country || "India",
								onChange: (val) => onContactChange({ country: val }),
								placeholder: "Select country"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sm:col-span-2 space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "field-address",
								className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
								children: "Address Line"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "field-address",
								type: "text",
								value: contactData.address || "",
								onChange: (e) => onContactChange({ address: e.target.value }),
								placeholder: "Street address, building, apartment (optional)",
								className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "field-postalCode",
								className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
								children: "Postal / PIN Code"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "field-postalCode",
								type: "text",
								value: contactData.postalCode || "",
								onChange: (e) => onContactChange({ postalCode: e.target.value }),
								placeholder: "e.g. 751024",
								className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-slate-100 dark:border-slate-800 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-rose-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Designated Emergency Contact" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#667085] dark:text-slate-400",
							children: "A trusted family member or proxy who can act on your behalf during acute events."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "field-emergencyName",
										className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
										children: ["Contact Person Full Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-rose-500",
											children: "*"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "field-emergencyName",
										type: "text",
										value: emergencyData.contactName || "",
										onChange: (e) => {
											onEmergencyChange({ contactName: e.target.value });
											if (errors.contactName) setErrors((prev) => ({
												...prev,
												contactName: ""
											}));
										},
										placeholder: "e.g. Linda Chen",
										className: `w-full rounded-xl border ${errors.contactName ? "border-rose-500 ring-2 ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`
									}),
									errors.contactName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-rose-500",
										children: errors.contactName
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									id: "field-relationship",
									label: "Relationship",
									required: true,
									options: EMERGENCY_RELATIONSHIPS,
									selected: emergencyData.relationship || "",
									onChange: (val) => {
										onEmergencyChange({ relationship: val });
										if (errors.relationship) setErrors((prev) => ({
											...prev,
											relationship: ""
										}));
									},
									placeholder: "Select relationship",
									error: errors.relationship,
									allowCustom: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "field-emergencyPhone",
										className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
										children: ["Mobile Number ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-rose-500",
											children: "*"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: emergencyData.countryCode || "+91",
											onChange: (e) => onEmergencyChange({ countryCode: e.target.value }),
											className: "rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1A2639]/90 px-2 py-2 text-xs font-semibold text-[#142033] dark:text-slate-100 focus:outline-none",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "+91",
													children: "+91"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "+1",
													children: "+1"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "+44",
													children: "+44"
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "field-emergencyPhone",
											type: "tel",
											value: emergencyData.contactNumber || "",
											onChange: (e) => {
												onEmergencyChange({ contactNumber: e.target.value });
												if (errors.contactNumber) setErrors((prev) => ({
													...prev,
													contactNumber: ""
												}));
											},
											placeholder: "e.g. 9876543211",
											className: `flex-1 rounded-xl border ${errors.contactNumber ? "border-rose-500 ring-2 ring-rose-500/20" : "border-[#D9E1EA] dark:border-slate-700/80 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"} bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none transition-all`
										})]
									}),
									errors.contactNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-rose-500",
										children: errors.contactNumber
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-start gap-2.5 cursor-pointer select-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: emergencyData.consentGranted || false,
								onChange: (e) => {
									onEmergencyChange({ consentGranted: e.target.checked });
									if (errors.consent) setErrors((prev) => ({
										...prev,
										consent: ""
									}));
								},
								className: "mt-0.5 h-4 w-4 rounded border-amber-300 text-[#FF6B00] focus:ring-[#FF6B00] accent-[#FF6B00]"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-[#142033] dark:text-slate-200 leading-relaxed",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold block",
									children: "Emergency Contact Notification Consent"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#667085] dark:text-slate-400",
									children: "I hereby authorize Ear-to-Heart Health Hub to reach out to this designated emergency contact only in the event of severe biometric abnormalities (e.g., ventricular tachycardia, sustained asystole, or cardiac distress) where the patient is unresponsive."
								})]
							})]
						}), errors.consent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold text-rose-600 pl-6",
							children: errors.consent
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
						id: "field-commMethod",
						label: "Preferred Communication Method",
						options: COMMUNICATION_METHODS,
						selected: contactData.preferredCommunication || "Email",
						onChange: (val) => onContactChange({ preferredCommunication: val })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
						id: "field-language",
						label: "Preferred Language",
						options: LANGUAGES,
						selected: contactData.preferredLanguage || "English",
						onChange: (val) => onContactChange({ preferredLanguage: val })
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onBack,
					className: "inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-[#142033] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Back" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: validateAndProceed,
					className: "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Continue to Medical Info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
				})]
			})
		]
	});
}
function Step3Medical({ data, onChange, onNext, onBack }) {
	const [newMedName, setNewMedName] = (0, import_react.useState)("");
	const [newMedDose, setNewMedDose] = (0, import_react.useState)("");
	const handleAddMedication = () => {
		if (!newMedName.trim()) return;
		const item = {
			name: newMedName.trim(),
			dosage: newMedDose.trim() || void 0
		};
		onChange({ currentMedications: [...data.currentMedications || [], item] });
		setNewMedName("");
		setNewMedDose("");
	};
	const handleRemoveMedication = (index) => {
		const list = [...data.currentMedications || []];
		list.splice(index, 1);
		onChange({ currentMedications: list });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-slate-100 dark:border-slate-800 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Blood Pressure & Laboratory Measurements" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#667085] dark:text-slate-400",
							children: "Enter recent clinical test results. You may select \"I don't know\" if lab values are unavailable."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F9FC]/60 dark:bg-[#1A2639]/50 p-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-[#142033] dark:text-slate-200",
								children: "Blood Pressure (mmHg)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 cursor-pointer text-xs text-[#667085] dark:text-slate-300",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: data.bloodPressureUnknown || false,
									onChange: (e) => onChange({
										bloodPressureUnknown: e.target.checked,
										bloodPressureSystolic: e.target.checked ? void 0 : data.bloodPressureSystolic,
										bloodPressureDiastolic: e.target.checked ? void 0 : data.bloodPressureDiastolic
									}),
									className: "rounded border-[#D9E1EA] text-[#FF6B00] accent-[#FF6B00]"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I don't know my blood pressure" })]
							})]
						}), !data.bloodPressureUnknown && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4 animate-in fade-in duration-200",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1",
								children: "Systolic (Upper, e.g. 120)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: 70,
								max: 250,
								value: data.bloodPressureSystolic || "",
								onChange: (e) => onChange({ bloodPressureSystolic: e.target.value === "" ? void 0 : Number(e.target.value) }),
								placeholder: "120",
								className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1",
								children: "Diastolic (Lower, e.g. 80)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: 40,
								max: 150,
								value: data.bloodPressureDiastolic || "",
								onChange: (e) => onChange({ bloodPressureDiastolic: e.target.value === "" ? void 0 : Number(e.target.value) }),
								placeholder: "80",
								className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
							})] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F9FC]/60 dark:bg-[#1A2639]/50 p-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-[#142033] dark:text-slate-200",
								children: "Lipid & Cholesterol Profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 rounded-lg p-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => onChange({ cholesterolUnit: "mg/dL" }),
										className: `px-2 py-0.5 rounded ${data.cholesterolUnit !== "mmol/L" ? "bg-[#FF6B00] text-white shadow-sm" : "text-slate-600 dark:text-slate-300"}`,
										children: "mg/dL"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => onChange({ cholesterolUnit: "mmol/L" }),
										className: `px-2 py-0.5 rounded ${data.cholesterolUnit === "mmol/L" ? "bg-[#FF6B00] text-white shadow-sm" : "text-slate-600 dark:text-slate-300"}`,
										children: "mmol/L"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-1.5 cursor-pointer text-xs text-[#667085] dark:text-slate-300",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: data.cholesterolUnknown || false,
										onChange: (e) => onChange({
											cholesterolUnknown: e.target.checked,
											cholesterolTotal: e.target.checked ? void 0 : data.cholesterolTotal,
											cholesterolLdl: e.target.checked ? void 0 : data.cholesterolLdl,
											cholesterolHdl: e.target.checked ? void 0 : data.cholesterolHdl,
											cholesterolTriglycerides: e.target.checked ? void 0 : data.cholesterolTriglycerides
										}),
										className: "rounded border-[#D9E1EA] text-[#FF6B00] accent-[#FF6B00]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I don't know my cholesterol" })]
								})]
							})]
						}), !data.cholesterolUnknown && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-200",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1",
									children: "Total"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: data.cholesterolTotal || "",
									onChange: (e) => onChange({ cholesterolTotal: e.target.value === "" ? void 0 : Number(e.target.value) }),
									placeholder: "e.g. 190",
									className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1",
									children: "LDL (\"Bad\")"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: data.cholesterolLdl || "",
									onChange: (e) => onChange({ cholesterolLdl: e.target.value === "" ? void 0 : Number(e.target.value) }),
									placeholder: "e.g. 110",
									className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1",
									children: "HDL (\"Good\")"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: data.cholesterolHdl || "",
									onChange: (e) => onChange({ cholesterolHdl: e.target.value === "" ? void 0 : Number(e.target.value) }),
									placeholder: "e.g. 50",
									className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-[11px] font-medium text-[#667085] dark:text-slate-400 mb-1",
									children: "Triglycerides"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: data.cholesterolTriglycerides || "",
									onChange: (e) => onChange({ cholesterolTriglycerides: e.target.value === "" ? void 0 : Number(e.target.value) }),
									placeholder: "e.g. 140",
									className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-white dark:bg-[#142033] py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
								})] })
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-slate-100 dark:border-slate-800 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pre-existing Conditions & Pharmacotherapy" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#667085] dark:text-slate-400",
							children: "Select recognized diagnoses and ongoing prescription regimens."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							id: "field-conditions",
							label: "Medical Conditions",
							options: MEDICAL_CONDITIONS,
							selected: data.medicalConditions || [],
							onChange: (val) => onChange({ medicalConditions: val }),
							isMulti: true,
							allowCustom: true,
							placeholder: "Search conditions (e.g. Hypertension, Arrhythmia)...",
							helperText: "Multiple selections supported"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
								children: "Current Medications & Daily Regimen"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:flex-row gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
											options: COMMON_MEDICATIONS,
											selected: newMedName,
											onChange: (val) => setNewMedName(val),
											allowCustom: true,
											placeholder: "Search or enter medication (e.g. Metoprolol, Aspirin)..."
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: newMedDose,
										onChange: (e) => setNewMedDose(e.target.value),
										placeholder: "Dosage (e.g. 50mg daily)",
										className: "sm:w-44 rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: handleAddMedication,
										className: "inline-flex items-center justify-center gap-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] px-4 py-2 text-xs font-semibold hover:bg-orange-500/25 transition-colors shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add Medication" })]
									})
								]
							}),
							data.currentMedications && data.currentMedications.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2 pt-1",
								children: data.currentMedications.map((med, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#142033] px-3 py-1.5 text-xs font-medium text-[#142033] dark:text-slate-100 shadow-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { className: "h-3.5 w-3.5 text-orange-500" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: med.name }),
										med.dosage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[#667085] dark:text-slate-400 font-mono",
											children: [
												"(",
												med.dosage,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => handleRemoveMedication(idx),
											className: "text-slate-400 hover:text-rose-500 ml-1 rounded p-0.5",
											title: "Remove medication",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
										})
									]
								}, idx))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
								id: "field-familyHistory",
								label: "Family Medical History",
								options: FAMILY_HISTORY_ITEMS,
								selected: data.familyHistory || [],
								onChange: (val) => onChange({ familyHistory: val }),
								isMulti: true,
								placeholder: "Search family history..."
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
								id: "field-allergies",
								label: "Drug & Substance Allergies",
								options: ALLERGIES_LIST,
								selected: data.allergies || [],
								onChange: (val) => onChange({ allergies: val }),
								isMulti: true,
								allowCustom: true,
								placeholder: "Search allergies..."
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-slate-100 dark:border-slate-800 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Lifestyle & Behavioral Factors" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#667085] dark:text-slate-400",
						children: "Clinical context for personalized AI disease risk scoring."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
								id: "field-smoking",
								label: "Smoking Status",
								options: SMOKING_OPTIONS,
								selected: data.smokingStatus || "Never smoked",
								onChange: (val) => onChange({ smokingStatus: val })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
								id: "field-activity",
								label: "Physical Activity Level",
								options: PHYSICAL_ACTIVITY_OPTIONS,
								selected: data.physicalActivity || "Moderately active",
								onChange: (val) => onChange({ physicalActivity: val })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "field-sleep",
								className: "block text-xs font-semibold text-[#142033] dark:text-slate-200",
								children: "Sleep Duration (hrs / night)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "field-sleep",
								type: "number",
								min: 2,
								max: 18,
								value: data.sleepDurationHours || 7,
								onChange: (e) => onChange({ sleepDurationHours: e.target.value === "" ? void 0 : Number(e.target.value) }),
								placeholder: "e.g. 7",
								className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700/80 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2.5 px-3.5 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onBack,
					className: "inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-[#142033] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Back" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onNext,
					className: "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Continue to Symptoms & Wearable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
				})]
			})
		]
	});
}
function Step4SymptomsWearable({ data, onChange, onNext, onBack }) {
	const connectionState = useSensorStore((s) => s.connectionState);
	const liveBpm = useSensorStore((s) => s.bpm);
	const liveSpo2 = useSensorStore((s) => s.spo2);
	const liveTemp = useSensorStore((s) => s.temperature);
	const liveQuality = useSensorStore((s) => s.signalQuality);
	const lastPacketTime = useSensorStore((s) => s.lastPacketTime);
	const [hasCapturedWearable, setHasCapturedWearable] = (0, import_react.useState)(false);
	const hasAcuteSymptoms = (data.symptoms || []).some((s) => ACUTE_EMERGENCY_SYMPTOMS.includes(s));
	const handleCaptureVitals = () => {
		if (connectionState === "connected") {
			onChange({ wearableData: {
				connected: true,
				heartRate: liveBpm,
				spo2: liveSpo2,
				temperature: liveTemp,
				signalQuality: liveQuality,
				ppgStatus: liveQuality && liveQuality > 80 ? "Optimal Pulsatile Trace" : "Adequate",
				capturedAt: (/* @__PURE__ */ new Date()).toISOString()
			} });
			setHasCapturedWearable(true);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-slate-100 dark:border-slate-800 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Current Patient-Reported Symptoms" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#667085] dark:text-slate-400",
							children: "Select any symptoms experienced in the past 48 hours."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
							id: "field-symptoms",
							label: "Reported Cardiac & General Symptoms",
							options: SYMPTOMS_LIST,
							selected: data.symptoms || [],
							onChange: (val) => onChange({ symptoms: val }),
							isMulti: true,
							allowCustom: true,
							placeholder: "Search symptoms (e.g. Palpitations, Shortness of breath)...",
							helperText: "Multiple selections supported"
						}), data.symptoms?.includes("Other") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-xs font-semibold text-[#142033] dark:text-slate-200 mb-1",
								children: "Please describe your other symptoms:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 2,
								value: data.symptomsOther || "",
								onChange: (e) => onChange({ symptomsOther: e.target.value }),
								placeholder: "Specify other symptoms...",
								className: "w-full rounded-xl border border-[#D9E1EA] dark:border-slate-700 bg-[#F7F9FC] dark:bg-[#1A2639]/90 py-2 px-3 text-sm text-[#142033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:outline-none focus:border-[#FF6B00]"
							})]
						})]
					}),
					hasAcuteSymptoms && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "alert",
						className: "rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 animate-pulse" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-sm font-bold text-rose-700 dark:text-rose-300",
										children: "CRITICAL MEDICAL ATTENTION ADVISORY"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-rose-800 dark:text-rose-200 leading-relaxed",
										children: [
											"You have reported symptoms associated with acute coronary or hemodynamic distress (such as ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Chest discomfort" }),
											", ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Shortness of breath" }),
											", or ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Fainting" }),
											")."
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-white/80 dark:bg-rose-900/30 p-3 text-xs text-rose-900 dark:text-rose-100 font-medium space-y-1 border border-rose-200 dark:border-rose-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "🚨 If you are experiencing sudden crushing pressure, pain radiating to your left arm, jaw, or back, difficulty breathing, or dizziness:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-rose-700 dark:text-rose-300",
									children: "DO NOT WAIT FOR AN AI PREDICTION OR FINISH THIS FORM. Call emergency services immediately: 112 / 108 (India) or 911 (US) or go to the nearest emergency department."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 cursor-pointer pt-1 text-xs text-rose-800 dark:text-rose-300 font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: data.emergencyWarningAcknowledged || false,
									onChange: (e) => onChange({ emergencyWarningAcknowledged: e.target.checked }),
									className: "rounded border-rose-400 text-rose-600 accent-rose-600 h-4 w-4"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I have read this medical warning and understand the urgency of acute symptoms." })]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-slate-100 dark:border-slate-800 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-sm font-bold text-[#142033] dark:text-white flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ear-to-Heart Biosensor Wearable Integration" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${connectionState === "connected" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-2 rounded-full ${connectionState === "connected" ? "bg-emerald-500 animate-ping" : "bg-slate-400"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: connectionState === "connected" ? "Wearable Connected" : "Wearable Disconnected" })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#667085] dark:text-slate-400 mt-1",
						children: "Real hardware signals from your ESP32 photoplethysmography & ECG biosensor."
					})]
				}), connectionState === "connected" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold text-emerald-800 dark:text-emerald-300",
									children: "Live Sensor Stream Active (Web Serial API)"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[11px] font-mono text-[#667085] dark:text-slate-400 flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Last packet: ", lastPacketTime ? new Date(lastPacketTime).toLocaleTimeString() : "Just now"] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-white dark:bg-[#142033] p-3 border border-emerald-500/20 shadow-sm text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-mono uppercase text-[#667085] dark:text-slate-400 block",
										children: "Heart Rate"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xl font-bold text-[#FF6B00]",
										children: liveBpm !== null ? `${liveBpm} BPM` : "Reading..."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-white dark:bg-[#142033] p-3 border border-emerald-500/20 shadow-sm text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-mono uppercase text-[#667085] dark:text-slate-400 block",
										children: "Blood Oxygen"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xl font-bold text-emerald-600 dark:text-emerald-400",
										children: liveSpo2 !== null ? `${liveSpo2}%` : "Reading..."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-white dark:bg-[#142033] p-3 border border-emerald-500/20 shadow-sm text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-mono uppercase text-[#667085] dark:text-slate-400 block",
										children: "Temperature"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xl font-bold text-sky-600 dark:text-sky-400",
										children: liveTemp !== null ? `${liveTemp}°C` : "N/A"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-white dark:bg-[#142033] p-3 border border-emerald-500/20 shadow-sm text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-mono uppercase text-[#667085] dark:text-slate-400 block",
										children: "Signal Quality"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xl font-bold text-[#142033] dark:text-slate-100",
										children: liveQuality !== null ? `${liveQuality}%` : "95%"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-[#667085] dark:text-slate-400",
								children: data.wearableData?.capturedAt ? `Snapshot recorded at ${new Date(data.wearableData.capturedAt).toLocaleTimeString()}` : "Click below to lock current sensor telemetry into your baseline clinical profile."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleCaptureVitals,
								className: "inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Capture Current Vitals" })]
							})]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F7F9FC]/60 dark:bg-[#1A2639]/40 p-4 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-500",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-xs font-bold text-[#142033] dark:text-slate-200",
								children: "Hardware Biosensor Not Currently Streaming"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-[#667085] dark:text-slate-400 leading-relaxed",
								children: "Your physical ESP32 Ear-to-Heart biosensor is not connected on this browser session. You can complete your medical profile now, and plug in the sensor later on the Live Dashboard to stream real-time ECG and PPG."
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-[11px] text-[#667085] dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Zero simulated data rule enforced: No fake readings are recorded." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-slate-400",
							children: "Web Serial API Ready"
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onBack,
					className: "inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-[#142033] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Back" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onNext,
					className: "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Continue to Review & Submit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
				})]
			})
		]
	});
}
function Step5Review({ profile, contact, emergency, assessment, onJumpToStep, onSubmit, onBack }) {
	const [privacyConsent, setPrivacyConsent] = (0, import_react.useState)(false);
	const [consentError, setConsentError] = (0, import_react.useState)(false);
	const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
	const handleComplete = async () => {
		if (!privacyConsent) {
			setConsentError(true);
			return;
		}
		setConsentError(false);
		setIsSubmitting(true);
		try {
			await onSubmit(true);
		} finally {
			setIsSubmitting(false);
		}
	};
	const handleFinishLater = async () => {
		setIsSubmitting(true);
		try {
			await onSubmit(false);
		} finally {
			setIsSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-slate-100 dark:border-slate-800 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-bold text-[#142033] dark:text-white",
					children: "Review Clinical Profile & Health Assessment"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-[#667085] dark:text-slate-400",
					children: "Please review the summary below before completing your intake. You can edit any section at any time."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-bold text-[#142033] dark:text-white flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Personal Information" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => onJumpToStep(1),
									className: "inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8A00]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit" })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center overflow-hidden text-orange-500 font-bold shrink-0",
									children: profile.profilePhoto ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: profile.profilePhoto,
										alt: profile.fullName,
										className: "h-full w-full object-cover"
									}) : profile.fullName?.charAt(0) || "P"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold text-[#142033] dark:text-white",
									children: profile.fullName || "Not provided"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-[#667085] dark:text-slate-400",
									children: [
										profile.age ? `${profile.age} years old` : "Age not specified",
										" • ",
										profile.gender
									]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-[#667085] block",
										children: "Blood Group"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-[#142033] dark:text-slate-200",
										children: profile.bloodGroup || "Unknown"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-[#667085] block",
										children: "Height"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-[#142033] dark:text-slate-200",
										children: profile.heightCm ? `${profile.heightCm} cm` : "N/A"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-[#667085] block",
										children: "Weight"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-[#142033] dark:text-slate-200",
										children: profile.weightKg ? `${profile.weightKg} kg` : "N/A"
									})] })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-[#142033] dark:text-white flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contact Details" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onJumpToStep(2),
								className: "inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8A00]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit" })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Email:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-[#142033] dark:text-slate-200 font-mono",
										children: contact.email
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Mobile:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium text-[#142033] dark:text-slate-200 font-mono",
										children: [
											contact.countryCode,
											" ",
											contact.mobileNumber
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Location:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-[#142033] dark:text-slate-200",
										children: [
											contact.city,
											contact.state,
											contact.country
										].filter(Boolean).join(", ") || "Not specified"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Preferred:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium text-[#142033] dark:text-slate-200",
										children: [
											contact.preferredCommunication,
											" (",
											contact.preferredLanguage,
											")"
										]
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-[#142033] dark:text-white flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-rose-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Emergency Proxy" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onJumpToStep(2),
								className: "inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8A00]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit" })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Name:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-[#142033] dark:text-slate-200",
										children: emergency.contactName || "None provided"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Relationship:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-[#142033] dark:text-slate-200",
										children: emergency.relationship || "None"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Phone:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium text-[#142033] dark:text-slate-200 font-mono",
										children: [
											emergency.countryCode,
											" ",
											emergency.contactNumber
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium pt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Emergency Notification Consent Granted" })]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-[#142033] dark:text-white flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Vitals & Medical History" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onJumpToStep(3),
								className: "inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8A00]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit" })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Blood Pressure:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-[#142033] dark:text-slate-200",
										children: assessment.bloodPressureUnknown ? "Unknown" : assessment.bloodPressureSystolic && assessment.bloodPressureDiastolic ? `${assessment.bloodPressureSystolic}/${assessment.bloodPressureDiastolic} mmHg` : "Not recorded"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Conditions:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-[#142033] dark:text-slate-200 text-right max-w-[200px] truncate",
										children: assessment.medicalConditions?.length ? assessment.medicalConditions.join(", ") : "None reported"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Medications:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-[#142033] dark:text-slate-200 text-right max-w-[200px] truncate",
										children: assessment.currentMedications?.length ? assessment.currentMedications.map((m) => m.name).join(", ") : "None reported"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#667085]",
										children: "Lifestyle:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium text-[#142033] dark:text-slate-200",
										children: [
											assessment.smokingStatus,
											" • ",
											assessment.physicalActivity
										]
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-bold text-[#142033] dark:text-white flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reported Symptoms & Wearable Status" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onJumpToStep(4),
								className: "inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:text-[#FF8A00]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit" })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#667085] block mb-1",
								children: "Recent Symptoms:"
							}), assessment.symptoms?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: assessment.symptoms.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-[#142033] dark:text-slate-200 text-[11px]",
									children: s
								}, s))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-[#142033] dark:text-slate-200",
								children: "No current symptoms reported"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#667085] block mb-1",
								children: "Ear-Wearable Biosensor:"
							}), assessment.wearableData?.connected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 p-2 text-[11px] space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-emerald-700 dark:text-emerald-300 font-semibold block",
									children: "✓ Baseline Telemetry Recorded"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[#667085] dark:text-slate-300",
									children: [
										"BPM: ",
										assessment.wearableData.heartRate ?? "--",
										" • SpO₂: ",
										assessment.wearableData.spo2 ?? "--",
										"% • Temp: ",
										assessment.wearableData.temperature ?? "--",
										"°C"
									]
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-[#667085] dark:text-slate-400",
								children: "Hardware disconnected (Can be synchronized anytime on the Live Dashboard)"
							})] })]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-xs font-bold text-[#142033] dark:text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Patient Privacy & Healthcare Data Consent" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#667085] dark:text-slate-400 leading-relaxed",
						children: "Your personal health assessment, emergency contacts, and continuous cardiac telemetry data will be encrypted using 256-bit AES protocols and accessible only by your authenticated profile and authorized healthcare providers."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-2.5 cursor-pointer select-none pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: privacyConsent,
							onChange: (e) => {
								setPrivacyConsent(e.target.checked);
								if (consentError) setConsentError(false);
							},
							className: "mt-0.5 h-4 w-4 rounded border-slate-300 text-[#FF6B00] accent-[#FF6B00]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-[#142033] dark:text-slate-200 leading-relaxed",
							children: "I confirm that the health information provided is accurate to the best of my knowledge, and I consent to its secure storage for AI cardiac risk monitoring in accordance with the Privacy Policy."
						})]
					}),
					consentError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-semibold text-rose-500 pl-6",
						children: "Please acknowledge the clinical consent checkbox before completing your profile."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-2 flex flex-col sm:flex-row items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onBack,
					disabled: isSubmitting,
					className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-[#142033] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edit Information" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleFinishLater,
						disabled: isSubmitting,
						className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-[#667085] dark:text-slate-300 hover:bg-slate-50 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Save and Finish Later" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleComplete,
						disabled: isSubmitting,
						className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg transition-all disabled:opacity-60",
						children: isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-white" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Saving Profile..." })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Save and Complete" })] })
					})]
				})]
			})
		]
	});
}
function HealthAssessmentPage() {
	const navigate = useNavigate();
	const currentPatient = usePatientStore((s) => s.getCurrentPatient());
	const saveHealthAssessment = usePatientStore((s) => s.saveHealthAssessment);
	(0, import_react.useEffect)(() => {
		if (!currentPatient) {
			toast.error("Authentication required to access Patient Health Assessment.");
			navigate({ to: "/login" });
		}
	}, [currentPatient, navigate]);
	const [currentStep, setCurrentStep] = (0, import_react.useState)(1);
	const [viewMode, setViewMode] = (0, import_react.useState)("stepped");
	const [profile, setProfile] = (0, import_react.useState)({
		fullName: currentPatient?.profileData?.fullName || currentPatient?.name || "",
		dateOfBirth: currentPatient?.profileData?.dateOfBirth || "1970-01-01",
		age: currentPatient?.profileData?.age || currentPatient?.age || 35,
		gender: currentPatient?.profileData?.gender || currentPatient?.gender || "Male",
		bloodGroup: currentPatient?.profileData?.bloodGroup || currentPatient?.bloodType || "O+",
		heightCm: currentPatient?.profileData?.heightCm || 172,
		weightKg: currentPatient?.profileData?.weightKg || 68,
		profilePhoto: currentPatient?.profileData?.profilePhoto || currentPatient?.avatarUrl
	});
	const [contact, setContact] = (0, import_react.useState)({
		email: currentPatient?.contactData?.email || currentPatient?.email || "",
		emailVerified: currentPatient?.contactData?.emailVerified ?? true,
		mobileNumber: currentPatient?.contactData?.mobileNumber || "9876543210",
		countryCode: currentPatient?.contactData?.countryCode || "+91",
		alternateNumber: currentPatient?.contactData?.alternateNumber || "",
		alternateCountryCode: currentPatient?.contactData?.alternateCountryCode || "+91",
		city: currentPatient?.contactData?.city || "Bhubaneswar",
		state: currentPatient?.contactData?.state || "Odisha",
		country: currentPatient?.contactData?.country || "India",
		address: currentPatient?.contactData?.address || "",
		preferredCommunication: currentPatient?.contactData?.preferredCommunication || "Email",
		preferredLanguage: currentPatient?.contactData?.preferredLanguage || "English"
	});
	const [emergency, setEmergency] = (0, import_react.useState)({
		contactName: currentPatient?.emergencyData?.contactName || "",
		relationship: currentPatient?.emergencyData?.relationship || "Spouse",
		countryCode: currentPatient?.emergencyData?.countryCode || "+91",
		contactNumber: currentPatient?.emergencyData?.contactNumber || "",
		alternateNumber: currentPatient?.emergencyData?.alternateNumber || "",
		consentGranted: currentPatient?.emergencyData?.consentGranted ?? false
	});
	const [assessment, setAssessment] = (0, import_react.useState)({
		bloodPressureSystolic: currentPatient?.assessmentData?.bloodPressureSystolic,
		bloodPressureDiastolic: currentPatient?.assessmentData?.bloodPressureDiastolic,
		bloodPressureUnknown: currentPatient?.assessmentData?.bloodPressureUnknown ?? true,
		cholesterolTotal: currentPatient?.assessmentData?.cholesterolTotal,
		cholesterolLdl: currentPatient?.assessmentData?.cholesterolLdl,
		cholesterolHdl: currentPatient?.assessmentData?.cholesterolHdl,
		cholesterolTriglycerides: currentPatient?.assessmentData?.cholesterolTriglycerides,
		cholesterolUnit: currentPatient?.assessmentData?.cholesterolUnit || "mg/dL",
		cholesterolUnknown: currentPatient?.assessmentData?.cholesterolUnknown ?? true,
		medicalConditions: currentPatient?.assessmentData?.medicalConditions || [],
		currentMedications: currentPatient?.assessmentData?.currentMedications || [],
		familyHistory: currentPatient?.assessmentData?.familyHistory || [],
		allergies: currentPatient?.assessmentData?.allergies || [],
		smokingStatus: currentPatient?.assessmentData?.smokingStatus || "Never smoked",
		physicalActivity: currentPatient?.assessmentData?.physicalActivity || "Moderately active",
		sleepDurationHours: currentPatient?.assessmentData?.sleepDurationHours || 7,
		symptoms: currentPatient?.assessmentData?.symptoms || ["No current symptoms"],
		wearableData: currentPatient?.assessmentData?.wearableData,
		privacyConsentGranted: currentPatient?.assessmentData?.privacyConsentGranted ?? false
	});
	if (!currentPatient) return null;
	const handleSaveAndSubmit = async (markComplete) => {
		saveHealthAssessment(currentPatient.id, {
			profile,
			contact,
			emergency,
			assessment: {
				...assessment,
				completedAt: markComplete ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
				privacyConsentGranted: markComplete
			}
		}, markComplete);
		if (markComplete) {
			toast.success("Health Assessment & Profile Completed!", { description: "Your cardiac baseline has been updated. Opening real-time dashboard..." });
			navigate({ to: "/dashboard" });
		} else {
			toast.info("Progress saved successfully.", { description: "You may resume your health assessment anytime from settings." });
			navigate({ to: "/dashboard" });
		}
	};
	const stepsMeta = [
		{
			number: 1,
			title: "Personal Info",
			icon: User
		},
		{
			number: 2,
			title: "Contact Details",
			icon: Phone
		},
		{
			number: 3,
			title: "Medical History",
			icon: HeartPulse
		},
		{
			number: 4,
			title: "Symptoms & Wearable",
			icon: Activity
		},
		{
			number: 5,
			title: "Review & Submit",
			icon: CircleCheck
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-[#F3F6F9] dark:bg-[#0D1526] text-[#142033] dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-5 sm:p-6 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-[#FF6B00]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "h-3.5 w-3.5 fill-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ear-to-Heart Health Hub" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl sm:text-3xl font-bold tracking-tight text-[#142033] dark:text-white",
								children: "Patient Profile & Health Assessment"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs sm:text-sm text-[#667085] dark:text-slate-400",
								children: [
									"Patient: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-[#142033] dark:text-slate-200",
										children: currentPatient.name
									}),
									" ",
									"(",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-[#FF6B00]",
										children: currentPatient.id
									}),
									") • Complete your profile to unlock continuous AI cardiac risk telemetry."
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 self-end sm:self-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setViewMode("stepped"),
								className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${viewMode === "stepped" ? "bg-white dark:bg-[#142033] text-[#FF6B00] font-semibold shadow-sm" : "text-[#667085] hover:text-[#142033] dark:text-slate-400"}`,
								title: "Guided Step-by-Step Wizard",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Wizard" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setViewMode("comprehensive"),
								className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${viewMode === "comprehensive" ? "bg-white dark:bg-[#142033] text-[#FF6B00] font-semibold shadow-sm" : "text-[#667085] hover:text-[#142033] dark:text-slate-400"}`,
								title: "Unified Overview (Like Intake Form)",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "All Fields" })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => handleSaveAndSubmit(false),
							className: "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-[#142033] dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm",
							title: "Save current inputs to finish later",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5 text-[#FF6B00]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline",
								children: "Save Progress"
							})]
						})]
					})]
				}),
				viewMode === "stepped" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-4 shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0",
						children: stepsMeta.map((s, idx) => {
							s.icon;
							const isCompleted = currentStep > s.number;
							const isCurrent = currentStep === s.number;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setCurrentStep(s.number),
								className: `flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${isCurrent ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] text-white shadow-md shadow-orange-500/20" : isCompleted ? "bg-orange-500/10 text-[#FF6B00] hover:bg-orange-500/20" : "text-[#667085] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `flex h-6 w-6 items-center justify-center rounded-lg text-xs ${isCurrent ? "bg-white/20 text-white" : isCompleted ? "bg-[#FF6B00] text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`,
									children: isCompleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }) : s.number
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.title })]
							}), idx < stepsMeta.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 text-slate-300 dark:text-slate-700 shrink-0 hidden md:block" })] }, s.number);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#142033] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40",
					children: viewMode === "stepped" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						currentStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step1Personal, {
							data: profile,
							onChange: (patch) => setProfile((prev) => ({
								...prev,
								...patch
							})),
							onNext: () => setCurrentStep(2)
						}),
						currentStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step2Contact, {
							contactData: contact,
							emergencyData: emergency,
							onContactChange: (patch) => setContact((prev) => ({
								...prev,
								...patch
							})),
							onEmergencyChange: (patch) => setEmergency((prev) => ({
								...prev,
								...patch
							})),
							onNext: () => setCurrentStep(3),
							onBack: () => setCurrentStep(1)
						}),
						currentStep === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step3Medical, {
							data: assessment,
							onChange: (patch) => setAssessment((prev) => ({
								...prev,
								...patch
							})),
							onNext: () => setCurrentStep(4),
							onBack: () => setCurrentStep(2)
						}),
						currentStep === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step4SymptomsWearable, {
							data: assessment,
							onChange: (patch) => setAssessment((prev) => ({
								...prev,
								...patch
							})),
							onNext: () => setCurrentStep(5),
							onBack: () => setCurrentStep(3)
						}),
						currentStep === 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step5Review, {
							profile,
							contact,
							emergency,
							assessment,
							onJumpToStep: (step) => setCurrentStep(step),
							onSubmit: handleSaveAndSubmit,
							onBack: () => setCurrentStep(4)
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-bold text-[#142033] dark:text-white mb-1",
								children: "Comprehensive Patient Health Record"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-[#667085] dark:text-slate-400",
								children: "All clinical fields visible in one intake view. You can save at any time."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "text-sm font-bold text-[#FF6B00] flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1. Personal Information" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step1Personal, {
									data: profile,
									onChange: (patch) => setProfile((prev) => ({
										...prev,
										...patch
									})),
									onNext: () => {}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "text-sm font-bold text-[#FF6B00] flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2. Contact & Emergency Proxy Details" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step2Contact, {
									contactData: contact,
									emergencyData: emergency,
									onContactChange: (patch) => setContact((prev) => ({
										...prev,
										...patch
									})),
									onEmergencyChange: (patch) => setEmergency((prev) => ({
										...prev,
										...patch
									})),
									onNext: () => {},
									onBack: () => {}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "text-sm font-bold text-[#FF6B00] flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3. Vitals & Medical History" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step3Medical, {
									data: assessment,
									onChange: (patch) => setAssessment((prev) => ({
										...prev,
										...patch
									})),
									onNext: () => {},
									onBack: () => {}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "text-sm font-bold text-[#FF6B00] flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "4. Reported Symptoms & Wearable Baseline" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step4SymptomsWearable, {
									data: assessment,
									onChange: (patch) => setAssessment((prev) => ({
										...prev,
										...patch
									})),
									onNext: () => {},
									onBack: () => {}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "text-sm font-bold text-[#FF6B00] flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "5. Review & Final Confirmation" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step5Review, {
									profile,
									contact,
									emergency,
									assessment,
									onJumpToStep: (step) => {
										setViewMode("stepped");
										setCurrentStep(step);
									},
									onSubmit: handleSaveAndSubmit,
									onBack: () => {}
								})]
							})
						]
					})
				})
			]
		})
	});
}
var SplitComponent = HealthAssessmentPage;
//#endregion
export { SplitComponent as component };
