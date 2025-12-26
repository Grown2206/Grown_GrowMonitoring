/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   GROW MONITORING SYSTEM - ESP32 FIRMWARE v2.45.0               ║
 * ║   4 Pflanzen + RJ11 Growlicht-Steuerung (0-10V PWM)            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Features:
 * - 4x Kapazitive Bodenfeuchtesensoren
 * - DHT22 (Temp + Humidity)
 * - MH-Z19B CO2 Sensor (UART)
 * - BH1750 Lichtsensor (I2C)
 * - SGP30 VOC Sensor (I2C)
 * - pH Sensor (Analog)
 * - Wasserstandssensor (Analog)
 * - 4x Wasserpumpen (Relais)
 * - RJ11 Growlicht PWM 0-10V Steuerung (MCP4725 DAC)
 * - WebSocket Kommunikation
 *
 * Hardware:
 * - ESP32 DevKit v4
 * - MCP4725 12-Bit DAC (I2C → 0-10V)
 * - 8-Kanal Relais-Modul
 * - Boost Converter 5V → 10V
 *
 * Author: Grow Monitoring Team
 * License: MIT
 * Date: 2024-12-26
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>
#include <Adafruit_SGP30.h>
#include <Adafruit_MCP4725.h>

// ═══════════════════════════════════════════════════════════════════
// KONFIGURATION
// ═══════════════════════════════════════════════════════════════════

// WiFi Credentials
const char* ssid = "DEIN_WIFI_NAME";           // ← ANPASSEN
const char* password = "DEIN_WIFI_PASSWORT";   // ← ANPASSEN

// Server
const char* serverIP = "192.168.1.100";        // ← ANPASSEN (Backend IP)
const int serverPort = 3001;

// Sensor Intervalle (Millisekunden)
const unsigned long SENSOR_INTERVAL = 30000;   // 30 Sekunden
const unsigned long PUMP_CHECK_INTERVAL = 60000; // 1 Minute
const unsigned long GROWLIGHT_UPDATE = 10000;  // 10 Sekunden

// ═══════════════════════════════════════════════════════════════════
// PIN DEFINITIONEN
// ═══════════════════════════════════════════════════════════════════

// Analog Inputs (Bodenfeuchtigkeit + pH + Wasserstand)
#define MOISTURE_PIN_1    34
#define MOISTURE_PIN_2    35
#define MOISTURE_PIN_3    36
#define MOISTURE_PIN_4    39
#define PH_SENSOR_PIN     33
#define WATER_LEVEL_PIN   32

// DHT22
#define DHT_PIN           27
#define DHT_TYPE          DHT22

// UART (MH-Z19B CO2 Sensor)
#define MHZ19B_RX_PIN     16
#define MHZ19B_TX_PIN     17

// Relais (Pumpen + Reserve)
#define RELAY_PUMP_1      18
#define RELAY_PUMP_2      19
#define RELAY_PUMP_3      23
#define RELAY_PUMP_4      5
#define RELAY_GROWLIGHT   13  // Optional: ON/OFF Relais für Growlicht
#define RELAY_FAN         12
#define RELAY_RESERVE_1   14
#define RELAY_RESERVE_2   15

// Growlicht PWM (Boost Converter Enable - optional)
#define BOOST_PWM_PIN     25

// Buzzer
#define BUZZER_PIN        26

// ═══════════════════════════════════════════════════════════════════
// OBJEKTE INITIALISIERUNG
// ═══════════════════════════════════════════════════════════════════

WebSocketsClient webSocket;
DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;
Adafruit_SGP30 sgp;
Adafruit_MCP4725 dac;  // 0-10V DAC für Growlicht

HardwareSerial mhz19bSerial(2); // UART2 für MH-Z19B

// ═══════════════════════════════════════════════════════════════════
// GLOBALE VARIABLEN
// ═══════════════════════════════════════════════════════════════════

// Timers
unsigned long lastSensorRead = 0;
unsigned long lastPumpCheck = 0;
unsigned long lastGrowlightUpdate = 0;

