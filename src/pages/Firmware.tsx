import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MedicalDisclaimer } from "@/components/dashboard/MedicalDisclaimer";

const WIRING: Array<[string, string, string]> = [
  ["AD8232 OUTPUT", "GPIO 34 (ADC1_CH6)", "ECG analog signal, input-only pin"],
  ["AD8232 LO+", "GPIO 32", "Lead-off detect (positive)"],
  ["AD8232 LO-", "GPIO 33", "Lead-off detect (negative)"],
  ["AD8232 3.3V / GND", "3.3V / GND", "Never power from 5V"],
  ["MAX30102 SDA", "GPIO 21", "Shared I²C bus"],
  ["MAX30102 SCL", "GPIO 22", "Shared I²C bus"],
  ["BMI323 SDA", "GPIO 21", "Same I²C bus, address 0x68"],
  ["BMI323 SCL", "GPIO 22", "Same I²C bus"],
  ["LM35 VOUT", "GPIO 35 (ADC1_CH7)", "10 mV/°C, add 100 nF to GND"],
  ["LM35 VCC / GND", "5V (or 3.3V) / GND", "Common ground with the ESP32"],
];

const SKETCH = String.raw`/*
 * ESP32 Real-Time Health Monitor firmware
 * Sensors : AD8232 (ECG)  |  MAX30102 (PPG/SpO2)  |  BMI323 (6-DoF IMU)  |  LM35 (temperature)
 * Output  : labelled key:value lines over USB Serial @115200 AND over WiFi WebSocket :81
 *
 * Libraries (Arduino Library Manager):
 *   SparkFun MAX3010x Pulse and Proximity Sensor Library
 *   SparkFun BMI323 Arduino Library
 *   WebSockets by Markus Sattler (arduinoWebSockets)
 *
 * The sketch NEVER prints a value it did not measure. If a sensor is missing,
 * its field is simply absent from the line and the dashboard shows "--".
 */

#include <Wire.h>
#include <WiFi.h>
#include <WebSocketsServer.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"
#include "SparkFun_BMI323.h"

// ---------------- USER CONFIG ----------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const bool  ENABLE_WIFI   = true;      // set false for USB-serial only

#define ECG_PIN     34                 // AD8232 OUTPUT
#define ECG_LO_P    32
#define ECG_LO_N    33
#define LM35_PIN    35                 // LM35 VOUT
#define ECG_SAMPLE_HZ   250            // ECG sampling rate
#define VITALS_PERIOD_MS 1000          // BPM / SpO2 / temp / IMU cadence
// ---------------------------------------------

MAX30105 ppg;
BMI323   imu;
WebSocketsServer webSocket(81);

bool ppgReady = false;
bool imuReady = false;

// SpO2 / HR computation buffers (100 Hz, 4 s window)
#define PPG_BUF 100
uint32_t irBuffer[PPG_BUF];
uint32_t redBuffer[PPG_BUF];
int  ppgIndex = 0;
int32_t spo2Value = 0;   int8_t spo2Valid = 0;
int32_t hrValue   = 0;   int8_t hrValid   = 0;

unsigned long lastEcgUs = 0;
unsigned long lastVitalsMs = 0;

// LM35: 10 mV per degree C. The ESP32 ADC is 12-bit over ~3.3 V with 11 dB
// attenuation. Averaging 16 reads removes most of the ADC noise.
float readLM35C() {
  uint32_t sum = 0;
  for (int i = 0; i < 16; i++) { sum += analogRead(LM35_PIN); delayMicroseconds(200); }
  float counts = sum / 16.0f;
  float millivolts = (counts / 4095.0f) * 3300.0f;   // ADC full scale in mV
  return millivolts / 10.0f;                          // 10 mV/degC
}

void emit(const String& line) {
  Serial.println(line);
  if (ENABLE_WIFI) webSocket.broadcastTXT(line);
}

void onWsEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t len) {
  if (type == WStype_CONNECTED) {
    Serial.printf("WS client %u connected\n", num);
  }
}

void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(ECG_LO_P, INPUT);
  pinMode(ECG_LO_N, INPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(ECG_PIN,  ADC_11db);
  analogSetPinAttenuation(LM35_PIN, ADC_11db);

  Wire.begin(21, 22);
  Wire.setClock(400000);

  // --- MAX30102 ---
  if (ppg.begin(Wire, I2C_SPEED_FAST)) {
    // ledBrightness, sampleAverage, ledMode(2=Red+IR), sampleRate, pulseWidth, adcRange
    ppg.setup(0x1F, 4, 2, 100, 411, 4096);
    ppgReady = true;
    Serial.println("STATUS: MAX30102 OK");
  } else {
    Serial.println("STATUS: MAX30102 NOT FOUND");
  }

  // --- BMI323 ---
  if (imu.beginI2C(BMI323_ADDRESS_LOW) == BMI323_OK) {
    imuReady = true;
    Serial.println("STATUS: BMI323 OK");
  } else {
    Serial.println("STATUS: BMI323 NOT FOUND");
  }

  // --- WiFi + WebSocket ---
  if (ENABLE_WIFI) {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("STATUS: WiFi connecting");
    unsigned long t0 = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) {
      delay(300); Serial.print(".");
    }
    Serial.println();
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("STATUS: WiFi connected, websocket url ws://");
      Serial.print(WiFi.localIP());
      Serial.println(":81");
      webSocket.begin();
      webSocket.onEvent(onWsEvent);
    } else {
      Serial.println("STATUS: WiFi FAILED - serial only");
    }
  }
}

void loop() {
  if (ENABLE_WIFI) webSocket.loop();

  // ---------- ECG at a fixed rate ----------
  const unsigned long ecgPeriodUs = 1000000UL / ECG_SAMPLE_HZ;
  if (micros() - lastEcgUs >= ecgPeriodUs) {
    lastEcgUs = micros();
    bool leadOff = (digitalRead(ECG_LO_P) == HIGH) || (digitalRead(ECG_LO_N) == HIGH);
    if (leadOff) {
      // Electrodes are off the body: report the condition, print NO ecg value.
      emit(String("timestamp:") + millis() + ",leadoff:1");
    } else {
      int ecg = analogRead(ECG_PIN);
      emit(String("timestamp:") + millis() + ",ecg:" + ecg + ",leadoff:0");
    }
  }

  // ---------- PPG streaming + SpO2 ----------
  if (ppgReady && ppg.available()) {
    uint32_t ir  = ppg.getIR();
    uint32_t red = ppg.getRed();
    ppg.nextSample();

    // Only stream PPG when a finger is actually present.
    if (ir > 50000) {
      emit(String("timestamp:") + millis() + ",ir:" + ir + ",red:" + red);
      irBuffer[ppgIndex]  = ir;
      redBuffer[ppgIndex] = red;
      ppgIndex++;
      if (ppgIndex >= PPG_BUF) {
        ppgIndex = 0;
        maxim_heart_rate_and_oxygen_saturation(
          irBuffer, PPG_BUF, redBuffer,
          &spo2Value, &spo2Valid, &hrValue, &hrValid);
      }
    } else {
      ppgIndex = 0;
      spo2Valid = 0; hrValid = 0;   // no finger -> no vitals, never a stale value
    }
  }

  // ---------- Vitals, temperature, IMU ----------
  if (millis() - lastVitalsMs >= VITALS_PERIOD_MS) {
    lastVitalsMs = millis();

    String line = String("timestamp:") + millis();
    bool any = false;

    if (hrValid && hrValue > 20 && hrValue < 250)      { line += ",bpm:"  + String(hrValue);   any = true; }
    if (spo2Valid && spo2Value >= 50 && spo2Value <= 100) { line += ",spo2:" + String(spo2Value); any = true; }

    float tempC = readLM35C();
    if (tempC > 10.0f && tempC < 60.0f) { line += ",temp:" + String(tempC, 2); any = true; }

    if (imuReady) {
      imu.getSensorData();
      // SparkFun BMI323 returns g and deg/s in .data
      line += ",ax:" + String(imu.data.accelX, 3);
      line += ",ay:" + String(imu.data.accelY, 3);
      line += ",az:" + String(imu.data.accelZ, 3);
      line += ",gx:" + String(imu.data.gyroX, 2);
      line += ",gy:" + String(imu.data.gyroY, 2);
      line += ",gz:" + String(imu.data.gyroZ, 2);
      any = true;
    }

    if (any) emit(line);
  }
}
`;

