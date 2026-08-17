/*
 * ================================================================
 * ESP32 MULTI-SENSOR HEALTH MONITOR
 * ================================================================
 *
 * MAX30102  -> Heart Rate + SpO2
 * AD8232    -> ECG
 * BMI323    -> Accelerometer + Gyroscope + Temperature
 * SSD1306   -> OLED Display
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
 * BMI323:
 * VCC -> 3.3V
 * GND -> GND
 * SDA -> GPIO 21
 * SCL -> GPIO 22
 *
 * OLED:
 * VCC -> 3.3V
 * GND -> GND
 * SDA -> GPIO 21
 * SCL -> GPIO 22
 *
 * ================================================================
 */

#include <Wire.h>
#include "MAX30105.h"

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include "7Semi_BMI323.h"


// ========================================================================
// AD8232 ECG SETTINGS
// ========================================================================

#define ECG_OUTPUT_PIN 34
#define ECG_LO_PLUS    32
#define ECG_LO_MINUS   33

// ========================================================================
// LM35 TEMPERATURE SENSOR
// ========================================================================
// LM35 OUT -> GPIO 35
// LM35 VCC -> 3.3V
// LM35 GND -> GND
// LM35 output = 10 mV per degree Celsius
#define LM35_PIN 35

float temperatureC = 0.0;


// ========================================================================
// I2C SETTINGS
// ========================================================================

#define I2C_SDA 21
#define I2C_SCL 22

#define BMI323_ADDRESS_68 0x68
#define BMI323_ADDRESS_69 0x69


// ========================================================================
// OLED SETTINGS
// ========================================================================

#define SCREEN_WIDTH   128
#define SCREEN_HEIGHT  64
#define OLED_RESET     -1
#define SCREEN_ADDRESS 0x3C

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  OLED_RESET
);


// ========================================================================
// MAX30102
// ========================================================================

MAX30105 sensor;

byte irPower  = 40;
byte redPower = 40;

unsigned long lastAdjustTime = 0;

int32_t dcIR  = 0;
int32_t dcRED = 0;

const int SHIFT_DC = 4;

int32_t prev = 0;
int32_t prev2 = 0;

uint32_t lastBeatMs = 0;
uint8_t beatCount = 0;

float bpm = 0;
float env = 0;

const float envAlpha = 0.95f;

const uint32_t REFRACTORY_MS = 400;

uint32_t lastBeatDetectedMs = 0;

const uint32_t BPM_TIMEOUT_MS = 3000;

const float MIN_SIGNAL_QUALITY = 8.0f;


// ========================================================================
// MAX30102 SpO2
// ========================================================================

bool warmupDone = false;

uint32_t warmupStart = 0;

const uint32_t WARMUP_MS = 500;

float spo2 = 0;

float Rratio = 0;

int32_t irMax = INT32_MIN;
int32_t irMin = INT32_MAX;

int32_t redMax = INT32_MIN;
int32_t redMin = INT32_MAX;

uint32_t lastSpo2DetectedMs = 0;

const uint32_t SPO2_TIMEOUT_MS = 10000;


// ========================================================================
// HEART ANIMATION
// ========================================================================

uint32_t heartBeatTimer = 0;


// ========================================================================
// BMI323
// ========================================================================

BMI323_7Semi imu;

bool bmiReady = false;

uint8_t bmiAddress = BMI323_ADDRESS_68;


// Accelerometer
float accelX = 0.0;
float accelY = 0.0;
float accelZ = 0.0;

// Gyroscope
float gyroX = 0.0;
float gyroY = 0.0;
float gyroZ = 0.0;

// BMI323 internal temperature
float bmiTemperature = 0.0;

// Calculated values
float accelMagnitude = 0.0;
float gyroMagnitude = 0.0;

float pitchDeg = 0.0;
float rollDeg = 0.0;


// BMI323 timing
unsigned long lastBMIRead = 0;

const unsigned long BMI_READ_INTERVAL = 50;