// Sensor-Daten
struct SensorData {
  // Bodenfeuchtigkeit (0-100%)
  float moisture1 = 0;
  float moisture2 = 0;
  float moisture3 = 0;
  float moisture4 = 0;

  // Umgebung
  float temperature = 0;
  float humidity = 0;
  float vpd = 0;

  // Licht
  float lux = 0;
  float par = 0;  // µmol/m²/s (berechnet)

  // CO2
  int co2 = 0;

  // VOC
  uint16_t tvoc = 0;     // Total VOC (ppb)
  uint16_t eco2 = 0;     // eCO2 (ppm)

  // pH
  float ph = 7.0;

  // Wasserstand
  int waterLevel = 0;    // 0-100%

  // Growlicht
  int growlightBrightness = 0;  // 0-100%
  bool growlightOn = false;
};

SensorData sensors;

// Pump States
bool pumpStates[4] = {false, false, false, false};

// Growlicht Schedule
struct GrowlightSchedule {
  int onHour = 6;     // 6:00 Uhr
  int offHour = 22;   // 22:00 Uhr
  int brightness = 100; // 100%
  bool autoMode = true;
};

GrowlightSchedule growlightSchedule;

// ═══════════════════════════════════════════════════════════════════
// KALIBRIERUNGS-WERTE (ANPASSEN!)
// ═══════════════════════════════════════════════════════════════════

// Bodenfeuchtigkeit: Kalibrierung pro Sensor
// Format: {dry_value, wet_value}
const int MOISTURE_CAL[4][2] = {
  {3200, 1400},  // Sensor 1
  {3150, 1450},  // Sensor 2
  {3180, 1420},  // Sensor 3
  {3220, 1380}   // Sensor 4
};

// pH Kalibrierung (Spannung bei pH 4.0 und pH 7.0)
const float PH_VOLTAGE_4 = 2.19;  // Voltage bei pH 4.0
const float PH_VOLTAGE_7 = 1.65;  // Voltage bei pH 7.0

// Lux → PAR Konversion (abhängig von LED-Typ)
const float LUX_TO_PAR = 0.0185;  // Für weiße LEDs

// ═══════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n╔══════════════════════════════════════════╗");
  Serial.println("║  Grow Monitoring System v2.45.0         ║");
  Serial.println("║  ESP32 + RJ11 Growlicht-Steuerung      ║");
  Serial.println("╚══════════════════════════════════════════╝\n");

  // Pin Modes
  setupPins();

  // I2C Start
  Wire.begin(21, 22);  // SDA=21, SCL=22
  Serial.println("I2C initialized");

  // Sensoren initialisieren
  initSensors();

  // WiFi verbinden
  connectWiFi();

  // WebSocket
  webSocket.begin(serverIP, serverPort, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);

  Serial.println("\n✓ Setup complete!");
  Serial.println("════════════════════════════════════════════\n");
}

// ═══════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════

void loop() {
  webSocket.loop();

  unsigned long now = millis();

  // Sensoren auslesen
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;
    readAllSensors();
    sendSensorData();
  }

  // Pumpen-Check
  if (now - lastPumpCheck >= PUMP_CHECK_INTERVAL) {
    lastPumpCheck = now;
    checkPumpAutomation();
  }

  // Growlicht Update
  if (now - lastGrowlightUpdate >= GROWLIGHT_UPDATE) {
    lastGrowlightUpdate = now;
    updateGrowlight();
  }
}

// ═══════════════════════════════════════════════════════════════════
// PIN SETUP
// ═══════════════════════════════════════════════════════════════════

