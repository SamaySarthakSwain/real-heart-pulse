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
 ============================================================
 ESP32 REAL-TIME HEALTH MONITOR
 ============================================================

 HARDWARE
 --------
 ESP32
 AD8232       -> ECG
 MAX30102     -> PPG / BPM / SpO2
 BMI323       -> Accelerometer + Gyroscope
 LM35         -> Temperature
 SSD1306      -> OLED 128x64

 BMI323 LIBRARY
 --------------
 7Semi BMI323

 IMPORTANT:
 DO NOT use SparkFun_BMI323.h

 ============================================================
*/

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <WebSocketsServer.h>

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include <MAX30105.h>
#include "spo2_algorithm.h"
#include "heartRate.h"

#include <7Semi_BMI323.h>


// ============================================================
// WIFI
// ============================================================

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const bool ENABLE_WIFI = true;


// ============================================================
// I2C
// ============================================================

#define SDA_PIN 21
#define SCL_PIN 22


// ============================================================
// ECG - AD8232
// ============================================================

#define ECG_PIN 34
#define ECG_LO_P 32
#define ECG_LO_N 33

#define ECG_SAMPLE_HZ 250
#define ECG_PERIOD_US (1000000UL / ECG_SAMPLE_HZ)


// ============================================================
// LM35
// ============================================================

#define LM35_PIN 35


// ============================================================
// OLED
// ============================================================

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_ADDRESS 0x3C

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  -1
);

bool oledReady = false;


// ============================================================
// BMI323
// ============================================================

BMI323_7Semi imu;

bool bmiReady = false;


// ============================================================
// MAX30102
// ============================================================

MAX30105 max30102;

bool max30102Ready = false;


// ============================================================
// WEBSOCKET
// ============================================================

WebSocketsServer webSocket(81);


// ============================================================
// ECG VARIABLES
// ============================================================

int ecgRaw = 0;

float ecgBaseline = 0;
float ecgFiltered = 0;

bool ecgLeadOff = true;

float ecgBPM = 0;

unsigned long lastECGUs = 0;
unsigned long lastRPeak = 0;

uint32_t rrInterval = 0;

bool ecgPeakState = false;


// ============================================================
// HRV
// ============================================================

#define RR_BUFFER_SIZE 20

uint32_t rrBuffer[RR_BUFFER_SIZE];

uint8_t rrCount = 0;
uint8_t rrIndex = 0;

float meanRR = 0;
float sdnn = 0;
float rmssd = 0;


// ============================================================
// MAX30102
// ============================================================

#define PPG_BUFFER_SIZE 100

uint32_t irBuffer[PPG_BUFFER_SIZE];
uint32_t redBuffer[PPG_BUFFER_SIZE];

uint16_t ppgBufferCount = 0;

uint32_t irValue = 0;
uint32_t redValue = 0;

bool fingerPresent = false;

int32_t spo2 = 0;
int8_t spo2Valid = 0;

int32_t ppgBPM = 0;
int8_t ppgBPMValid = 0;

float ppgAC = 0;
float ppgDC = 0;

float pulseAmplitude = 0;
float perfusionIndex = 0;


// ============================================================
// TEMPERATURE
// ============================================================

float temperatureC = 0;

float max30102Temperature = 0;
bool max30102TemperatureValid = false;


// ============================================================
// BMI323 DATA
// ============================================================

float ax = 0;
float ay = 0;
float az = 0;

float gx = 0;
float gy = 0;
float gz = 0;

float bmiTemperature = 0;

float accelerationMagnitude = 0;
float gyroMagnitude = 0;

float pitch = 0;
float roll = 0;

String motionState = "STABLE";


// ============================================================
// TIMERS
// ============================================================

unsigned long lastVitals = 0;
unsigned long lastIMU = 0;
unsigned long lastOLED = 0;
unsigned long lastOLEDPage = 0;

uint8_t oledPage = 0;


// ============================================================
// OUTPUT FUNCTION
// ============================================================

void emitData(String data)
{
  Serial.println(data);

  if (
    ENABLE_WIFI &&
    WiFi.status() == WL_CONNECTED
  )
  {
    webSocket.broadcastTXT(data);
  }
}


// ============================================================
// WEBSOCKET EVENT
// ============================================================

