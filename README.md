# VitalStream Realtime

Built a website
Use mongodb as database
and no need to use supabase
BUILD A REAL-TIME HEALTH MONITORING WEBSITE — ESP32 + ECG + PPG

I want you to completely rebuild my health monitoring website as a real hardware-integrated application.

This is NOT a demo website.

This is NOT a simulated health dashboard.

This application will receive REAL-TIME data from physical biomedical sensors connected to an ESP32 and display that real data in the browser.

The most important requirement is the reliability of the:

SENSOR → ESP32 → COMMUNICATION → BROWSER → DATA PARSER → REAL-TIME DASHBOARD

pipeline.

1. ABSOLUTE REQUIREMENT — ZERO FAKE DATA

I DO NOT WANT ANY FAKE DATA.

There must be ZERO:

random data

simulated data

synthetic ECG

synthetic PPG

random BPM

random SpO₂

hardcoded BPM

hardcoded SpO₂

fake heart-rate values

fake ECG animations

fake PPG animations

mock sensor APIs

placeholder physiological measurements

demo sensor values

generated health readings

DO NOT USE:

Math.random()

or any equivalent random-data generator for sensor measurements.

DO NOT create a Demo Mode.

DO NOT create a Simulation Mode.

DO NOT create mock sensor responses.

ALL physiological measurements must come from the physical sensors through the ESP32.

If no sensor data is available, display:

"--"

or:

"Waiting for sensor data"

instead of inventing a value.

2. HARDWARE SOURCE

Use this GitHub repository as the reference for the embedded implementation:

https://github.com/AikyaNova-Pvt-Ltd/Aikyanova_Labs_Embedded_Systems

Inspect the repository and its biomedical sensor examples before implementing the frontend communication.

Relevant sensors/examples include:

AD8232 ECG

MAX30102 PPG

MAX30102 raw values

MAX30102 raw waveform

MAX30102 BPM

MAX30102 SpO₂

Use the repository's actual firmware behavior and output format as the reference.

DO NOT invent a completely different sensor protocol without first checking the repository.

3. SYSTEM ARCHITECTURE

Build the application around this architecture:

PHYSICAL ECG SENSOR
↓
ESP32
↓
ECG SAMPLE DATA
↓
COMMUNICATION LAYER
↓
BROWSER
↓
DATA PARSER
↓
DATA VALIDATOR
↓
SENSOR DATA STORE
↓
REAL-TIME ECG GRAPH

PHYSICAL MAX30102
↓
ESP32
↓
IR + RED PPG DATA
↓
BPM / SpO₂ PROCESSING
↓
COMMUNICATION LAYER
↓
BROWSER
↓
DATA PARSER
↓
DATA VALIDATOR
↓
SENSOR DATA STORE
↓
BPM + SpO₂ + PPG GRAPH

4. PRIMARY COMMUNICATION — WEB SERIAL

The first and most important communication method must be:

ESP32 → USB → Browser Web Serial API

Implement the Web Serial API.

Create a prominent:

"CONNECT ESP32"

button.

When clicked:

Request serial port.

Allow the user to select the ESP32 COM port.

Open the port.

Use the correct baud rate.

Continuously read incoming data.

Buffer incoming chunks.

Detect complete packets.

Parse packets.

Validate packets.

Update the real-time dashboard.

Default baud rate:

115200

But make the baud rate configurable in Settings.

5. SERIAL SERVICE

Create a dedicated service:

src/services/serialTransport.ts

It must provide:

connect()

disconnect()

isConnected()

onData()

onError()

onConnectionChange()

The serial reader must correctly handle:

partial packets

multiple packets in one read

newline characters

carriage returns

empty lines

malformed packets

disconnects

permission errors

browser compatibility errors

Do NOT assume one browser read equals one complete sensor packet.

6. DATA PROTOCOL

First inspect the firmware from the provided repository.

If the ESP32 firmware outputs JSON, support JSON.

