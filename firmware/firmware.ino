/*
 * ================================================================
 * ESP32 MULTI-SENSOR HEALTH MONITOR
 * ACCURACY-FOCUSED VERSION
 * ================================================================
 *
 * MAX30102 -> Heart Rate + SpO2
 * AD8232   -> ECG
 * BMI323   -> Accelerometer + Gyroscope + Temperature
 * LM35     -> Temperature
 * SSD1306  -> OLED
 *
 * I2C:
 * SDA -> GPIO 21
 * SCL -> GPIO 22
 *
 * AD8232:
 * OUTPUT -> GPIO 34
 * LO+    -> GPIO 32
 * LO-    -> GPIO 33
 *
 * LM35:
 * VOUT -> GPIO 35
 *
 * ================================================================
 *
 * IMPORTANT:
 *
 * MAX30102 uses SparkFun/Maxim HR + SpO2 algorithm.
 *
 * Configuration:
 *
 * LED brightness = 60
 * Sample average = 4
 * LED mode       = RED + IR
 * Sample rate     = 100 Hz
 * Pulse width     = 411 us
 * ADC range       = 4096
 *
 * Effective sample rate for Maxim algorithm:
 * approximately 25 samples/sec.
 *
 * ================================================================
 */

#include <Wire.h>

#include "MAX30105.h"
#include "spo2_algorithm.h"

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include "7Semi_BMI323.h"

#include <math.h>

// ================================================================
// PIN DEFINITIONS
// ================================================================

// ---------------- ECG ----------------

#define ECG_OUTPUT_PIN 34
#define ECG_LO_PLUS    32
#define ECG_LO_MINUS   33

// ---------------- LM35 ----------------

#define LM35_PIN 35

// ---------------- I2C ----------------

#define I2C_SDA 21
#define I2C_SCL 22

#define BMI323_ADDRESS_68 0x68
#define BMI323_ADDRESS_69 0x69

// ================================================================
// OLED
// ================================================================

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  OLED_RESET
);

// ================================================================
// MAX30102
// ================================================================

MAX30105 sensor;

bool max30102Ready = false;

bool fingerPresent = false;

// ------------------------------------------------
// MAX30102 configuration
// ------------------------------------------------

const byte LED_BRIGHTNESS = 60;

const byte SAMPLE_AVERAGE = 4;

const byte LED_MODE = 2;

const int SAMPLE_RATE = 100;

const int PULSE_WIDTH = 411;

const int ADC_RANGE = 4096;

// Finger detection threshold
const uint32_t FINGER_THRESHOLD = 20000;

// ================================================================
// MAXIM HR + SPO2 BUFFER
// ================================================================

#define BUFFER_SIZE 100

uint32_t irBuffer[BUFFER_SIZE];

uint32_t redBuffer[BUFFER_SIZE];

uint16_t bufferIndex = 0;

// ================================================================
// MAXIM ALGORITHM OUTPUT
// ================================================================

int32_t algorithmHR = 0;

int8_t algorithmHRValid = 0;

int32_t algorithmSpO2 = 0;

int8_t algorithmSpO2Valid = 0;

// ================================================================
// STABLE BPM
// ================================================================

float bpm = 0.0;

float bpmHistory[5] = {
  0,
  0,
  0,
  0,
  0
};

uint8_t bpmHistoryIndex = 0;

uint8_t bpmHistoryCount = 0;

// ------------------------------------------------
// BPM safety limits
// ------------------------------------------------

const float MIN_VALID_BPM = 45.0;

const float MAX_VALID_BPM = 110.0;

// Maximum allowed sudden jump between
// consecutive valid algorithm results.

const float MAX_BPM_CHANGE = 25.0;

// ================================================================
// STABLE SPO2
// ================================================================

float spo2 = 0.0;

float spo2History[5] = {
  0,
  0,
  0,
  0,
  0
};

uint8_t spo2HistoryIndex = 0;

uint8_t spo2HistoryCount = 0;

// ================================================================
// SENSOR TIMERS
// ================================================================

unsigned long lastECGRead = 0;

unsigned long lastBMIRead = 0;

unsigned long lastLM35Read = 0;

unsigned long lastSerialSend = 0;

unsigned long lastDisplayUpdate = 0;

unsigned long lastPageChange = 0;

// ================================================================
// SENSOR INTERVALS
// ================================================================

// ECG target ~500 Hz

const unsigned long ECG_INTERVAL_US = 2000;

// BMI323 = 20 Hz

const unsigned long BMI_INTERVAL_MS = 50;

// LM35 = 4 Hz

const unsigned long LM35_INTERVAL_MS = 250;

// Dashboard = 10 packets/sec