void webSocketEvent(
  uint8_t client,
  WStype_t type,
  uint8_t* payload,
  size_t length
)
{
  if (type == WStype_CONNECTED)
  {
    Serial.print("WebSocket client connected: ");
    Serial.println(client);
  }

  if (type == WStype_DISCONNECTED)
  {
    Serial.print("WebSocket client disconnected: ");
    Serial.println(client);
  }
}


// ============================================================
// ECG PROCESSING
// ============================================================

float filterECG(int raw)
{
  /*
    Simple DC removal.
  */

  ecgBaseline =
    0.995f * ecgBaseline +
    0.005f * raw;

  return raw - ecgBaseline;
}


// ============================================================
// HRV CALCULATION
// ============================================================

void calculateHRV()
{
  if (rrCount < 2)
    return;


  float sum = 0;

  for (
    int i = 0;
    i < rrCount;
    i++
  )
  {
    sum += rrBuffer[i];
  }


  meanRR =
    sum / rrCount;


  // SDNN

  float variance = 0;

  for (
    int i = 0;
    i < rrCount;
    i++
  )
  {
    float difference =
      rrBuffer[i] - meanRR;

    variance +=
      difference * difference;
  }


  sdnn =
    sqrt(
      variance / rrCount
    );


  // RMSSD

  if (rrCount >= 2)
  {
    float diffSum = 0;
    int pairs = 0;

    for (
      int i = 1;
      i < rrCount;
      i++
    )
    {
      float difference =
        rrBuffer[i] -
        rrBuffer[i - 1];

      diffSum +=
        difference * difference;

      pairs++;
    }

    if (pairs > 0)
    {
      rmssd =
        sqrt(
          diffSum / pairs
        );
    }
  }
}


// ============================================================
// ECG PEAK DETECTION
// ============================================================

void detectRPeak(float signal)
{
  static float envelope = 0;

  envelope =
    0.98f * envelope +
    0.02f * fabs(signal);


  float threshold =
    max(
      30.0f,
      envelope * 1.5f
    );


  unsigned long now =
    millis();


  if (
    signal > threshold &&
    !ecgPeakState
  )
  {
    ecgPeakState = true;


    if (lastRPeak > 0)
    {
      uint32_t rr =
        now - lastRPeak;


      /*
        Accept 30-200 BPM range.
      */

      if (
        rr >= 300 &&
        rr <= 2000
      )
      {
        rrInterval = rr;


        ecgBPM =
          60000.0f / rr;


        rrBuffer[rrIndex] =
          rr;


        rrIndex =
          (rrIndex + 1) %
          RR_BUFFER_SIZE;


        if (
          rrCount <
          RR_BUFFER_SIZE
        )
        {
          rrCount++;
        }


        calculateHRV();
      }
    }


    lastRPeak =
      now;
  }


  if (
    signal <
    threshold * 0.5f
  )
  {
    ecgPeakState = false;
  }
}


// ============================================================
// ECG SAMPLE
// ============================================================

void sampleECG()
{
  unsigned long now =
    micros();


  if (
    now - lastECGUs <
    ECG_PERIOD_US
  )
  {
    return;
  }


  lastECGUs =
    now;


  ecgLeadOff =
    (
      digitalRead(ECG_LO_P) == HIGH
    )
    ||
    (
      digitalRead(ECG_LO_N) == HIGH
    );


  if (ecgLeadOff)
  {
    ecgRaw = 0;
    ecgFiltered = 0;
    return;
  }


  ecgRaw =
    analogRead(ECG_PIN);


  ecgFiltered =
    filterECG(ecgRaw);


  detectRPeak(
    ecgFiltered
  );

  // Stream high-frequency ECG JSON mapped perfectly to Dashboard 'ecg'
  char buf[32];
  snprintf(buf, sizeof(buf), "{\"ecg\":%d}", ecgRaw);
  emitData(buf);
}


// ============================================================
// MAX30102
// ============================================================