Example:

{
"timestamp": 123456,
"ecg": 2048,
"ppgIR": 52341,
"ppgRed": 48213,
"bpm": 76,
"spo2": 98
}

If the firmware outputs CSV, support CSV.

For example:

123456,2048,52341,48213,76,98

The frontend must normalize different packet formats into one internal structure.

Create:

interface SensorPacket {
timestamp?: number;
ecg?: number;
ppgIR?: number;
ppgRed?: number;
bpm?: number;
spo2?: number;
signalQuality?: number;
}

Do not invent missing fields.

If a packet contains only ECG:

{
ecg: 2048
}

then update only ECG.

Do not create BPM or SpO₂ values.

7. DATA PARSER

Create:

src/services/parser/

with:

packetParser.ts

The parser should:

Receive raw serial data.

Detect packet format.

Parse JSON or CSV.

Normalize field names.

Convert numeric strings to numbers.

Reject malformed packets.

Return normalized SensorPacket objects.

Example:

Raw:

"1234,2048,52341,48213,76,98"

Parsed:

{
timestamp: 1234,
ecg: 2048,
ppgIR: 52341,
ppgRed: 48213,
bpm: 76,
spo2: 98
}

8. DATA VALIDATION

Create:

src/services/validation/

sensorValidator.ts

Validate:

data type

numeric values

finite values

missing fields

invalid packets

unrealistic values

packet structure

Do not silently accept corrupt sensor packets.

Maintain:

packetsReceived

packetsProcessed

packetsRejected

lastValidPacket

lastPacketTime

malformedPacketCount

validationErrorCount

9. CENTRAL SENSOR STORE

Use a central state-management system such as Zustand.

Create:

src/store/sensorStore.ts

Maintain:

connectionState

transportType

deviceName

lastPacketTime

bpm

spo2

ecgCurrent

ppgIRCurrent

ppgRedCurrent

signalQuality

ecgHistory

ppgIRHistory

ppgRedHistory

bpmHistory

spo2History

packetCount

errorCount

sampleRate

latency

sensorStatus

Do NOT create independent sensor streams inside individual UI components.

The store must be the single source of truth.

10. ECG

The ECG section must display actual ECG data from the physical ECG sensor.

Display:

real-time ECG waveform

current ECG sample

ECG sample rate

ECG sample count

signal status

connection status

The ECG graph must use actual incoming samples.

For example:

ESP32 ECG sample
→ parser
→ store
→ ECG graph

There must be no independently generated graph points.

11. ECG GRAPH

Create a professional real-time ECG graph.

Requirements:

scrolling waveform

last 5–10 seconds

configurable time window

real incoming samples

smooth rendering

timestamps

pause

resume

clear

responsive

automatic scaling

If the firmware provides heartbeat peaks, display those actual peaks.

Do NOT fabricate peak markers.

Do not display a decorative ECG animation.

12. MAX30102 PPG

Display real MAX30102 data.

The MAX30102 provides:

IR signal

RED signal

Display:

IR

RED

and combined PPG waveform.

The graph must use actual incoming values.

13. BPM

Create a prominent BPM card.

Display:

Heart Rate

XX BPM

However:

The BPM value MUST originate from actual ESP32/sensor processing.

If no BPM has been received:

--

Waiting for BPM data

Do NOT calculate a fake BPM.

Do NOT display a default 72 BPM.

Do NOT animate BPM.

14. SpO₂

Create a prominent SpO₂ card.

Display:

Blood Oxygen

XX %

The value must originate from the actual MAX30102 processing running on the ESP32 or from a clearly validated calculation based on actual sensor data.

If no valid SpO₂ data has arrived:

--

Waiting for SpO₂ data

Never display a default 98%.

15. ADDITIONAL REAL PARAMETERS

Where actual sensor data supports them, display:

BPM

SpO₂

ECG raw signal

PPG IR

PPG RED

