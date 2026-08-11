import { useSensorStore } from "@/store/sensorStore";

export function useConnection() {
  return useSensorStore((s) => ({
    connectionState: s.connectionState,
    dataState: s.dataState,
    deviceName: s.deviceName,
    transportType: s.transportType,
    lastError: s.lastError,
  }));
}