const unsigned long SERIAL_INTERVAL_MS = 100;

// OLED = 10 FPS

const unsigned long DISPLAY_INTERVAL_MS = 100;

// OLED page change

const unsigned long PAGE_INTERVAL_MS = 4000;

// ================================================================
// ECG
// ================================================================

int ecgValue = 0;

bool ecgLeadsOff = true;

// ================================================================
// LM35
// ================================================================

float temperatureC = 0.0;

// ================================================================
// BMI323
// ================================================================

BMI323_7Semi imu;

bool bmiReady = false;

uint8_t bmiAddress = BMI323_ADDRESS_68;

// Raw accelerometer

float accelX = 0.0;

float accelY = 0.0;

float accelZ = 0.0;

// Raw gyroscope

float gyroX = 0.0;

float gyroY = 0.0;

float gyroZ = 0.0;

// BMI temperature

float bmiTemperature = 0.0;

// Calculated values

float accelMagnitude = 0.0;

float gyroMagnitude = 0.0;

float pitchDeg = 0.0;

float rollDeg = 0.0;

// ================================================================
// MOTION ANALYSIS
// ================================================================

#define MOTION_HISTORY_SIZE 20

float accelHistory[
  MOTION_HISTORY_SIZE
];

uint8_t accelHistoryIndex = 0;

bool motionHistoryReady = false;

float accelVariance = 0.0;

bool motionDetected = false;

String motionState = "STABLE";

// ================================================================
// OLED PAGES
// ================================================================

uint8_t currentPage = 0;

const uint8_t PAGE_HEART = 0;

const uint8_t PAGE_BMI = 1;

const uint8_t TOTAL_PAGES = 2;

// ================================================================
// HEART ANIMATION
// ================================================================

unsigned long heartBeatTimer = 0;

// ================================================================
// HELPER FUNCTIONS
// ================================================================

float clampFloat(
  float value,
  float minimum,
  float maximum
)
{
  if (value < minimum)
    return minimum;

  if (value > maximum)
    return maximum;

  return value;
}

// ================================================================
// MEDIAN BPM
// ================================================================

float getMedianBPM()
{
  float values[5];

  uint8_t count = 0;

  for (uint8_t i = 0; i < 5; i++)
  {
    if (bpmHistory[i] > 0)
    {
      values[count] =
        bpmHistory[i];

      count++;
    }
  }

  if (count == 0)
    return 0;

  // Sort

  for (uint8_t i = 0; i < count - 1; i++)
  {
    for (uint8_t j = i + 1; j < count; j++)
    {
      if (
        values[j] <
        values[i]
      )
      {
        float temp =
          values[i];

        values[i] =
          values[j];

        values[j] =
          temp;
      }
    }
  }

  return values[
    count / 2
  ];
}

// ================================================================
// MEDIAN SPO2
// ================================================================

float getMedianSpO2()
{
  float values[5];

  uint8_t count = 0;

  for (uint8_t i = 0; i < 5; i++)
  {
    if (
      spo2History[i] >= 70 &&
      spo2History[i] <= 100
    )
    {
      values[count] =
        spo2History[i];

      count++;
    }
  }

  if (count == 0)
    return 0;

  // Sort

  for (uint8_t i = 0; i < count - 1; i++)
  {
    for (uint8_t j = i + 1; j < count; j++)
    {
      if (
        values[j] <
        values[i]
      )
      {
        float temp =
          values[i];

        values[i] =
          values[j];

        values[j] =
          temp;
      }
    }
  }

  return values[
    count / 2
  ];
}

// ================================================================
// RESET MAX30102 STATE
// ================================================================

void resetMAXState()
{
  fingerPresent = false;

  bufferIndex = 0;

  algorithmHR = 0;

  algorithmHRValid = 0;

  algorithmSpO2 = 0;

  algorithmSpO2Valid = 0;

  bpm = 0;

  spo2 = 0;

  bpmHistoryIndex = 0;

  bpmHistoryCount = 0;

  spo2HistoryIndex = 0;

  spo2HistoryCount = 0;

  for (uint8_t i = 0; i < 5; i++)
  {
    bpmHistory[i] = 0;

    spo2History[i] = 0;
  }

  for (uint16_t i = 0; i < BUFFER_SIZE; i++)
  {
    irBuffer[i] = 0;

    redBuffer[i] = 0;
  }
}

// ================================================================
// INITIALIZE MAX30102
// ================================================================

