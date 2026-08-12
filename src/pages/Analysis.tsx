import { RiskPanel } from "@/components/dashboard/analysis/RiskPanel";
import { ConnectionBar } from "@/components/dashboard/connection/ConnectionBar";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";

export function Analysis() {
  return (
    <div className="space-y-4">
      <ConnectionBar />
      <h1 className="sr-only">Heart disease risk analysis</h1>
      <RiskPanel />
      <MedicalDisclaimer />
    </div>
  );
}