void processMAX30102()
{
  if (!max30102Ready)
    return;


  max30102.check();


  while (
    max30102.available()
  )
  {
    irValue =
      max30102.getIR();


    redValue =
      max30102.getRed();


    max30102.nextSample();


    // Finger detection

    fingerPresent =
      irValue > 50000;


    if (!fingerPresent)
    {
      ppgBufferCount = 0;

      spo2Valid = 0;
      ppgBPMValid = 0;

      spo2 = 0;
      ppgBPM = 0;

      ppgAC = 0;
      ppgDC = 0;

      pulseAmplitude = 0;
      perfusionIndex = 0;

      return;
    }

    // Stream high-frequency PPG metrics immediately for waveforms
    char ppgBuf[64];
    snprintf(ppgBuf, sizeof(ppgBuf), "{\"ir\":%lu,\"red\":%lu}", (unsigned long)irValue, (unsigned long)redValue);
    emitData(ppgBuf);


    // Store PPG sample

    if (
      ppgBufferCount <
      PPG_BUFFER_SIZE
    )
    {
      irBuffer[
        ppgBufferCount
      ] =
        irValue;


      redBuffer[
        ppgBufferCount
      ] =
        redValue;


      ppgBufferCount++;
    }


    // Calculate

    if (
      ppgBufferCount >=
      PPG_BUFFER_SIZE
    )
    {
      maxim_heart_rate_and_oxygen_saturation(
        irBuffer,
        PPG_BUFFER_SIZE,
        redBuffer,
        &spo2,
        &spo2Valid,
        &ppgBPM,
        &ppgBPMValid
      );


      calculatePPGFeatures();


      // Rolling buffer

      for (
        int i = 25;
        i < PPG_BUFFER_SIZE;
        i++
      )
      {
        irBuffer[i - 25] =
          irBuffer[i];

        redBuffer[i - 25] =
          redBuffer[i];
      }


      ppgBufferCount = 75;
    }
  }
}


// ============================================================
// PPG FEATURES
// ============================================================

void calculatePPGFeatures()
{
  uint32_t minIR =
    irBuffer[0];

  uint32_t maxIR =
    irBuffer[0];


  double sum = 0;


  for (
    int i = 0;
    i < PPG_BUFFER_SIZE;
    i++
  )
  {
    if (
      irBuffer[i] <
      minIR
    )
    {
      minIR =
        irBuffer[i];
    }


    if (
      irBuffer[i] >
      maxIR
    )
    {
      maxIR =
        irBuffer[i];
    }


    sum +=
      irBuffer[i];
  }


  ppgDC =
    sum /
    PPG_BUFFER_SIZE;


  ppgAC =
    maxIR -
    minIR;


  pulseAmplitude =
    ppgAC;


  if (
    ppgDC > 0
  )
  {
    perfusionIndex =
      (
        ppgAC /
        ppgDC
      ) * 100.0f;
  }
}


// ============================================================
// MAX30102 TEMPERATURE
// ============================================================

void readMAX30102Temperature()
{
  if (!max30102Ready)
    return;


  max30102Temperature =
    max30102.readTemperature();


  if (
    max30102Temperature > -20 &&
    max30102Temperature < 100
  )
  {
    max30102TemperatureValid =
      true;
  }
  else
  {
    max30102TemperatureValid =
      false;
  }
}


// ============================================================
// BMI323
// ============================================================

void readBMI323()
{
  if (!bmiReady)
    return;


  /*
    7Semi BMI323 API:

    readAccel(x,y,z)
    readGyro(x,y,z)
  */

  bool accelOK =
    imu.readAccel(
      ax,
      ay,
      az
    );


  bool gyroOK =
    imu.readGyro(
      gx,
      gy,
      gz
    );


  if (
    !accelOK ||
    !gyroOK
  )
  {
    return;
  }

  // Stream high-frequency IMU tracking mapped accurately to React 'accelX' etc.
  char imuBuf[128];
  snprintf(imuBuf, sizeof(imuBuf), 
    "{\"ax\":%.2f,\"ay\":%.2f,\"az\":%.2f,\"gx\":%.0f,\"gy\":%.0f,\"gz\":%.0f}", 
    ax, ay, az, gx, gy, gz);
  emitData(imuBuf);


  // ------------------------------------------
  // Acceleration magnitude
  // ------------------------------------------

  accelerationMagnitude =
    sqrt(
      ax * ax +
      ay * ay +
      az * az
    );


  // ------------------------------------------
  // Gyroscope magnitude
  // ------------------------------------------

  gyroMagnitude =
    sqrt(
      gx * gx +
      gy * gy +
      gz * gz
    );


  // ------------------------------------------
  // Orientation
  // ------------------------------------------

  pitch =
    atan2(
      ax,
      sqrt(
        ay * ay +
        az * az
      )
    )
    *
    180.0f /
    PI;


  roll =
    atan2(
      ay,
      sqrt(
        ax * ax +
        az * az
      )
    )
    *
    180.0f /
    PI;


  // ------------------------------------------
  // Motion state
  // ------------------------------------------

  float gravityDifference =
    fabs(
      accelerationMagnitude -
      1.0f
    );


  if (
    gravityDifference < 0.05f &&
    gyroMagnitude < 5.0f
  )
  {
    motionState =
      "STABLE";
  }
  else if (
    gravityDifference < 0.20f &&
    gyroMagnitude < 30.0f
  )
  {
    motionState =
      "LIGHT";
  }
  else
  {
    motionState =
      "ACTIVE";
  }


  // BMI323 temperature

  float temp;

  if (
    imu.getTemperature(temp)
  )
  {
    bmiTemperature =
      temp;
  }
}