bool initializeMAX30102()
{
  Serial.println();

  Serial.println(
    "Initializing MAX30102..."
  );

  if (
    !sensor.begin(
      Wire,
      I2C_SPEED_FAST
    )
  )
  {
    Serial.println(
      "MAX30102 NOT FOUND!"
    );

    return false;
  }

  Serial.println(
    "MAX30102 FOUND."
  );

  // ------------------------------------------------
  // Reference configuration
  // ------------------------------------------------

  sensor.setup(
    LED_BRIGHTNESS,
    SAMPLE_AVERAGE,
    LED_MODE,
    SAMPLE_RATE,
    PULSE_WIDTH,
    ADC_RANGE
  );

  sensor.setPulseAmplitudeIR(
    LED_BRIGHTNESS
  );

  sensor.setPulseAmplitudeRed(
    LED_BRIGHTNESS
  );

  sensor.setPulseAmplitudeGreen(
    0
  );

  sensor.clearFIFO();

  resetMAXState();

  Serial.println(
    "MAX30102 configuration:"
  );

  Serial.print(
    "LED brightness: "
  );

  Serial.println(
    LED_BRIGHTNESS
  );

  Serial.print(
    "Sample average: "
  );

  Serial.println(
    SAMPLE_AVERAGE
  );

  Serial.print(
    "Sample rate: "
  );

  Serial.println(
    SAMPLE_RATE
  );

  Serial.println(
    "Effective rate: ~25 samples/sec"
  );

  return true;
}

// ================================================================
// PROCESS MAXIM HR + SPO2
// ================================================================

void processMAXAlgorithm()
{
  if (!fingerPresent)
    return;

  if (bufferIndex < BUFFER_SIZE)
    return;

  // ------------------------------------------------
  // Run Maxim algorithm
  // ------------------------------------------------

  maxim_heart_rate_and_oxygen_saturation(
    irBuffer,
    BUFFER_SIZE,
    redBuffer,
    &algorithmSpO2,
    &algorithmSpO2Valid,
    &algorithmHR,
    &algorithmHRValid
  );

  // ==============================================================
  // HEART RATE
  // ==============================================================

  if (
    algorithmHRValid &&
    algorithmHR >= MIN_VALID_BPM &&
    algorithmHR <= MAX_VALID_BPM
  )
  {
    float newHR =
      (float)algorithmHR;

    // ------------------------------------------------
    // Reject sudden impossible jump
    // ------------------------------------------------

    if (
      bpm > 0 &&
      fabs(
        newHR - bpm
      ) > MAX_BPM_CHANGE
    )
    {
      Serial.print(
        "Rejected HR spike: "
      );

      Serial.println(
        newHR
      );
    }
    else
    {
      // ------------------------------------------------
      // Store valid HR
      // ------------------------------------------------

      bpmHistory[
        bpmHistoryIndex
      ] =
        newHR;

      bpmHistoryIndex++;

      if (
        bpmHistoryIndex >= 5
      )
      {
        bpmHistoryIndex = 0;
      }

      if (
        bpmHistoryCount < 5
      )
      {
        bpmHistoryCount++;
      }

      // ------------------------------------------------
      // Median filtering
      // ------------------------------------------------

      float medianHR =
        getMedianBPM();

      if (
        medianHR > 0
      )
      {
        if (
          bpm == 0
        )
        {
          bpm =
            medianHR;
        }
        else
        {
          /*
           * Slow smoothing.
           *
           * Prevents:
           *
           * 75 -> 126 -> 75
           *
           * from appearing on dashboard.
           */

          bpm =
            0.75f * bpm +
            0.25f * medianHR;
        }

        // Final safety limit

        bpm =
          clampFloat(
            bpm,
            MIN_VALID_BPM,
            MAX_VALID_BPM
          );
      }
    }
  }

  // ==============================================================
  // SpO2
  // ==============================================================

  if (
    algorithmSpO2Valid &&
    algorithmSpO2 >= 70 &&
    algorithmSpO2 <= 100
  )
  {
    float newSpO2 =
      (float)algorithmSpO2;

    // Store

    spo2History[
      spo2HistoryIndex
    ] =
      newSpO2;

    spo2HistoryIndex++;

    if (
      spo2HistoryIndex >= 5
    )
    {
      spo2HistoryIndex = 0;
    }

    if (
      spo2HistoryCount < 5
    )
    {
      spo2HistoryCount++;
    }

    // Median

    float medianSpO2 =
      getMedianSpO2();

    if (
      medianSpO2 > 0
    )
    {
      if (
        spo2 == 0
      )
      {
        spo2 =
          medianSpO2;
      }
      else
      {
        /*
         * SpO2 normally changes
         * slowly, so strong smoothing
         * is appropriate.
         */

        spo2 =
          0.85f * spo2 +
          0.15f * medianSpO2;
      }

      spo2 =
        clampFloat(
          spo2,
          70,
          100
        );
    }
  }
}

