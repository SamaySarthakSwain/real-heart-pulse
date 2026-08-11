import { useSensorStore, type SensorState } from "@/store/sensorStore";

/** Read a slice of the single source of truth. Components never touch the port. */
export function useSensorData<T>(selector: (state: SensorState) => T): T {
  return useSensorStore(selector);
}