// ============================================================
// LM35
// ============================================================

float readLM35()
{
  uint32_t sum = 0;


  for (
    int i = 0;
    i < 16;
    i++
  )
  {
    sum +=
      analogRead(
        LM35_PIN
      );

    delayMicroseconds(100);
  }


  float adc =
    sum / 16.0f;


  float millivolts =
    (
      adc /
      4095.0f
    )
    *
    3300.0f;


  return
    millivolts /
    10.0f;
}


// ============================================================
// VITAL OUTPUTS (1 Hz Packets)
// ============================================================

void sendVitals()
{
  String json = "{";


  json +=
    "\"timestamp\":" +
    String(millis());

  // Must output Boolean indicators as 1 or 0 integers for the parser to handle them reliably
  json +=
    ",\"leadoff\":" +
    String(
      ecgLeadOff ? "1" : "0"
    );

  // LM35 Temperature - correctly mapped to "temperature"
  if (
    temperatureC > 10 &&
    temperatureC < 60
  )
  {
    json +=
      ",\"temperature\":" +
      String(
        temperatureC,
        2
      );
  }

  // Combine PPG / ECG BPM into the universally mapped "bpm"
  int currentBpm = 0;
  if (fingerPresent && ppgBPMValid && ppgBPM > 0) {
    currentBpm = ppgBPM;
  } else if (!ecgLeadOff && ecgBPM > 0) {
    currentBpm = (int)ecgBPM;
  }

  if (currentBpm > 0)
  {
    // Important: React defaults to 'plotterScaleBpm: 2' (scales up by 2 to fit Arduino Plotter screens)
    // We divide by 2 so when the dashboard multiplies by 2, it receives the exact accurate value.
    json += ",\"bpm\":" + String(currentBpm / 2.0f, 1);
  }


  if (fingerPresent && spo2Valid)
  {
    // Same rule for SpO2 to prevent 98% validating incorrectly as 196% SpO2 (causing a Validation Error)
    json += ",\"spo2\":" + String(spo2 / 2.0f, 1);
  }


  // ==============================================
  // EXTRA / DEBUG JSON FOR OLED OR BACKUP USAGE
  // ==============================================

  if (
    !ecgLeadOff &&
    ecgBPM > 0
  )
  {
    json +=
      ",\"ecg_bpm\":" +
      String(
        ecgBPM,
        1
      );
  }


  if (
    rrInterval > 0
  )
  {
    json +=
      ",\"rr_ms\":" +
      String(rrInterval);
  }


  if (
    rrCount >= 2
  )
  {
    json +=
      ",\"hrv_sdnn\":" +
      String(
        sdnn,
        2
      );


    json +=
      ",\"hrv_rmssd\":" +
      String(
        rmssd,
        2
      );
  }


  if (fingerPresent)
  {
    json +=
      ",\"ppg_ac\":" +
      String(
        ppgAC,
        2
      );


    json +=
      ",\"ppg_dc\":" +
      String(
        ppgDC,
        2
      );


    json +=
      ",\"pulse_amplitude\":" +
      String(
        pulseAmplitude,
        2
      );


    json +=
      ",\"perfusion_index\":" +
      String(
        perfusionIndex,
        3
      );


    if (
      ppgBPMValid
    )
    {
      json +=
        ",\"ppg_bpm\":" +
        String(ppgBPM);
    }
  }


  if (
    max30102TemperatureValid
  )
  {
    json +=
      ",\"max30102_temp\":" +
      String(
        max30102Temperature,
        2
      );
  }


  if (bmiReady)
  {
    json +=
      ",\"acceleration_magnitude\":" +
      String(
        accelerationMagnitude,
        4
      );


    json +=
      ",\"gyro_magnitude\":" +
      String(
        gyroMagnitude,
        3
      );


    json +=
      ",\"pitch\":" +
      String(
        pitch,
        2
      );


    json +=
      ",\"roll\":" +
      String(
        roll,
        2
      );


    json +=
      ",\"bmi_temperature\":" +
      String(
        bmiTemperature,
        2
      );


    json +=
      ",\"motion\":\"" +
      motionState +
      "\"";
  }


  json += "}";


  emitData(json);
}