// Motion detection
#define MOTION_HISTORY_SIZE 10

float accelHistory[MOTION_HISTORY_SIZE];

uint8_t accelHistoryIndex = 0;

float accelVariance = 0;

bool motionDetected = false;

String motionState = "STABLE";


// ========================================================================
// OLED PAGE SYSTEM
// ========================================================================

uint8_t currentPage = 0;

const uint8_t PAGE_HEART = 0;
const uint8_t PAGE_BMI   = 1;

const uint8_t TOTAL_PAGES = 2;

unsigned long lastPageChange = 0;

const unsigned long PAGE_INTERVAL = 4000;


// ========================================================================
// UTILITY
// ========================================================================

float clampf(float v, float lo, float hi)
{
  if (v < lo)
    return lo;

  if (v > hi)
    return hi;

  return v;
}


// ========================================================================
// HEART ICON
// ========================================================================

void drawHeart(
  int16_t x,
  int16_t y,
  uint16_t color
)
{
  display.fillCircle(
    x + 3,
    y + 3,
    3,
    color
  );

  display.fillCircle(
    x + 9,
    y + 3,
    3,
    color
  );

  display.fillTriangle(
    x,
    y + 4,
    x + 12,
    y + 4,
    x + 6,
    y + 10,
    color
  );
}


// ========================================================================
// SCROLL TEXT
// ========================================================================

bool scrollText(
  const char* text,
  int numPasses,
  bool drainSensor = false
)
{
  int charPxWidth = 6 * 2;

  int textPxWidth =
    strlen(text) * charPxWidth;

  int yPos =
    (SCREEN_HEIGHT - 16) / 2;


  for (int pass = 0; pass < numPasses; pass++)
  {
    for (
      int x = SCREEN_WIDTH;
      x > -textPxWidth;
      x -= 3
    )
    {
      display.clearDisplay();

      display.setTextWrap(false);

      display.setTextSize(2);

      display.setTextColor(
        SSD1306_WHITE
      );

      display.setCursor(
        x,
        yPos
      );

      display.print(text);

      display.display();


      if (
        drainSensor &&
        sensor.getIR() >= 20000
      )
      {
        return true;
      }

      delay(8);
    }
  }

  return false;
}


// ========================================================================
// RESET MAX30102 STATE
// ========================================================================

void resetState()
{
  bpm = 0;

  spo2 = 0;

  dcIR = sensor.getIR();

  dcRED = sensor.getRed();

  env = 0;

  irMax = INT32_MIN;
  irMin = INT32_MAX;

  redMax = INT32_MIN;
  redMin = INT32_MAX;

  lastBeatMs = millis();

  lastBeatDetectedMs = millis();

  lastSpo2DetectedMs = millis();

  beatCount = 0;

  warmupDone = false;

  warmupStart = 0;

  irPower = 40;

  redPower = 40;

  sensor.setPulseAmplitudeIR(
    irPower
  );

  sensor.setPulseAmplitudeRed(
    redPower
  );
}


// ========================================================================
// READ LM35 TEMPERATURE
// ========================================================================

void readLM35()
{
  // Read the calibrated ADC voltage in millivolts.
  uint32_t voltage_mV = analogReadMilliVolts(LM35_PIN);

  // LM35 produces approximately 10 mV for every 1 degree Celsius.
  temperatureC = voltage_mV / 10.0f;

  // Basic sanity limit for an LM35 measurement.
  if (temperatureC < -55.0f || temperatureC > 150.0f)
  {
    temperatureC = 0.0f;
  }
}


// ========================================================================
// I2C SCANNER
// ========================================================================

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
    Wire.beginTransmission(address);

    uint8_t error =
      Wire.endTransmission();

    if (error == 0)
    {
      Serial.print(
        "I2C device found at 0x"
      );

      if (address < 16)
        Serial.print("0");

      Serial.println(
        address,
        HEX
      );

      found++;
    }
  }

  if (found == 0)
  {
    Serial.println(
      "No I2C devices found!"
    );
  }

  Serial.println(
    "Expected:"
  );

  Serial.println(
    "MAX30102 -> 0x57"
  );

  Serial.println(
    "BMI323  -> 0x68 or 0x69"
  );

  Serial.println(
    "OLED    -> 0x3C"
  );

  Serial.println(
    "=============================================="
  );
}