pulse waveform

signal quality

sample rate

packets/sec

latency

sensor status

connection status

Only display additional physiological parameters if they are genuinely supported by the hardware/firmware.

Do NOT invent:

blood pressure

glucose

temperature

respiratory rate

cardiac output

disease diagnosis

ischemia detection

fibrosis detection

amyloidosis detection

unless the hardware and implemented algorithm actually provides validated measurements for them.

For unavailable metrics show:

"Not available from current sensors"

16. CONNECTION STATUS

Create a permanent connection-status section.

States:

DISCONNECTED

CONNECTING

CONNECTED

RECEIVING DATA

NO DATA

ERROR

Example:

ESP32
CONNECTED

Transport:
USB Serial

Baud:
115200

Data:
RECEIVING

Packets:
12,842

Last packet:
24 ms ago

17. IMPORTANT CONNECTION DISTINCTION

Do NOT consider:

Serial connected

to mean:

Sensor connected.

These are different states.

Example:

USB Serial:
CONNECTED

Sensor Data:
NOT RECEIVING

ECG:
WAITING

PPG:
WAITING

This distinction is essential.

18. HARDWARE SETUP PAGE

Create a Hardware Setup page.

Explain the physical architecture.

For MAX30102, use the documented wiring:

MAX30102 → ESP32

VIN → 3.3V

GND → GND

SDA → GPIO 21

SCL → GPIO 22

For AD8232:

Inspect the repository and use the actual documented pin configuration.

Do not invent pins.

Also show:

ESP32 → USB → Browser

19. DEVICE CONNECTION WIZARD

Create a connection workflow:

STEP 1
Choose USB Serial

STEP 2
Connect ESP32

STEP 3
Detect incoming data

STEP 4
Validate packets

STEP 5
Detect ECG

STEP 6
Detect PPG

STEP 7
Start monitoring

Do not mark the system as fully active until actual sensor packets are received.

20. HARDWARE CONNECTION TEST

Create:

"Test Hardware Connection"

The test must verify:

ESP32 connection

↓

Serial communication

↓

Packet reception

↓

Packet parsing

↓

ECG data

↓

PPG IR

↓

PPG RED

↓

BPM

↓

SpO₂

Show:

PASS

FAIL

WAITING

Example:

ESP32 ........ PASS
Serial ....... PASS
Packets ...... PASS
ECG .......... PASS
PPG IR ....... PASS
PPG RED ...... PASS
BPM .......... PASS
SpO₂ ......... PASS

Do not report PASS unless real data has actually been received.

21. RAW SERIAL CONSOLE

Create a developer diagnostics panel.

Display the exact raw packets arriving from the ESP32.

Example:

RAW PACKET

123456,2048,52341,48213,76,98

Then show:

PARSED PACKET

ECG: 2048

PPG IR: 52341

PPG RED: 48213

BPM: 76

SpO₂: 98

VALIDATION:

PASS

This feature is essential for debugging the hardware/software connection.

22. PACKET STATISTICS

Display:

Packets received

Packets/sec

Packets rejected

ECG samples

PPG samples

BPM updates

SpO₂ updates

Last packet time

Data latency

23. REAL-TIME DATA BUFFER

Use bounded rolling buffers.

For example:

ECG:
5000 samples

PPG:
2500 samples

BPM:
300 values

SpO₂:
300 values

The exact values should be configurable.

Do not allow unlimited memory growth.

24. PERFORMANCE

The application must support continuous ECG and PPG streams.

Do NOT re-render the entire React application for every ECG sample.

Use:

requestAnimationFrame

efficient chart updates

ring buffers

memoization

batched updates

efficient state updates

The dashboard must remain smooth while receiving high-frequency sensor data.

25. DATA RECORDING

Allow the user to:

START SESSION

STOP SESSION

During the session record actual incoming values:

timestamp

ECG

PPG IR

PPG RED

BPM

SpO₂