// ============================================================
// OLED HEADER
// ============================================================

void oledHeader(
  const char* title
)
{
  display.clearDisplay();

  display.setTextColor(
    SSD1306_WHITE
  );

  display.setTextSize(1);

  display.setCursor(
    0,
    0
  );

  display.println(title);

  display.drawLine(
    0,
    10,
    127,
    10,
    SSD1306_WHITE
  );
}


// ============================================================
// OLED MAIN
// ============================================================

void oledMain()
{
  oledHeader(
    "HEALTH MONITOR"
  );


  display.setCursor(
    0,
    14
  );

  display.print(
    "ECG: "
  );


  if (ecgLeadOff)
  {
    display.println(
      "LEADS OFF"
    );
  }
  else if (ecgBPM > 0)
  {
    display.print(
      ecgBPM,
      0
    );

    display.println(
      " BPM"
    );
  }
  else
  {
    display.println(
      "MEASURING"
    );
  }


  display.setCursor(
    0,
    26
  );

  display.print(
    "PPG: "
  );


  if (
    fingerPresent &&
    ppgBPMValid
  )
  {
    display.print(
      ppgBPM
    );

    display.println(
      " BPM"
    );
  }
  else if (!fingerPresent)
  {
    display.println(
      "NO FINGER"
    );
  }
  else
  {
    display.println(
      "MEASURING"
    );
  }


  display.setCursor(
    0,
    38
  );

  display.print(
    "SpO2: "
  );


  if (spo2Valid)
  {
    display.print(
      spo2
    );

    display.println(
      "%"
    );
  }
  else
  {
    display.println(
      "--"
    );
  }


  display.setCursor(
    0,
    50
  );

  display.print(
    "Temp: "
  );


  if (
    temperatureC > 10 &&
    temperatureC < 60
  )
  {
    display.print(
      temperatureC,
      1
    );

    display.println(
      " C"
    );
  }
  else
  {
    display.println(
      "--"
    );
  }


  display.display();
}


// ============================================================
// OLED ECG
// ============================================================

void oledECG()
{
  oledHeader(
    "ECG / HRV"
  );


  display.setCursor(
    0,
    14
  );

  display.print(
    "HR: "
  );


  if (ecgBPM > 0)
    display.print(
      ecgBPM,
      0
    );
  else
    display.print("--");


  display.println(
    " BPM"
  );


  display.setCursor(
    0,
    26
  );

  display.print(
    "RR: "
  );


  if (rrInterval > 0)
    display.print(
      rrInterval
    );
  else
    display.print("--");


  display.println(
    " ms"
  );


  display.setCursor(
    0,
    38
  );

  display.print(
    "SDNN: "
  );

  display.print(
    sdnn,
    1
  );

  display.println(
    " ms"
  );


  display.setCursor(
    0,
    50
  );

  display.print(
    "RMSSD: "
  );

  display.print(
    rmssd,
    1
  );

  display.println(
    " ms"
  );


  display.display();
}


// ============================================================
// OLED PPG
// ============================================================

void oledPPG()
{
  oledHeader(
    "PPG / SpO2"
  );


  display.setCursor(
    0,
    14
  );

  display.print(
    "Finger: "
  );

  display.println(
    fingerPresent ?
    "YES" :
    "NO"
  );


  display.setCursor(
    0,
    26
  );

  display.print(
    "BPM: "
  );


  if (ppgBPMValid)
    display.println(
      ppgBPM
    );
  else
    display.println(
      "--"
    );


  display.setCursor(
    0,
    38
  );

  display.print(
    "SpO2: "
  );


  if (spo2Valid)
  {
    display.print(
      spo2
    );

    display.println(
      "%"
    );
  }
  else
  {
    display.println(
      "--"
    );
  }


  display.setCursor(
    0,
    50
  );

  display.print(
    "PI: "
  );

  display.print(
    perfusionIndex,
    2
  );


  display.display();
}