void setupPins() {
  // Relais als Output (Active LOW!)
  pinMode(RELAY_PUMP_1, OUTPUT);
  pinMode(RELAY_PUMP_2, OUTPUT);
  pinMode(RELAY_PUMP_3, OUTPUT);
  pinMode(RELAY_PUMP_4, OUTPUT);
  pinMode(RELAY_GROWLIGHT, OUTPUT);
  pinMode(RELAY_FAN, OUTPUT);
  pinMode(RELAY_RESERVE_1, OUTPUT);
  pinMode(RELAY_RESERVE_2, OUTPUT);

  // Alle Relais AUS (HIGH = AUS bei Active-LOW)
  digitalWrite(RELAY_PUMP_1, HIGH);
  digitalWrite(RELAY_PUMP_2, HIGH);
  digitalWrite(RELAY_PUMP_3, HIGH);
  digitalWrite(RELAY_PUMP_4, HIGH);
  digitalWrite(RELAY_GROWLIGHT, HIGH);
  digitalWrite(RELAY_FAN, HIGH);
  digitalWrite(RELAY_RESERVE_1, HIGH);
  digitalWrite(RELAY_RESERVE_2, HIGH);

  // Boost PWM (optional)
  pinMode(BOOST_PWM_PIN, OUTPUT);
  ledcSetup(0, 5000, 8);  // Channel 0, 5kHz, 8-bit
  ledcAttachPin(BOOST_PWM_PIN, 0);
  ledcWrite(0, 255);  // Boost immer an

  // Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("✓ Pins configured");
}

// ═══════════════════════════════════════════════════════════════════
// SENSOREN INITIALISIEREN
// ═══════════════════════════════════════════════════════════════════

void initSensors() {
  // DHT22
  dht.begin();
  Serial.println("✓ DHT22 initialized");

  // BH1750
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("✓ BH1750 initialized (0x23)");
  } else {
    Serial.println("✗ BH1750 not found!");
  }

  // SGP30
  if (sgp.begin()) {
    Serial.print("✓ SGP30 initialized (Serial: 0x");
    Serial.print(sgp.serialnumber[0], HEX);
    Serial.print(sgp.serialnumber[1], HEX);
    Serial.println(sgp.serialnumber[2], HEX);

    // Baseline laden (wenn gespeichert)
    // sgp.setIAQBaseline(0x9234, 0x8ABC);
  } else {
    Serial.println("✗ SGP30 not found!");
  }

  // MCP4725 DAC für Growlicht
  if (dac.begin(0x60)) {
    Serial.println("✓ MCP4725 DAC initialized (0x60)");
    dac.setVoltage(0, false);  // Start bei 0V (Licht aus)
  } else {
    Serial.println("✗ MCP4725 DAC not found!");
  }

  // MH-Z19B CO2 (UART)
  mhz19bSerial.begin(9600, SERIAL_8N1, MHZ19B_RX_PIN, MHZ19B_TX_PIN);
  Serial.println("✓ MH-Z19B UART initialized");

  delay(1000);
}

// ═══════════════════════════════════════════════════════════════════
// ALLE SENSOREN AUSLESEN
// ═══════════════════════════════════════════════════════════════════

void readAllSensors() {
  Serial.println("📊 Reading sensors...");

  // Bodenfeuchtigkeit (4 Sensoren)
  sensors.moisture1 = readMoisture(MOISTURE_PIN_1, 0);
  sensors.moisture2 = readMoisture(MOISTURE_PIN_2, 1);
  sensors.moisture3 = readMoisture(MOISTURE_PIN_3, 2);
  sensors.moisture4 = readMoisture(MOISTURE_PIN_4, 3);

  // DHT22
  sensors.temperature = dht.readTemperature();
  sensors.humidity = dht.readHumidity();

  if (!isnan(sensors.temperature) && !isnan(sensors.humidity)) {
    sensors.vpd = calculateVPD(sensors.temperature, sensors.humidity);
  }

  // BH1750 Licht
  sensors.lux = lightMeter.readLightLevel();
  sensors.par = sensors.lux * LUX_TO_PAR;

  // SGP30 VOC
  if (sgp.IAQmeasure()) {
    sensors.tvoc = sgp.TVOC;
    sensors.eco2 = sgp.eCO2;
  }

  // MH-Z19B CO2
  sensors.co2 = readMHZ19B();

  // pH Sensor
  sensors.ph = readPH();

  // Wasserstand
  sensors.waterLevel = readWaterLevel();

  // Debug-Ausgabe
  printSensorData();
}

// ═══════════════════════════════════════════════════════════════════
// BODENFEUCHTIGKEIT AUSLESEN
// ═══════════════════════════════════════════════════════════════════