signal quality

connection status

Do not record generated values.

26. DATA EXPORT

Provide:

Export CSV

Export JSON

CSV structure:

timestamp,ecg,ppgIR,ppgRed,bpm,spo2,signalQuality

Only export values actually received from the ESP32.

Missing values should remain empty/null.

Do not replace missing values with zero or fake values.

27. LIVE DATA FLOW INDICATOR

Create a visual pipeline:

ESP32

↓

Serial

↓

Parser

↓

Validator

↓

Sensor Store

↓

Dashboard

Each stage should display:

CONNECTED

WAITING

ERROR

This will allow me to immediately identify where the hardware/software connection is failing.

28. DISCONNECT BEHAVIOR

When ESP32 disconnects:

Detect disconnect.

Stop accepting data.

Stop live waveform updates.

Stop BPM updates.

Stop SpO₂ updates.

Display disconnected status.

Preserve previous session data where appropriate.

Do NOT generate replacement values.

Example:

ESP32 DISCONNECTED

LIVE DATA STOPPED

BPM: --

SpO₂: --

ECG: NO SIGNAL

29. ERROR HANDLING

Handle:

ESP32 unavailable

serial permission denied

wrong COM port

wrong baud rate

browser does not support Web Serial

ESP32 disconnected

sensor not initialized

no sensor data

malformed packet

invalid values

communication timeout

parser failure

Use meaningful messages.

Example:

"ESP32 connected, but no valid sensor packets have been received."

30. WEB SERIAL BROWSER SUPPORT

Detect Web Serial support.

If unsupported, show:

"Web Serial is not supported by this browser. Please use a supported Chromium-based browser such as Google Chrome or Microsoft Edge on desktop."

Do not crash the application.

31. WIFI SUPPORT — ARCHITECTURE

After Web Serial is working, architect the project so Wi-Fi can be added.

Use:

ESP32
↓
Wi-Fi
↓
WebSocket
↓
Browser

Create an abstraction:

TransportManager

with:

SerialTransport

and future:

WebSocketTransport

Do not rewrite the entire application when Wi-Fi is added.

The dashboard should consume normalized SensorPacket objects regardless of transport.

32. UI DESIGN

Create a professional biomedical monitoring dashboard.

Use a dark, modern interface.

Prioritize functionality over decoration.

Dashboard:

TOP:

ESP32 Status

Connection

Transport

Session

MAIN CARDS:

BPM

SpO₂

ECG Status

PPG Status

MAIN GRAPHS:

ECG

PPG IR / RED

SECONDARY GRAPHS:

BPM trend

SpO₂ trend

DIAGNOSTICS:

Packet rate

Sample rate

Latency

Packets received

Sensor status

33. RESPONSIVE DESIGN

Support:

Desktop

Laptop

Tablet

Mobile

Prioritize desktop for real-time monitoring because ECG/PPG graphs require sufficient width.

34. ACCESSIBILITY

Use:

readable typography

high contrast

keyboard accessibility

visible focus

descriptive status text

proper labels

Do not communicate status only through colors.

Use text:

CONNECTED

DISCONNECTED

RECEIVING DATA

ERROR

35. MEDICAL DISCLAIMER

This is a research/prototype health monitoring system.

Display:

" For research and monitoring purposes only. Sensor measurements may require calibration and clinical validation and should not be used as a substitute for professional medical diagnosis."

Do not claim the system provides clinical diagnosis.

36. PROJECT STRUCTURE

Use a clean TypeScript architecture:

src/

components/

dashboard/

charts/

metrics/

connection/

diagnostics/

hardware/


services/

serial/

websocket/

parser/

validation/

export/


store/

sensorStore.ts


hooks/

useSerial.ts

useSensorData.ts

useConnection.ts


types/

sensor.ts

packets.ts


utils/

buffers.ts

timestamps.ts


pages/

Dashboard.tsx

HardwareSetup.tsx