// ================================================================
// UPDATE MAX30102
// ================================================================

void updateMAX30102()
{
  if (!max30102Ready)
    return;

  /*
   * Check for new FIFO samples.
   *
   * IMPORTANT:
   * We do NOT return from the main loop
   * when there is no MAX30102 sample.
   */

  sensor.check();

  while (
    sensor.available()
  )
  {
    // ------------------------------------------------
    // CORRECT CHANNEL ASSIGNMENT
    // ------------------------------------------------

    uint32_t ir =
      sensor.getFIFOIR();

    uint32_t red =
      sensor.getFIFORed();

    // ------------------------------------------------
    // FINGER DETECTION
    // ------------------------------------------------

    if (
      ir < FINGER_THRESHOLD
    )
    {
      if (
        fingerPresent
      )
      {
        Serial.println(
          "Finger removed."
        );
      }

      resetMAXState();

      sensor.nextSample();

      continue;
    }

    // ------------------------------------------------
    // FINGER PRESENT
    // ------------------------------------------------

    if (
      !fingerPresent
    )
    {
      fingerPresent = true;

      Serial.println();

      Serial.println(
        "Finger detected."
      );

      Serial.println(
        "Collecting PPG samples..."
      );

      resetMAXState();

      fingerPresent = true;
    }

    // ------------------------------------------------
    // STORE SAMPLE
    // ------------------------------------------------

    if (
      bufferIndex < BUFFER_SIZE
    )
    {
      irBuffer[
        bufferIndex
      ] =
        ir;

      redBuffer[
        bufferIndex
      ] =
        red;

      bufferIndex++;
    }

    // ------------------------------------------------
    // FULL BUFFER
    // ------------------------------------------------

    if (
      bufferIndex >= BUFFER_SIZE
    )
    {
      processMAXAlgorithm();

      /*
       * Official algorithm uses:
       *
       * 75 old samples
       * +
       * 25 new samples
       *
       * giving approximately
       * one new calculation/sec.
       */

      for (
        uint16_t i = 25;
        i < BUFFER_SIZE;
        i++
      )
      {
        irBuffer[
          i - 25
        ] =
          irBuffer[i];

        redBuffer[
          i - 25
        ] =
          redBuffer[i];
      }

      bufferIndex = 75;
    }

    sensor.nextSample();
  }
}

// ================================================================
// ECG
// ================================================================

void updateECG()
{
  unsigned long now =
    micros();

  if (
    now -
    lastECGRead <
    ECG_INTERVAL_US
  )
  {
    return;
  }

  lastECGRead =
    now;

  bool loPlus =
    digitalRead(
      ECG_LO_PLUS
    );

  bool loMinus =
    digitalRead(
      ECG_LO_MINUS
    );

  if (
    loPlus ||
    loMinus
  )
  {
    ecgLeadsOff = true;

    ecgValue = 0;

    return;
  }

  ecgLeadsOff = false;

  ecgValue =
    analogRead(
      ECG_OUTPUT_PIN
    );
}

// ================================================================
// LM35
// ================================================================

void updateLM35()
{
  if (
    millis() -
    lastLM35Read <
    LM35_INTERVAL_MS
  )
  {
    return;
  }

  lastLM35Read =
    millis();

  /*
   * Average multiple ADC measurements
   * to reduce noise.
   */

  const uint8_t SAMPLE_COUNT = 16;

  uint32_t totalmV = 0;

  for (
    uint8_t i = 0;
    i < SAMPLE_COUNT;
    i++
  )
  {
    totalmV +=
      analogReadMilliVolts(
        LM35_PIN
      );
  }

  float averageVoltage =
    (float)totalmV /
    SAMPLE_COUNT;

  /*
   * LM35:
   *
   * 10 mV = 1°C
   */

  temperatureC =
    averageVoltage /
    10.0f;

  // Safety range

  if (
    temperatureC < -55 ||
    temperatureC > 150
  )
  {
    temperatureC = 0;
  }
}

// ================================================================
// BMI323
// ================================================================

