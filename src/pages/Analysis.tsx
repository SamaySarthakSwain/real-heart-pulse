import { RiskPanel } from "@/components/dashboard/analysis/RiskPanel";
import { ConnectionBar } from "@/components/dashboard/connection/ConnectionBar";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";
import { GeminiCopilotPanel } from "@/components/dashboard/copilot/GeminiCopilotPanel";

export function Analysis() {
  return (
    <div className="space-y-5">
      <ConnectionBar />
      <h1 className="sr-only">Heart disease risk analysis</h1>
      <GeminiCopilotPanel />
      <RiskPanel />
      <MedicalDisclaimer />
    </div>
  );
}
