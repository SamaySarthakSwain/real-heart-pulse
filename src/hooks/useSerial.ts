import { useSensorStore } from "@/store/sensorStore";
import { isWebSerialSupported } from "@/services/serial/serialTransport";

export function useSerial() {
  const connect = useSensorStore((s) => s.connect);
  const disconnect = useSensorStore((s) => s.disconnect);
  const connectionState = useSensorStore((s) => s.connectionState);
  return { connect, disconnect, connectionState, supported: isWebSerialSupported() };
}