const CHECKLIST: Array<[string, string]> = [
  [
    "1. Set the firmware scaling to 1",
    "This sketch prints true BPM and SpO₂ values (not halved for the Serial Plotter). Open Settings and set both plotter scale factors to 1, otherwise the dashboard doubles them.",
  ],
  [
    "2. Verify ECG",
    "Diagnostics → Raw serial console must show `ecg:` values that move with your heartbeat, and `leadoff:0`. A flat 0 or 4095 means an electrode is loose.",
  ],
  [
    "3. Verify PPG and SpO₂",
    "Place a finger on the MAX30102. `ir:` should jump above 50000 and `bpm:`/`spo2:` lines start appearing after ~4 seconds.",
  ],
  [
    "4. Verify LM35",
    "The temperature card should read close to skin temperature (30–36 °C on the finger, ~22 °C in air). A value pinned near 0 or 60 means the ADC pin or ground is wrong.",
  ],
  [
    "5. Verify BMI323",
    "At rest the accelerometer magnitude must be ≈ 1.00 g and the gyroscope near 0 °/s. Tilt the board — the axes must respond immediately.",
  ],
  [
    "6. Verify WiFi",
    "The serial monitor prints `ws://<ip>:81`. Paste that URL in Settings, switch the transport to WebSocket and connect — the same readings must appear without USB.",
  ],
];

export function Firmware() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(SKETCH);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-lg font-semibold">ESP32 firmware — ECG + PPG + LM35 + BMI323 + WiFi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload this sketch to the ESP32. It streams every sensor as labelled{" "}
          <code className="font-mono">key:value</code> lines that this dashboard parses directly, over USB
          serial at 115200 baud and simultaneously over a WiFi WebSocket on port 81.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Wiring</h2>
        <table className="mt-3 w-full text-left font-mono text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-1">Sensor pin</th>
              <th className="py-1">ESP32</th>
              <th className="py-1">Notes</th>
            </tr>
          </thead>
          <tbody>
            {WIRING.map(([a, b, c]) => (
              <tr key={a} className="border-t border-border">
                <td className="py-1.5">{a}</td>
                <td className="py-1.5">{b}</td>
                <td className="py-1.5 text-muted-foreground">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Arduino sketch</h2>
          <Button size="sm" variant="secondary" onClick={copy}>
            {copied ? "Copied" : "Copy sketch"}
          </Button>
        </header>
        <pre className="mt-3 max-h-[32rem] overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs">
          {SKETCH}
        </pre>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Accuracy checklist — run this after flashing</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {CHECKLIST.map(([title, body]) => (
            <li key={title} className="rounded-lg border border-border bg-background p-3">
              <p className="font-medium">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <MedicalDisclaimer />
    </div>
  );
}