// ============================================================
// OLED BMI323
// ============================================================

void oledBMI()
{
  oledHeader(
    "BMI323 MOTION"
  );


  display.setCursor(
    0,
    14
  );

  display.print(
    "A:"
  );

  display.print(
    ax,
    1
  );

  display.print(",");

  display.print(
    ay,
    1
  );

  display.print(",");

  display.println(
    az,
    1
  );


  display.setCursor(
    0,
    26
  );

  display.print(
    "G:"
  );

  display.print(
    gx,
    0
  );

  display.print(",");

  display.print(
    gy,
    0
  );

  display.print(",");

  display.println(
    gz,
    0
  );


  display.setCursor(
    0,
    38
  );

  display.print(
    "Accel: "
  );

  display.print(
    accelerationMagnitude,
    2
  );

  display.println(
    "g"
  );


  display.setCursor(
    0,
    50
  );

  display.print(
    motionState
  );


  display.display();
}


// ============================================================
// OLED STATUS
// ============================================================

void oledStatus()
{
  oledHeader(
    "SENSOR STATUS"
  );


  display.setCursor(
    0,
    14
  );

  display.print(
    "ECG: "
  );

  display.println(
    ecgLeadOff ?
    "LEADS OFF" :
    "OK"
  );


  display.setCursor(
    0,
    26
  );

  display.print(
    "MAX30102: "
  );

  display.println(
    max30102Ready ?
    "OK" :
    "ERROR"
  );


  display.setCursor(
    0,
    38
  );

  display.print(
    "BMI323: "
  );

  display.println(
    bmiReady ?
    "OK" :
    "ERROR"
  );


  display.setCursor(
    0,
    50
  );

  display.print(
    "WiFi: "
  );

  display.println(
    WiFi.status() ==
    WL_CONNECTED ?
    "OK" :
    "OFF"
  );


  display.display();
}


// ============================================================
// OLED MANAGER
// ============================================================

void updateOLED()
{
  if (!oledReady)
    return;


  if (
    millis() -
    lastOLED <
    500
  )
  {
    return;
  }


  lastOLED =
    millis();


  if (
    millis() -
    lastOLEDPage >
    4000
  )
  {
    lastOLEDPage =
      millis();


    oledPage++;


    if (
      oledPage > 4
    )
    {
      oledPage = 0;
    }
  }


  switch (oledPage)
  {
    case 0:
      oledMain();
      break;


    case 1:
      oledECG();
      break;


    case 2:
      oledPPG();
      break;


    case 3:
      oledBMI();
      break;


    case 4:
      oledStatus();
      break;
  }
}


// ============================================================
// SETUP
// ============================================================