Diagnostics.tsx

Settings.tsx


37. DO NOT PUT HARDWARE CODE INSIDE UI

The React components should NOT directly read from the serial port.

Use:

Serial Service
↓
Parser
↓
Validator
↓
Store
↓
React Components

This separation is mandatory.

38. SETTINGS

Provide:

Communication Method

Baud Rate

Graph Time Window

ECG Buffer Size

PPG Buffer Size

Diagnostics

Session Recording

The default communication method must be:

USB Serial

Default baud rate:

115200

39. NO FAKE FALLBACKS

This is one of the most important requirements.

If:

ESP32 = disconnected

then:

BPM = --

SpO₂ = --

ECG = no data

PPG = no data

If:

ESP32 = connected

but sensor data = unavailable

then:

BPM = --

SpO₂ = --

ECG = waiting

PPG = waiting

If:

ECG is available but PPG is not:

ECG = LIVE

PPG = WAITING

BPM = --

SpO₂ = --

Do not fabricate missing values.

40. DEVELOPMENT PROCESS

Build in this exact order:

PHASE 1
Inspect the GitHub repository.

PHASE 2
Understand the actual ESP32 sensor output.

PHASE 3
Implement Web Serial connection.

PHASE 4
Show raw incoming packets.

PHASE 5
Implement parser.

PHASE 6
Implement validation.

PHASE 7
Display raw ECG.

PHASE 8
Display raw PPG.

PHASE 9
Display actual BPM.

PHASE 10
Display actual SpO₂.

PHASE 11
Build real-time ECG graph.

PHASE 12
Build real-time PPG graph.

PHASE 13
Add session recording.

PHASE 14
Add CSV/JSON export.

PHASE 15
Add diagnostics.

PHASE 16
Polish UI.

Do not start by creating fake chart data.

41. TESTING

Create tests for:

packet parser

JSON packets

CSV packets

malformed packets

missing fields

invalid numeric values

range validation

serial disconnect

serial reconnect

buffer management

data normalization

CSV export

JSON export

The tests must use fixed example packets, NOT random physiological data.

42. FINAL ACCEPTANCE TEST

The website will only be considered complete when I can perform this workflow using my physical hardware:

Connect ECG sensor to ESP32.

Connect MAX30102 to ESP32.

Power ESP32.

Upload sensor firmware.

Open the website.

Click "Connect ESP32".

Select the actual ESP32 COM port.

Open serial communication.

Receive actual sensor packets.

View raw packets.

Parse packets.

Validate packets.

Display actual ECG.

Display actual PPG IR.

Display actual PPG RED.

Display actual BPM.

Display actual SpO₂.

Display real-time ECG graph.

Display real-time PPG graph.

Record the session.

Export the real sensor data.

Disconnect ESP32.

Confirm all live measurements stop.

At NO point should the website generate its own physiological data.

43. FINAL PRINCIPLE

This is NOT:

Website → simulated health values

This IS:

PHYSICAL SENSOR
→
ESP32
→
REAL SENSOR DATA
→
SERIAL/WIFI
→
BROWSER
→
PARSER
→
VALIDATOR
→
REAL-TIME DASHBOARD

The physical sensor is the source of truth.

The ESP32 is the hardware acquisition device.

The website is the real-time monitoring, visualization, recording, and analysis interface.

NEVER manufacture physiological data.

NEVER use random data.

NEVER use fake ECG.

NEVER use fake PPG.

NEVER use fake BPM.

NEVER use fake SpO₂.

ONLY DISPLAY DATA THAT ACTUALLY COMES FROM THE SENSOR/ESP32.

Start by inspecting the provided GitHub repository and implementing the hardware communication and raw packet diagnostics FIRST. Do not proceed to advanced dashboard UI until the browser can demonstrably receive real ESP32 data.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://real-heart-pulse.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7734dc18-59ec-4974-b506-2c420e7a0433).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