float readMoisture(int pin, int sensorIndex) {
  int raw = analogRead(pin);
  int dryVal = MOISTURE_CAL[sensorIndex][0];
  int wetVal = MOISTURE_CAL[sensorIndex][1];

  // Map & Clamp (0-100%)
  float percent = map(raw, dryVal, wetVal, 0, 100);
  percent = constrain(percent, 0, 100);

  return percent;
}

// ═══════════════════════════════════════════════════════════════════
// VPD BERECHNEN
// ═══════════════════════════════════════════════════════════════════

float calculateVPD(float temp, float humidity) {
  // Sättigungsdampfdruck (kPa)
  float svp = 0.61078 * exp((17.27 * temp) / (temp + 237.3));

  // Tatsächlicher Dampfdruck
  float avp = svp * (humidity / 100.0);

  // VPD (kPa)
  float vpd = svp - avp;

  return vpd;
}

// ═══════════════════════════════════════════════════════════════════
// MH-Z19B CO2 AUSLESEN
// ═══════════════════════════════════════════════════════════════════

int readMHZ19B() {
  byte cmd[9] = {0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79};
  byte response[9];

  mhz19bSerial.write(cmd, 9);

  delay(100);

  if (mhz19bSerial.available() >= 9) {
    mhz19bSerial.readBytes(response, 9);

    if (response[0] == 0xFF && response[1] == 0x86) {
      int co2 = (response[2] << 8) | response[3];
      return co2;
    }
  }

  return 0;  // Fehler
}

// ═══════════════════════════════════════════════════════════════════
// pH SENSOR AUSLESEN
// ═══════════════════════════════════════════════════════════════════

float readPH() {
  int raw = analogRead(PH_SENSOR_PIN);
  float voltage = raw * (3.3 / 4095.0);

  // 2-Punkt Kalibrierung
  float slope = (7.0 - 4.0) / (PH_VOLTAGE_7 - PH_VOLTAGE_4);
  float ph = 7.0 + slope * (voltage - PH_VOLTAGE_7);

  // Clamp (0-14)
  ph = constrain(ph, 0, 14);

  return ph;
}

// ═══════════════════════════════════════════════════════════════════
// WASSERSTAND AUSLESEN
// ═══════════════════════════════════════════════════════════════════

int readWaterLevel() {
  int raw = analogRead(WATER_LEVEL_PIN);

  // Map zu 0-100% (Kalibrierung anpassen!)
  int percent = map(raw, 0, 4095, 0, 100);
  percent = constrain(percent, 0, 100);

  return percent;
}

// ═══════════════════════════════════════════════════════════════════
// 🌟 GROWLICHT STEUERUNG (0-10V PWM) 🌟
// ═══════════════════════════════════════════════════════════════════

void setGrowlightBrightness(int percent) {
  // Clamp 0-100%
  percent = constrain(percent, 0, 100);

  // Berechne DAC-Wert (0-4095 für 12-Bit)
  // 4095 = 5V (Ausgang von MCP4725)
  // Op-Amp verdoppelt auf 10V
  uint16_t dacValue = map(percent, 0, 100, 0, 4095);

  // DAC setzen
  dac.setVoltage(dacValue, false);

  sensors.growlightBrightness = percent;

  Serial.print("💡 Growlicht: ");
  Serial.print(percent);
  Serial.print("% (DAC: ");
  Serial.print(dacValue);
  Serial.println(")");
}

void updateGrowlight() {
  if (!growlightSchedule.autoMode) {
    return;  // Manueller Modus
  }

  // Aktuelle Zeit (NTP wird später hinzugefügt)
  // Für jetzt: Simuliere mit millis()
  int currentHour = (millis() / 3600000) % 24;  // Stunden seit Start

  if (currentHour >= growlightSchedule.onHour && currentHour < growlightSchedule.offHour) {
    // Licht AN
    if (!sensors.growlightOn) {
      Serial.println("🌅 Growlicht: AUTO ON");
      sensors.growlightOn = true;
      digitalWrite(RELAY_GROWLIGHT, LOW);  // Relais AN
    }
    setGrowlightBrightness(growlightSchedule.brightness);
  } else {
    // Licht AUS
    if (sensors.growlightOn) {
      Serial.println("🌙 Growlicht: AUTO OFF");
      sensors.growlightOn = false;
      digitalWrite(RELAY_GROWLIGHT, HIGH);  // Relais AUS
    }
    setGrowlightBrightness(0);
  }
}