void updateBMI323()
{
  if (!bmiReady)
    return;

  if (
    millis() -
    lastBMIRead <
    BMI_INTERVAL_MS
  )
  {
    return;
  }

  lastBMIRead =
    millis();

  bool accelOK =
    imu.readAccel(
      accelX,
      accelY,
      accelZ
    );

  bool gyroOK =
    imu.readGyro(
      gyroX,
      gyroY,
      gyroZ
    );

  if (
    !accelOK ||
    !gyroOK
  )
  {
    return;
  }

  // ------------------------------------------------
  // ACCELERATION MAGNITUDE
  // ------------------------------------------------

  accelMagnitude =
    sqrt(
      accelX * accelX +
      accelY * accelY +
      accelZ * accelZ
    );

  // ------------------------------------------------
  // GYROSCOPE MAGNITUDE
  // ------------------------------------------------

  gyroMagnitude =
    sqrt(
      gyroX * gyroX +
      gyroY * gyroY +
      gyroZ * gyroZ
    );

  // ------------------------------------------------
  // PITCH
  // ------------------------------------------------

  pitchDeg =
    atan2(
      accelX,
      sqrt(
        accelY * accelY +
        accelZ * accelZ
      )
    )
    * 180.0 /
    PI;

  // ------------------------------------------------
  // ROLL
  // ------------------------------------------------

  rollDeg =
    atan2(
      accelY,
      sqrt(
        accelX * accelX +
        accelZ * accelZ
      )
    )
    * 180.0 /
    PI;

  // ------------------------------------------------
  // BMI TEMPERATURE
  // ------------------------------------------------

  float temp;

  if (
    imu.getTemperature(temp)
  )
  {
    bmiTemperature =
      temp;
  }

  // ------------------------------------------------
  // MOTION HISTORY
  // ------------------------------------------------

  accelHistory[
    accelHistoryIndex
  ] =
    accelMagnitude;

  accelHistoryIndex++;

  if (
    accelHistoryIndex >=
    MOTION_HISTORY_SIZE
  )
  {
    accelHistoryIndex = 0;

    motionHistoryReady = true;
  }

  if (
    !motionHistoryReady
  )
  {
    return;
  }

  // ------------------------------------------------
  // MEAN
  // ------------------------------------------------

  float mean = 0;

  for (
    uint8_t i = 0;
    i < MOTION_HISTORY_SIZE;
    i++
  )
  {
    mean +=
      accelHistory[i];
  }

  mean /=
    MOTION_HISTORY_SIZE;

  // ------------------------------------------------
  // VARIANCE
  // ------------------------------------------------

  accelVariance = 0;

  for (
    uint8_t i = 0;
    i < MOTION_HISTORY_SIZE;
    i++
  )
  {
    float diff =
      accelHistory[i] -
      mean;

    accelVariance +=
      diff * diff;
  }

  accelVariance /=
    MOTION_HISTORY_SIZE;

  motionDetected =
    accelVariance > 0.02;

  // ------------------------------------------------
  // MOTION STATE
  // ------------------------------------------------

  float gravityDeviation =
    fabs(
      accelMagnitude -
      1.0
    );

  if (
    gravityDeviation < 0.05 &&
    gyroMagnitude < 5.0
  )
  {
    motionState =
      "STABLE";
  }
  else if (
    gravityDeviation < 0.20 &&
    gyroMagnitude < 30.0
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
}

// ================================================================
// DRAW HEART
// ================================================================

void drawHeart(
  int16_t x,
  int16_t y
)
{
  display.fillCircle(
    x + 3,
    y + 3,
    3,
    SSD1306_WHITE
  );

  display.fillCircle(
    x + 9,
    y + 3,
    3,
    SSD1306_WHITE
  );

  display.fillTriangle(
    x,
    y + 4,
    x + 12,
    y + 4,
    x + 6,
    y + 11,
    SSD1306_WHITE
  );
}

// ================================================================
// OLED HEART PAGE
// ================================================================

void renderHeartPage()
{
  display.clearDisplay();

  display.setTextColor(
    SSD1306_WHITE
  );

  display.setTextWrap(false);

  // ------------------------------------------------
  // TITLE
  // ------------------------------------------------

  display.setTextSize(1);

  display.setCursor(
    0,
    0
  );

  display.print(
    "HEART MONITOR"
  );

  display.setCursor(
    105,
    0
  );

  display.print(
    "1/2"
  );

  // ------------------------------------------------
  // LABELS
  // ------------------------------------------------

  display.setTextSize(2);

  display.setCursor(
    0,
    12
  );

  display.print(
    "BPM"
  );

  display.setCursor(
    72,
    12
  );

  display.print(
    "SpO2"
  );

  // ------------------------------------------------
  // BPM
  // ------------------------------------------------

  display.setTextSize(3);

  display.setCursor(
    0,
    32
  );

  if (
    fingerPresent &&
    bpm >= MIN_VALID_BPM &&
    bpm <= MAX_VALID_BPM
  )
  {
    display.print(
      (int)round(bpm)
    );
  }
  else
  {
    display.print(
      "--"
    );
  }

  // ------------------------------------------------
  // SPO2
  // ------------------------------------------------

  display.setCursor(
    72,
    32
  );

  if (
    fingerPresent &&
    spo2 >= 70 &&
    spo2 <= 100
  )
  {
    display.print(
      (int)round(spo2)
    );

    display.setTextSize(1);

    display.setCursor(
      116,
      35
    );

    display.print(
      "%"
    );
  }
  else
  {
    display.print(
      "--"
    );
  }

  // ------------------------------------------------
  // HEART ANIMATION
  // ------------------------------------------------

  if (
    millis() <
    heartBeatTimer
  )
  {
    drawHeart(
      48,
      52
    );
  }

  display.display();
}

// ================================================================
// OLED BMI PAGE
// ================================================================

void renderBMIPage()
{
  display.clearDisplay();

  display.setTextColor(
    SSD1306_WHITE
  );

  display.setTextWrap(false);

  display.setTextSize(1);

  // ------------------------------------------------
  // TITLE
  // ------------------------------------------------

  display.setCursor(
    0,
    0
  );

  display.print(
    "BMI323 MOTION"
  );

  display.setCursor(
    105,
    0
  );

  display.print(
    "2/2"
  );

  display.drawLine(
    0,
    9,
    127,
    9,
    SSD1306_WHITE
  );

  // ------------------------------------------------
  // ACCELEROMETER
  // ------------------------------------------------

  display.setCursor(
    0,
    13
  );

  display.print(
    "A:"
  );

  display.print(
    accelX,
    1
  );

  display.print(
    ","
  );

  display.print(
    accelY,
    1
  );

  display.print(
    ","
  );

  display.print(
    accelZ,
    1
  );

  // ------------------------------------------------
  // GYROSCOPE
  // ------------------------------------------------

  display.setCursor(
    0,
    23
  );

  display.print(
    "G:"
  );

  display.print(
    gyroX,
    0
  );

  display.print(
    ","
  );

  display.print(
    gyroY,
    0
  );

  display.print(
    ","
  );

  display.print(
    gyroZ,
    0
  );

  // ------------------------------------------------
  // ACCEL MAGNITUDE
  // ------------------------------------------------

  display.setCursor(
    0,
    33
  );

  display.print(
    "Accel:"
  );

  display.print(
    accelMagnitude,
    2
  );

  display.print(
    "g"
  );

  // ------------------------------------------------
  // GYRO MAGNITUDE
  // ------------------------------------------------

  display.setCursor(
    0,
    43
  );

  display.print(
    "Gyro:"
  );

  display.print(
    gyroMagnitude,
    1
  );

  display.print(
    "dps"
  );

  // ------------------------------------------------
  // MOTION
  // ------------------------------------------------

  display.setCursor(
    0,
    53
  );

  display.print(
    "Motion:"
  );

  display.print(
    motionState
  );

  display.display();
}

// ================================================================
// OLED UPDATE
// ================================================================

void updateDisplay()
{
  if (
    millis() -
    lastPageChange >=
    PAGE_INTERVAL_MS
  )
  {
    currentPage++;

    if (
      currentPage >=
      TOTAL_PAGES
    )
    {
      currentPage = 0;
    }

    lastPageChange =
      millis();
  }

  if (
    millis() -
    lastDisplayUpdate <
    DISPLAY_INTERVAL_MS
  )
  {
    return;
  }

  lastDisplayUpdate =
    millis();

  if (
    currentPage ==
    PAGE_HEART
  )
  {
    renderHeartPage();
  }
  else
  {
    renderBMIPage();
  }
}

// ================================================================
// SERIAL DASHBOARD PACKET
// ================================================================

void sendDashboardPacket()
{
  if (
    millis() -
    lastSerialSend <
    SERIAL_INTERVAL_MS
  )
  {
    return;
  }

  lastSerialSend =
    millis();

  // ------------------------------------------------
  // ECG
  // ------------------------------------------------

  Serial.print(
    "ECG:"
  );

  Serial.print(
    ecgValue
  );

  // ------------------------------------------------
  // PPG IR
  // ------------------------------------------------

  Serial.print(
    ", IR_Signal:"
  );

  if (
    bufferIndex > 0
  )
  {
    Serial.print(
      irBuffer[
        bufferIndex - 1
      ]
    );
  }
  else
  {
    Serial.print(
      0
    );
  }

  // ------------------------------------------------
  // PPG RED
  // ------------------------------------------------

  Serial.print(
    ", Red_Signal:"
  );

  if (
    bufferIndex > 0
  )
  {
    Serial.print(
      redBuffer[
        bufferIndex - 1
      ]
    );
  }
  else
  {
    Serial.print(
      0
    );
  }

  // ------------------------------------------------
  // FINGER
  // ------------------------------------------------

  Serial.print(
    ", Finger:"
  );

  Serial.print(
    fingerPresent ?
    1 :
    0
  );

  // ------------------------------------------------
  // RAW HR FROM MAXIM
  // ------------------------------------------------

  Serial.print(
    ", HR_Raw:"
  );

  Serial.print(
    algorithmHR
  );

  // ------------------------------------------------
  // HR VALID
  // ------------------------------------------------

  Serial.print(
    ", HR_Valid:"
  );

  Serial.print(
    algorithmHRValid
  );

  // ------------------------------------------------
  // FILTERED BPM
  // ------------------------------------------------

  Serial.print(
    ", BPM:"
  );

  if (
    fingerPresent &&
    bpm >= MIN_VALID_BPM &&
    bpm <= MAX_VALID_BPM
  )
  {
    Serial.print(
      bpm,
      1
    );
  }
  else
  {
    Serial.print(
      0
    );
  }

  // ------------------------------------------------
  // RAW SPO2
  // ------------------------------------------------

  Serial.print(
    ", SpO2_Raw:"
  );

  Serial.print(
    algorithmSpO2
  );

  // ------------------------------------------------
  // SPO2 VALID
  // ------------------------------------------------

  Serial.print(
    ", SpO2_Valid:"
  );

  Serial.print(
    algorithmSpO2Valid
  );

  // ------------------------------------------------
  // FILTERED SPO2
  // ------------------------------------------------

  Serial.print(
    ", SpO2:"
  );

  if (
    fingerPresent &&
    spo2 >= 70 &&
    spo2 <= 100
  )
  {
    Serial.print(
      spo2,
      1
    );
  }
  else
  {
    Serial.print(
      0
    );
  }

  // ------------------------------------------------
  // BMI ACCELEROMETER
  // ------------------------------------------------

  Serial.print(
    ", BMI_AX:"
  );

  Serial.print(
    accelX,
    2
  );

  Serial.print(
    ", BMI_AY:"
  );

  Serial.print(
    accelY,
    2
  );

  Serial.print(
    ", BMI_AZ:"
  );

  Serial.print(
    accelZ,
    2
  );

  // ------------------------------------------------
  // BMI GYROSCOPE
  // ------------------------------------------------

  Serial.print(
    ", BMI_GX:"
  );

  Serial.print(
    gyroX,
    1
  );

  Serial.print(
    ", BMI_GY:"
  );

  Serial.print(
    gyroY,
    1
  );

  Serial.print(
    ", BMI_GZ:"
  );

  Serial.print(
    gyroZ,
    1
  );

  // ------------------------------------------------
  // ACCEL MAGNITUDE
  // ------------------------------------------------

  Serial.print(
    ", AccMag:"
  );

  Serial.print(
    accelMagnitude,
    2
  );

  // ------------------------------------------------
  // LM35
  // ------------------------------------------------

  Serial.print(
    ", LM35:"
  );

  Serial.print(
    temperatureC,
    1
  );

  // ------------------------------------------------
  // BMI TEMPERATURE
  // ------------------------------------------------

  Serial.print(
    ", BMI_Temp:"
  );

  Serial.print(
    bmiTemperature,
    1
  );

  // ------------------------------------------------
  // MOTION
  // ------------------------------------------------

  Serial.print(
    ", Motion:"
  );

  Serial.print(
    motionState
  );

  // ------------------------------------------------
  // ECG LEADS
  // ------------------------------------------------

  Serial.print(
    ", LeadsOff:"
  );

  Serial.println(
    ecgLeadsOff ?
    1 :
    0
  );
}

// ================================================================
// I2C SCANNER
// ================================================================

void scanI2C()
{
  Serial.println();

  Serial.println(
    "================ I2C SCANNER ================"
  );

  uint8_t found = 0;

  for (
    uint8_t address = 1;
    address < 127;
    address++
  )
  {
    Wire.beginTransmission(
      address
    );

    if (
      Wire.endTransmission() ==
      0
    )
    {
      Serial.print(
        "I2C device found at 0x"
      );

      if (
        address < 16
      )
      {
        Serial.print(
          "0"
        );
      }

      Serial.println(
        address,
        HEX
      );

      found++;
    }
  }

  if (
    found == 0
  )
  {
    Serial.println(
      "No I2C devices found!"
    );
  }

  Serial.println(
    "=============================================="
  );
}

// ================================================================
// BMI323 INITIALIZATION
// ================================================================

void setupBMI323()
{
  Serial.println();

  Serial.println(
    "Initializing BMI323..."
  );

  if (
    imu.beginI2C(
      BMI323_ADDRESS_68
    )
  )
  {
    bmiReady = true;

    bmiAddress =
      BMI323_ADDRESS_68;

    Serial.println(
      "BMI323 FOUND at 0x68"
    );

    return;
  }

  if (
    imu.beginI2C(
      BMI323_ADDRESS_69
    )
  )
  {
    bmiReady = true;

    bmiAddress =
      BMI323_ADDRESS_69;

    Serial.println(
      "BMI323 FOUND at 0x69"
    );

    return;
  }

  bmiReady = false;

  Serial.println(
    "BMI323 NOT FOUND!"
  );
}

// ================================================================
// SETUP
// ================================================================

void setup()
{
  Serial.begin(
    115200
  );

  delay(300);

  Serial.println();

  Serial.println(
    "=========================================="
  );

  Serial.println(
    " ESP32 HEALTH MONITOR"
  );

  Serial.println(
    " ACCURACY-FOCUSED VERSION"
  );

  Serial.println(
    " MAX30102 + AD8232 + BMI323 + LM35"
  );

  Serial.println(
    "=========================================="
  );

  // ------------------------------------------------
  // ECG
  // ------------------------------------------------

  pinMode(
    ECG_LO_PLUS,
    INPUT
  );

  pinMode(
    ECG_LO_MINUS,
    INPUT
  );

  pinMode(
    ECG_OUTPUT_PIN,
    INPUT
  );

  // ------------------------------------------------
  // LM35
  // ------------------------------------------------

  pinMode(
    LM35_PIN,
    INPUT
  );

  analogReadResolution(
    12
  );

  // ------------------------------------------------
  // I2C
  // ------------------------------------------------

  Wire.begin(
    I2C_SDA,
    I2C_SCL
  );

  Wire.setClock(
    400000
  );

  // ------------------------------------------------
  // I2C SCAN
  // ------------------------------------------------

  scanI2C();

  // ------------------------------------------------
  // OLED
  // ------------------------------------------------

  Serial.println(
    "Initializing OLED..."
  );

  if (
    !display.begin(
      SSD1306_SWITCHCAPVCC,
      SCREEN_ADDRESS
    )
  )
  {
    Serial.println(
      "SSD1306 allocation failed!"
    );

    while (1)
    {
      delay(10);
    }
  }

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
    "Health Monitor"
  );

  display.setCursor(
    10,
    35
  );

  display.println(
    "Starting..."
  );

  display.display();

  delay(500);

  // ------------------------------------------------
  // BMI323
  // ------------------------------------------------

  setupBMI323();

  // ------------------------------------------------
  // MAX30102
  // ------------------------------------------------

  max30102Ready =
    initializeMAX30102();

  if (
    !max30102Ready
  )
  {
    display.clearDisplay();

    display.setTextSize(2);

    display.setCursor(
      0,
      10
    );

    display.println(
      "MAX30102"
    );

    display.println(
      "ERROR!"
    );

    display.display();

    while (1)
    {
      updateECG();

      updateBMI323();

      updateLM35();

      delay(1);
    }
  }

  // ------------------------------------------------
  // INITIALIZE MOTION HISTORY
  // ------------------------------------------------

  for (
    uint8_t i = 0;
    i < MOTION_HISTORY_SIZE;
    i++
  )
  {
    accelHistory[i] =
      1.0;
  }

  motionHistoryReady =
    false;

  // ------------------------------------------------
  // TIMERS
  // ------------------------------------------------

  lastECGRead =
    micros();

  lastBMIRead =
    millis();

  lastLM35Read =
    millis();

  lastSerialSend =
    millis();

  lastDisplayUpdate =
    millis();

  lastPageChange =
    millis();

  Serial.println();

  Serial.println(
    "=========================================="
  );

  Serial.println(
    "SYSTEM READY"
  );

  Serial.println(
    "Place finger on MAX30102."
  );

  Serial.println(
    "Keep finger steady."
  );

  Serial.println(
    "Initial HR/SpO2 calculation takes ~4 sec."
  );

  Serial.println(
    "=========================================="
  );
}

// ================================================================
// MAIN LOOP
// ================================================================

void loop()
{
  /*
   * IMPORTANT:
   *
   * There is NO blocking MAX30102 loop here.
   *
   * Every sensor gets CPU time independently.
   */

  // ------------------------------------------------
  // ECG
  // ------------------------------------------------

  updateECG();

  // ------------------------------------------------
  // MAX30102
  // ------------------------------------------------

  updateMAX30102();

  // ------------------------------------------------
  // BMI323
  // ------------------------------------------------

  updateBMI323();

  // ------------------------------------------------
  // LM35
  // ------------------------------------------------

  updateLM35();

  // ------------------------------------------------
  // OLED
  // ------------------------------------------------

  updateDisplay();

  // ------------------------------------------------
  // DASHBOARD
  // ------------------------------------------------

  sendDashboardPacket();
}