void setup()
{
  Serial.begin(
    115200
  );


  delay(500);


  Serial.println();
  Serial.println(
    "========================================"
  );

  Serial.println(
    "ESP32 REAL-TIME HEALTH MONITOR"
  );

  Serial.println(
    "7SEMI BMI323 VERSION"
  );

  Serial.println(
    "========================================"
  );


  // ------------------------------------------
  // ECG pins
  // ------------------------------------------

  pinMode(
    ECG_LO_P,
    INPUT
  );

  // ------------------------------------------
  // ADC
  // ------------------------------------------

  analogReadResolution(
    12
  );


  analogSetPinAttenuation(
    ECG_PIN,
    ADC_11db
  );


  analogSetPinAttenuation(
    LM35_PIN,
    ADC_11db
  );


  // ------------------------------------------
  // I2C
  // ------------------------------------------

  Wire.begin(
    SDA_PIN,
    SCL_PIN
  );

  Wire.setClock(
    400000
  );


  // ------------------------------------------
  // OLED
  // ------------------------------------------

  if (
    display.begin(
      SSD1306_SWITCHCAPVCC,
      OLED_ADDRESS
    )
  )
  {
    oledReady = true;


    display.clearDisplay();

    display.setTextColor(
      SSD1306_WHITE
    );

    display.setTextSize(1);

    display.setCursor(
      10,
      20
    );

    display.println(
      "ESP32 HEALTH"
    );


    display.setCursor(
      10,
      35
    );

    display.println(
      "MONITOR"
    );


    display.display();

    delay(1500);
  }
  else
  {
    Serial.println(
      "OLED NOT FOUND"
    );
  }


  // ------------------------------------------
  // MAX30102
  // ------------------------------------------

  Serial.println(
    "Checking MAX30102..."
  );


  if (
    max30102.begin(
      Wire,
      I2C_SPEED_FAST
    )
  )
  {
    max30102.setup(
      0x1F,
      4,
      2,
      100,
      411,
      4096
    );


    max30102Ready = true;


    Serial.println(
      "MAX30102: OK"
    );
  }
  else
  {
    Serial.println(
      "MAX30102: NOT FOUND"
    );
  }


  // ------------------------------------------
  // BMI323
  // ------------------------------------------

  Serial.println(
    "Checking BMI323..."
  );


  /*
     7Semi documentation:
     default I2C address = 0x68
  */

  if (
    imu.beginI2C(
      0x68
    )
  )
  {
    bmiReady = true;


    Serial.println(
      "BMI323: OK"
    );


    /*
       Configure accelerometer:
       100 Hz
       normal mode
       ±2g
       average 1
    */

    imu.setAccelConfig(
      BMI3_ACC_ODR_100HZ,
      BMI3_ACC_BW_ODR_QUARTER,
      BMI3_ACC_MODE_NORMAL,
      BMI3_ACC_RANGE_2G,
      BMI3_ACC_AVG1
    );


    /*
       Configure gyroscope:
       100 Hz
       normal mode
       ±2000 dps
       average 1
    */

    imu.setGyroConfig(
      BMI3_GYR_ODR_100HZ,
      BMI3_GYR_BW_ODR_QUARTER,
      BMI3_GYR_MODE_NORMAL,
      BMI3_GYR_RANGE_2000DPS,
      BMI3_GYR_AVG1
    );


    Serial.println(
      "BMI323 configuration: OK"
    );
  }
  else
  {
    bmiReady = false;


    Serial.println(
      "BMI323: NOT FOUND"
    );


    Serial.println(
      "Try I2C address 0x69 if required."
    );
  }


  // ------------------------------------------
  // WiFi
  // ------------------------------------------

  if (ENABLE_WIFI)
  {
    WiFi.mode(
      WIFI_STA
    );


    WiFi.begin(
      WIFI_SSID,
      WIFI_PASSWORD
    );


    Serial.print(
      "WiFi connecting"
    );


    unsigned long start =
      millis();


    while (
      WiFi.status() !=
      WL_CONNECTED &&
      millis() -
      start <
      15000
    )
    {
      delay(300);

      Serial.print(".");
    }


    Serial.println();


    if (
      WiFi.status() ==
      WL_CONNECTED
    )
    {
      Serial.print(
        "WiFi IP: "
      );

      Serial.println(
        WiFi.localIP()
      );


      Serial.print(
        "WebSocket: ws://"
      );

      Serial.print(
        WiFi.localIP()
      );

      Serial.println(
        ":81"
      );


      webSocket.begin();

      webSocket.onEvent(
        webSocketEvent
      );
    }
    else
    {
      Serial.println(
        "WiFi FAILED"
      );

      Serial.println(
        "Running USB Serial only."
      );
    }
  }


  Serial.println();
  Serial.println(
    "========================================"
  );

  Serial.println(
    "SYSTEM READY"
  );

  Serial.println(
    "========================================"
  );
}


// ============================================================
// LOOP
// ============================================================

void loop()
{
  // WebSocket

  if (
    ENABLE_WIFI &&
    WiFi.status() ==
    WL_CONNECTED
  )
  {
    webSocket.loop();
  }


  // ECG

  sampleECG();


  // MAX30102

  processMAX30102();


  // BMI323

  if (
    millis() -
    lastIMU >=
    20
  )
  {
    lastIMU =
      millis();


    readBMI323();
  }


  // ------------------------------------------
  // VITALS EVERY SECOND
  // ------------------------------------------

  if (
    millis() -
    lastVitals >=
    1000
  )
  {
    lastVitals =
      millis();


    // LM35

    float newTemperature =
      readLM35();


    if (
      temperatureC == 0
    )
    {
      temperatureC =
        newTemperature;
    }
    else
    {
      temperatureC =
        0.8f *
        temperatureC +
        0.2f *
        newTemperature;
    }


    // MAX30102 internal temperature

    readMAX30102Temperature();


    // Send complete JSON
    sendVitals();
  }


  // OLED

  updateOLED();
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