// ========================================================================
// BMI323 SETUP
// ========================================================================

void setupBMI323()
{
  Serial.println();
  Serial.println(
    "Initializing BMI323..."
  );


  // First try 0x68
  Serial.println(
    "Trying BMI323 at 0x68..."
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


  // If 0x68 fails, try 0x69
  Serial.println(
    "0x68 failed."
  );

  Serial.println(
    "Trying BMI323 at 0x69..."
  );


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

  Serial.println(
    "Check:"
  );

  Serial.println(
    "1. VCC -> 3.3V"
  );

  Serial.println(
    "2. GND -> GND"
  );

  Serial.println(
    "3. SDA -> GPIO 21"
  );

  Serial.println(
    "4. SCL -> GPIO 22"
  );

  Serial.println(
    "5. I2C address 0x68/0x69"
  );
}


// ========================================================================
// READ BMI323
// ========================================================================

void readBMI323()
{
  if (!bmiReady)
    return;


  if (
    millis() - lastBMIRead <
    BMI_READ_INTERVAL
  )
  {
    return;
  }

  lastBMIRead = millis();


  // ------------------------------------------------
  // ACCELEROMETER
  // ------------------------------------------------

  bool accelOK =
    imu.readAccel(
      accelX,
      accelY,
      accelZ
    );


  // ------------------------------------------------
  // GYROSCOPE
  // ------------------------------------------------

  bool gyroOK =
    imu.readGyro(
      gyroX,
      gyroY,
      gyroZ
    );


  if (!accelOK || !gyroOK)
  {
    Serial.println(
      "BMI323 read error!"
    );

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
    *
    180.0 /
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
    *
    180.0 /
    PI;


  // ------------------------------------------------
  // BMI323 INTERNAL TEMPERATURE
  // ------------------------------------------------

  float temp;

  if (
    imu.getTemperature(temp)
  )
  {
    bmiTemperature = temp;
  }


  // ------------------------------------------------
  // MOTION HISTORY
  // ------------------------------------------------

  accelHistory[
    accelHistoryIndex
  ] = accelMagnitude;


  accelHistoryIndex++;

  if (
    accelHistoryIndex >=
    MOTION_HISTORY_SIZE
  )
  {
    accelHistoryIndex = 0;
  }


  // ------------------------------------------------
  // CALCULATE ACCELERATION VARIANCE
  // ------------------------------------------------

  float mean = 0;

  for (
    uint8_t i = 0;
    i < MOTION_HISTORY_SIZE;
    i++
  )
  {
    mean += accelHistory[i];
  }

  mean /=
    MOTION_HISTORY_SIZE;


  accelVariance = 0;


  for (
    uint8_t i = 0;
    i < MOTION_HISTORY_SIZE;
    i++
  )
  {
    float difference =
      accelHistory[i] - mean;

    accelVariance +=
      difference * difference;
  }


  accelVariance /=
    MOTION_HISTORY_SIZE;


  // ------------------------------------------------
  // MOTION DETECTION
  // ------------------------------------------------

  motionDetected =
    accelVariance > 0.05;


  float gravityDeviation =
    fabs(
      accelMagnitude - 1.0
    );


  if (
    gravityDeviation < 0.05 &&
    gyroMagnitude < 5.0
  )
  {
    motionState = "STABLE";
  }
  else if (
    gravityDeviation < 0.20 &&
    gyroMagnitude < 30.0
  )
  {
    motionState = "LIGHT";
  }
  else
  {
    motionState = "ACTIVE";
  }
}


// ========================================================================
// PRINT BMI323 DATA
// ========================================================================

void printBMIData()
{
  if (!bmiReady)
  {
    Serial.println(
      "BMI323: NOT DETECTED"
    );

    return;
  }


  Serial.print(
    "ACCEL_X:"
  );

  Serial.print(
    accelX,
    3
  );


  Serial.print(
    ", ACCEL_Y:"
  );

  Serial.print(
    accelY,
    3
  );


  Serial.print(
    ", ACCEL_Z:"
  );

  Serial.print(
    accelZ,
    3
  );


  Serial.print(
    ", GYRO_X:"
  );

  Serial.print(
    gyroX,
    2
  );


  Serial.print(
    ", GYRO_Y:"
  );

  Serial.print(
    gyroY,
    2
  );


  Serial.print(
    ", GYRO_Z:"
  );

  Serial.print(
    gyroZ,
    2
  );


  Serial.print(
    ", ACC_MAG:"
  );

  Serial.print(
    accelMagnitude,
    3
  );


  Serial.print(
    ", GYRO_MAG:"
  );

  Serial.print(
    gyroMagnitude,
    2
  );


  Serial.print(
    ", BMI_TEMP:"
  );

  Serial.print(
    bmiTemperature,
    2
  );


  Serial.print(
    ", MOTION:"
  );

  Serial.println(
    motionState
  );
}


// ========================================================================
// OLED HEART PAGE
// ========================================================================

void renderHeartPage()
{
  display.clearDisplay();

  display.setTextWrap(false);

  display.setTextColor(
    SSD1306_WHITE
  );


  // Header
  display.setTextSize(1);

  display.setCursor(0, 0);

  display.print(
    "HEART MONITOR"
  );


  display.setCursor(105, 0);

  display.print("1/2");


  // BPM
  display.setTextSize(2);

  display.setCursor(0, 12);

  display.print("BPM");


  // SpO2
  display.setCursor(72, 12);

  display.print("SpO2");


  // BPM value
  display.setTextSize(3);

  display.setCursor(0, 32);


  if (
    bpm > 20 &&
    bpm < 250
  )
  {
    display.print(
      (int)bpm
    );
  }
  else if (
    env < MIN_SIGNAL_QUALITY
  )
  {
    display.setTextSize(1);

    display.setCursor(0, 35);

    display.print(
      "LOW SIGNAL"
    );
  }
  else
  {
    display.print("--");
  }


  // SpO2 value
  display.setTextSize(3);

  display.setCursor(72, 32);


  if (spo2 > 70)
  {
    display.print(
      (int)spo2
    );

    display.setTextSize(1);

    display.setCursor(117, 34);

    display.print("%");
  }
  else
  {
    display.print("--");
  }


  // Heart animation
  if (
    millis() < heartBeatTimer
  )
  {
    drawHeart(
      48,
      52,
      SSD1306_WHITE
    );
  }


  display.display();
}


// ========================================================================
// OLED BMI PAGE
// ========================================================================

void renderBMIPage()
{
  display.clearDisplay();

  display.setTextColor(
    SSD1306_WHITE
  );

  display.setTextWrap(false);


  // Header
  display.setTextSize(1);

  display.setCursor(0, 0);

  display.print(
    "BMI323 MOTION"
  );


  display.setCursor(105, 0);

  display.print("2/2");


  // Separator
  display.drawLine(
    0,
    9,
    127,
    9,
    SSD1306_WHITE
  );


  // Accelerometer
  display.setCursor(0, 13);

  display.print("A:");

  display.print(
    accelX,
    1
  );

  display.print(",");

  display.print(
    accelY,
    1
  );

  display.print(",");

  display.print(
    accelZ,
    1
  );


  // Gyroscope
  display.setCursor(0, 23);

  display.print("G:");

  display.print(
    gyroX,
    0
  );

  display.print(",");

  display.print(
    gyroY,
    0
  );

  display.print(",");

  display.print(
    gyroZ,
    0
  );


  // Acceleration magnitude
  display.setCursor(0, 33);

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


  // Gyro magnitude
  display.setCursor(0, 43);

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


  // Motion state
  display.setCursor(0, 53);

  display.print(
    "Motion:"
  );

  display.print(
    motionState
  );


  display.display();
}


// ========================================================================
// OLED PAGE MANAGER
// ========================================================================

void updateDisplay()
{
  if (
    millis() - lastPageChange >
    PAGE_INTERVAL
  )
  {
    currentPage++;

    if (
      currentPage >= TOTAL_PAGES
    )
    {
      currentPage = 0;
    }

    lastPageChange =
      millis();
  }


  if (
    currentPage == PAGE_HEART
  )
  {
    renderHeartPage();
  }
  else
  {
    renderBMIPage();
  }
}


// ========================================================================
// SETUP
// ========================================================================

void setup()
{
  Serial.begin(115200);

  delay(300);


  Serial.println();
  Serial.println(
    "=========================================="
  );

  Serial.println(
    " ESP32 HEALTH MONITOR"
  );

  Serial.println(
    " MAX30102 + AD8232 + BMI323"
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
    display.clearDisplay();

    display.setTextWrap(true);

    display.setTextSize(2);

    display.setTextColor(
      SSD1306_WHITE
    );

    display.setCursor(
      0,
      10
    );

    display.println(
      "Sensor Error!"
    );

    display.display();

    Serial.println(
      "MAX30102 not found!"
    );

    while (1)
    {
      delay(10);
    }
  }


  // ------------------------------------------------
  // MAX30102 CONFIGURATION
  // ------------------------------------------------

  sensor.setup(
    0,
    8,
    2,
    400,
    411,
    4096
  );


  sensor.setPulseAmplitudeIR(
    irPower
  );

  sensor.setPulseAmplitudeRed(
    redPower
  );


  Serial.println(
    "MAX30102 initialized."
  );


  // ------------------------------------------------
  // ECG ADC
  // ------------------------------------------------

#if defined(ESP32)

  analogReadResolution(12);

  analogSetPinAttenuation(
    ECG_OUTPUT_PIN,
    ADC_11db
  );

#endif

  // ------------------------------------------------
  // LM35 TEMPERATURE ADC
  // ------------------------------------------------

  pinMode(LM35_PIN, INPUT);

#if defined(ESP32)
  analogSetPinAttenuation(
    LM35_PIN,
    ADC_11db
  );
#endif


  // ------------------------------------------------
  // START SCREEN
  // ------------------------------------------------

  scrollText(
    "Combined Health Monitor",
    1
  );


  // ------------------------------------------------
  // WAIT FOR FINGER
  // ------------------------------------------------

  Serial.println(
    "Waiting for finger..."
  );


  while (
    sensor.getIR() < 20000
  )
  {
    if (
      scrollText(
        "Place finger on sensor",
        1,
        true
      )
    )
    {
      break;
    }
  }


  delay(200);


  resetState();


  Serial.println(
    "Finger detected."
  );

  Serial.println(
    "Starting readings..."
  );


  Serial.println();

  Serial.println(
    "BMI323 STATUS:"
  );

  if (bmiReady)
  {
    Serial.print(
      "BMI323 address: 0x"
    );

    Serial.println(
      bmiAddress,
      HEX
    );
  }
  else
  {
    Serial.println(
      "BMI323 NOT AVAILABLE"
    );
  }


  lastPageChange =
    millis();
}


// ========================================================================
// MAIN LOOP
// ========================================================================

void loop()
{
  // ================================================================
  // MAX30102
  // ================================================================

  int32_t irRaw =
    sensor.getIR();

  int32_t redRaw =
    sensor.getRed();


  // ------------------------------------------------
  // FINGER REMOVED
  // ------------------------------------------------

  if (
    irRaw < 20000 &&
    warmupDone
  )
  {
    resetState();


    while (true)
    {
      if (
        scrollText(
          "Place your finger on sensor",
          1,
          true
        )
      )
      {
        break;
      }

      if (
        sensor.getIR() >= 20000
      )
      {
        break;
      }
    }


    delay(200);

    resetState();

    return;
  }


  // ------------------------------------------------
  // WARMUP
  // ------------------------------------------------

  if (!warmupDone)
  {
    if (
      warmupStart == 0
    )
    {
      warmupStart =
        millis();
    }


    if (
      millis() - warmupStart >=
      WARMUP_MS
    )
    {
      warmupDone = true;

      warmupStart = 0;
    }
  }


  // ------------------------------------------------
  // AUTO LED POWER ADJUSTMENT
  // ------------------------------------------------

  if (
    millis() - lastAdjustTime >
    50
  )
  {
    bool adjusted = false;


    // IR
    if (
      irRaw < 60000 &&
      irPower < 250
    )
    {
      irPower += 2;

      adjusted = true;
    }
    else if (
      irRaw > 220000 &&
      irPower > 5
    )
    {
      irPower =
        (irPower > 10)
        ? irPower - 5
        : 5;

      adjusted = true;
    }
    else if (
      irRaw > 180000 &&
      irPower > 5
    )
    {
      irPower -= 2;

      adjusted = true;
    }


    // RED
    if (
      redRaw < 60000 &&
      redPower < 250
    )
    {
      redPower += 2;

      adjusted = true;
    }
    else if (
      redRaw > 220000 &&
      redPower > 5
    )
    {
      redPower =
        (redPower > 10)
        ? redPower - 5
        : 5;

      adjusted = true;
    }
    else if (
      redRaw > 180000 &&
      redPower > 5
    )
    {
      redPower -= 2;

      adjusted = true;
    }


    if (adjusted)
    {
      sensor.setPulseAmplitudeIR(
        irPower
      );

      sensor.setPulseAmplitudeRed(
        redPower
      );
    }


    lastAdjustTime =
      millis();
  }


  // ------------------------------------------------
  // DC REMOVAL
  // ------------------------------------------------

  dcIR =
    dcIR +
    ((irRaw - dcIR) >> SHIFT_DC);


  dcRED =
    dcRED +
    ((redRaw - dcRED) >> SHIFT_DC);


  int32_t irAC =
    dcIR - irRaw;


  int32_t redAC =
    dcRED - redRaw;


  // ------------------------------------------------
  // MIN / MAX
  // ------------------------------------------------

  if (
    irAC > irMax
  )
  {
    irMax = irAC;
  }

  if (
    irAC < irMin
  )
  {
    irMin = irAC;
  }

  if (
    redAC > redMax
  )
  {
    redMax = redAC;
  }

  if (
    redAC < redMin
  )
  {
    redMin = redAC;
  }


  // ------------------------------------------------
  // SCALE IR
  // ------------------------------------------------

  int32_t x =
    irAC / 8;


  // ------------------------------------------------
  // ENVELOPE
  // ------------------------------------------------

  float absx =
    (x >= 0)
    ? x
    : -x;


  env =
    envAlpha * env +
    (1.0f - envAlpha) * absx;


  float thresh =
    0.5f * env;


  // ------------------------------------------------
  // PEAK DETECTION
  // ------------------------------------------------

  bool isPeak =
    (prev > prev2) &&
    (prev > x) &&
    (prev > thresh) &&
    (env >= MIN_SIGNAL_QUALITY);


  bool beatFired = false;


  if (isPeak)
  {
    uint32_t now =
      millis();


    uint32_t dt =
      now - lastBeatMs;


    if (
      dt > REFRACTORY_MS
    )
    {
      beatCount++;


      lastBeatMs =
        now;


      lastBeatDetectedMs =
        now;


      beatFired = true;


      // ------------------------------------------------
      // BPM
      // ------------------------------------------------

      if (
        beatCount > 1
      )
      {
        float instBpm =
          60000.0f / dt;


        if (
          bpm == 0
        )
        {
          bpm = instBpm;
        }
        else if (
          instBpm > bpm * 1.4f
        )
        {
          bpm =
            0.98f * bpm +
            0.02f * instBpm;
        }
        else
        {
          bpm =
            0.70f * bpm +
            0.30f * instBpm;
        }


        // ------------------------------------------------
        // SpO2
        // ------------------------------------------------

        float acIRAmp =
          (float)(
            irMax - irMin
          );


        float acREDAmp =
          (float)(
            redMax - redMin
          );


        if (
          acIRAmp > 1 &&
          acREDAmp > 1 &&
          dcIR > 1 &&
          dcRED > 1
        )
        {
          float nir =
            acIRAmp / dcIR;


          float nred =
            acREDAmp / dcRED;


          if (
            nir > 0.000001f
          )
          {
            Rratio =
              nred / nir;


            float spo2Inst =
              clampf(
                110.0f -
                25.0f * Rratio,
                70.0f,
                100.0f
              );


            if (
              spo2 == 0
            )
            {
              spo2 =
                spo2Inst;
            }


            spo2 =
              0.80f * spo2 +
              0.20f * spo2Inst;


            lastSpo2DetectedMs =
              now;
          }
        }
      }


      // Reset waveform window
      irMax = INT32_MIN;
      irMin = INT32_MAX;

      redMax = INT32_MIN;
      redMin = INT32_MAX;
    }
  }


  // ------------------------------------------------
  // TIMEOUTS
  // ------------------------------------------------

  if (
    bpm > 0 &&
    millis() -
    lastBeatDetectedMs >
    BPM_TIMEOUT_MS
  )
  {
    bpm = 0;
  }


  if (
    spo2 > 0 &&
    millis() -
    lastSpo2DetectedMs >
    SPO2_TIMEOUT_MS
  )
  {
    spo2 = 0;
  }


  prev2 = prev;

  prev = x;


  // ================================================================
  // AD8232 ECG
  // ================================================================

  int ecgValue = 0;


  if (
    digitalRead(
      ECG_LO_PLUS
    ) == 1 ||

    digitalRead(
      ECG_LO_MINUS
    ) == 1
  )
  {
    // Leads OFF

    ecgValue = 0;
  }
  else
  {
    ecgValue =
      analogRead(
        ECG_OUTPUT_PIN
      );
  }


  // ================================================================
  // BMI323
  // ================================================================

  readBMI323();


  // ================================================================
  // LM35 TEMPERATURE
  // ================================================================

  readLM35();


  // ================================================================
  // SERIAL OUTPUT
  // ================================================================

  Serial.print(
    "ECG:"
  );

  Serial.print(
    ecgValue
  );


  // MAX30102 PPG signals
  // IR_Signal = processed IR PPG waveform
  // Red_Signal = raw Red LED PPG waveform
  Serial.print(
    ", IR_Signal:"
  );

  Serial.print(
    x
  );


  // IMPORTANT:
  // The dashboard parser expects the exact key "Red_Signal".
  Serial.print(
    ", Red_Signal:"
  );

  Serial.print(
    redRaw
  );


  Serial.print(
    ", Threshold:"
  );

  Serial.print(
    thresh
  );


  Serial.print(
    ", BPM:"
  );

  Serial.print(
    bpm
  );


  Serial.print(
    ", SpO2:"
  );

  Serial.print(
    spo2
  );


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


  Serial.print(
    ", AccMag:"
  );

  Serial.print(
    accelMagnitude,
    2
  );


  // IMPORTANT:
  // The dashboard parser expects the exact format:
  // LM35:36.5
  Serial.print(
    ", LM35:"
  );

  Serial.print(
    temperatureC,
    1
  );


  Serial.print(
    ", Motion:"
  );

  Serial.println(
    motionState
  );


  // ================================================================
  // OLED
  // ================================================================

  updateDisplay();


  // ================================================================
  // HEART ANIMATION
  // ================================================================

  if (beatFired)
  {
    heartBeatTimer =
      millis() + 150;
  }
}
