export function MedicalDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-status-warn/25 bg-status-warn/5 px-4 py-3.5 transition-colors duration-300">
      {/* Medical cross icon */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-status-warn"
      >
        <path d="M11 2a1 1 0 0 1 2 0v4h4a1 1 0 0 1 0 2h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4V2Z" />
        <path d="M4.929 19.071a10 10 0 1 1 14.142-14.142A10 10 0 0 1 4.93 19.07Z" />
      </svg>
      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="font-semibold text-status-warn">Research &amp; monitoring use only.</span>{" "}
        Sensor measurements may require calibration and clinical validation and should not be used
        as a substitute for professional medical diagnosis or treatment.
      </p>
    </div>
  );
}