void setGrowlightManual(bool on, int brightness) {
  growlightSchedule.autoMode = false;
  sensors.growlightOn = on;

  if (on) {
    digitalWrite(RELAY_GROWLIGHT, LOW);
    setGrowlightBrightness(brightness);
  } else {
    digitalWrite(RELAY_GROWLIGHT, HIGH);
    setGrowlightBrightness(0);
  }
}

// ═══════════════════════════════════════════════════════════════════
// PUMPEN STEUERUNG
// ═══════════════════════════════════════════════════════════════════

void setPump(int pumpIndex, bool state) {
  if (pumpIndex < 0 || pumpIndex >= 4) return;

  int pins[4] = {RELAY_PUMP_1, RELAY_PUMP_2, RELAY_PUMP_3, RELAY_PUMP_4};

  // Active LOW: LOW = AN, HIGH = AUS
  digitalWrite(pins[pumpIndex], state ? LOW : HIGH);
  pumpStates[pumpIndex] = state;

  Serial.print("💧 Pumpe ");
  Serial.print(pumpIndex + 1);
  Serial.println(state ? " AN" : " AUS");
}

void checkPumpAutomation() {
  // Auto-Bewässerung bei niedriger Feuchtigkeit
  float moistures[4] = {
    sensors.moisture1,
    sensors.moisture2,
    sensors.moisture3,
    sensors.moisture4
  };

  for (int i = 0; i < 4; i++) {
    if (moistures[i] < 30 && !pumpStates[i]) {
      // Zu trocken → Pumpe 5 Sekunden AN
      Serial.print("⚠️ Pflanze ");
      Serial.print(i + 1);
      Serial.println(" zu trocken! Auto-Bewässerung...");

      setPump(i, true);
      delay(5000);  // 5 Sekunden gießen
      setPump(i, false);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// SENSOR-DATEN SENDEN (WebSocket)
// ═══════════════════════════════════════════════════════════════════

void sendSensorData() {
  StaticJsonDocument<1024> doc;

  doc["type"] = "sensor_data";
  doc["device_id"] = WiFi.macAddress();

  // Bodenfeuchtigkeit
  JsonArray moisture = doc.createNestedArray("moisture");
  moisture.add(sensors.moisture1);
  moisture.add(sensors.moisture2);
  moisture.add(sensors.moisture3);
  moisture.add(sensors.moisture4);

  // Umgebung
  doc["temperature"] = sensors.temperature;
  doc["humidity"] = sensors.humidity;
  doc["vpd"] = sensors.vpd;

  // Licht
  doc["lux"] = sensors.lux;
  doc["par"] = sensors.par;

  // CO2
  doc["co2"] = sensors.co2;
  doc["eco2"] = sensors.eco2;

  // VOC
  doc["tvoc"] = sensors.tvoc;

  // pH
  doc["ph"] = sensors.ph;

  // Wasserstand
  doc["water_level"] = sensors.waterLevel;

  // Growlicht
  doc["growlight_on"] = sensors.growlightOn;
  doc["growlight_brightness"] = sensors.growlightBrightness;

  // Timestamp
  doc["timestamp"] = millis();

  String json;
  serializeJson(doc, json);

  webSocket.sendTXT(json);
  Serial.println("📤 Sensor data sent");
}

// ═══════════════════════════════════════════════════════════════════
// WEBSOCKET EVENT HANDLER
// ═══════════════════════════════════════════════════════════════════

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("🔴 WebSocket disconnected");
      break;

    case WStype_CONNECTED:
      Serial.println("🟢 WebSocket connected!");
      // Sende Initial-Daten
      sendSensorData();
      break;

    case WStype_TEXT: {
      Serial.print("📨 Message: ");
      Serial.println((char*)payload);

      // Parse JSON Command
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (!error) {
        handleCommand(doc);
      }
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// BEFEHLE VERARBEITEN
// ═══════════════════════════════════════════════════════════════════

void handleCommand(JsonDocument& doc) {
  String action = doc["action"];

  if (action == "pump") {
    int pumpId = doc["pump_id"];
    bool state = doc["state"];
    setPump(pumpId, state);

  } else if (action == "growlight") {
    bool on = doc["on"];
    int brightness = doc["brightness"] | 100;
    setGrowlightManual(on, brightness);

  } else if (action == "growlight_schedule") {
    growlightSchedule.onHour = doc["on_hour"] | 6;
    growlightSchedule.offHour = doc["off_hour"] | 22;
    growlightSchedule.brightness = doc["brightness"] | 100;
    growlightSchedule.autoMode = doc["auto_mode"] | true;

    Serial.println("🕐 Growlicht-Zeitplan aktualisiert");

  } else if (action == "fan") {
    bool state = doc["state"];
    digitalWrite(RELAY_FAN, state ? LOW : HIGH);

  } else if (action == "get_status") {
    sendSensorData();
  }
}

// ═══════════════════════════════════════════════════════════════════
// WIFI VERBINDEN
// ═══════════════════════════════════════════════════════════════════

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("MAC: ");
    Serial.println(WiFi.macAddress());
  } else {
    Serial.println("\n✗ WiFi connection failed!");
  }
}

// ═══════════════════════════════════════════════════════════════════
// DEBUG: SENSOR-DATEN AUSGEBEN
// ═══════════════════════════════════════════════════════════════════

void printSensorData() {
  Serial.println("\n┌─────────────────────────────────────┐");
  Serial.println("│      SENSOR READINGS                │");
  Serial.println("├─────────────────────────────────────┤");

  Serial.print("│ Moisture 1: ");
  Serial.print(sensors.moisture1, 1);
  Serial.println("%");

  Serial.print("│ Moisture 2: ");
  Serial.print(sensors.moisture2, 1);
  Serial.println("%");

  Serial.print("│ Moisture 3: ");
  Serial.print(sensors.moisture3, 1);
  Serial.println("%");

  Serial.print("│ Moisture 4: ");
  Serial.print(sensors.moisture4, 1);
  Serial.println("%");

  Serial.println("├─────────────────────────────────────┤");

  Serial.print("│ Temperature: ");
  Serial.print(sensors.temperature, 1);
  Serial.println(" °C");

  Serial.print("│ Humidity: ");
  Serial.print(sensors.humidity, 1);
  Serial.println(" %");

  Serial.print("│ VPD: ");
  Serial.print(sensors.vpd, 2);
  Serial.println(" kPa");

  Serial.println("├─────────────────────────────────────┤");

  Serial.print("│ Light: ");
  Serial.print(sensors.lux, 0);
  Serial.println(" lux");

  Serial.print("│ PAR: ");
  Serial.print(sensors.par, 1);
  Serial.println(" µmol/m²/s");

  Serial.println("├─────────────────────────────────────┤");

  Serial.print("│ CO2: ");
  Serial.print(sensors.co2);
  Serial.println(" ppm");

  Serial.print("│ eCO2: ");
  Serial.print(sensors.eco2);
  Serial.println(" ppm");

  Serial.print("│ TVOC: ");
  Serial.print(sensors.tvoc);
  Serial.println(" ppb");

  Serial.println("├─────────────────────────────────────┤");

  Serial.print("│ pH: ");
  Serial.println(sensors.ph, 2);

  Serial.print("│ Water Level: ");
  Serial.print(sensors.waterLevel);
  Serial.println("%");

  Serial.println("├─────────────────────────────────────┤");

  Serial.print("│ Growlight: ");
  Serial.print(sensors.growlightOn ? "ON " : "OFF");
  Serial.print(" @ ");
  Serial.print(sensors.growlightBrightness);
  Serial.println("%");

  Serial.println("└─────────────────────────────────────┘\n");
}
