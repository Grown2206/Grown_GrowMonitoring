/*
 * ESP32 Grow Monitoring System - All Sensors Edition
 * Version: 2.0.0
 *
 * Dieses Firmware-Beispiel zeigt die Integration ALLER verfügbaren Sensoren:
 * - Bodenfeuchtigkeit (Kapazitiv)
 * - Temperatur & Luftfeuchtigkeit (DHT22)
 * - CO2 (MH-Z19B oder SCD30)
 * - Licht/PAR (BH1750, VEML7700, oder Analog LDR)
 * - pH, TDS, EC (Analog Wasserqualität)
 * - VOC & Luftqualität (SGP30, CCS811, oder MQ-135)
 * - PM2.5 Feinstaub (PMS5003, SDS011, oder GP2Y1010)
 * - Wasserstand
 *
 * Hardware-Anforderungen:
 * - ESP32 Development Board
 * - Sensoren nach Bedarf (siehe Pin-Konfiguration)
 * - WebSocket-Verbindung zum Backend
 *
 * Bibliotheken (über Arduino Library Manager installieren):
 * - WebSockets by Markus Sattler
 * - ArduinoJson by Benoit Blanchon (v6.x)
 * - DHT sensor library by Adafruit
 * - BH1750 by Christopher Laws (optional)
 * - Adafruit SGP30 (optional)
 * - Adafruit CCS811 (optional)
 * - SparkFun SCD30 (optional)
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ========================================
// KONFIGURATION - ANPASSEN!
// ========================================

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* serverIP = "192.168.1.100";  // Backend Server IP
const int serverPort = 3001;

// Sensor-Aktivierung (kommentieren Sie aus, was Sie NICHT verwenden)
#define USE_MOISTURE_SENSORS    // Kapazitive Bodenfeuchtigkeit
#define USE_DHT22               // Temperatur & Luftfeuchtigkeit
//#define USE_MHZ19B            // CO2 Sensor (UART)
//#define USE_SCD30             // CO2 + Temp + Hum (I2C)
#define USE_BH1750              // Lichtsensor (I2C)
//#define USE_ANALOG_LIGHT      // Analoger LDR
//#define USE_PH_SENSOR         // pH Sensor (Analog)
//#define USE_TDS_SENSOR        // TDS Sensor (Analog)
//#define USE_EC_SENSOR         // EC Sensor (Analog)
//#define USE_SGP30             // VOC Sensor (I2C)
//#define USE_CCS811            // VOC Sensor (I2C)
//#define USE_MQ135             // Luftqualität (Analog)
//#define USE_PMS5003           // PM2.5 Sensor (UART)
//#define USE_GP2Y1010          // Staub-Sensor (Analog)
#define USE_WATER_LEVEL         // Wasserstandssensor

// ========================================
// PIN-DEFINITIONEN
// ========================================

// DHT22 Sensor
#define DHT_PIN 4
#define DHT_TYPE DHT22

// Moisture Sensors (Analog)
const int moisturePins[] = {34, 35, 36, 39};
const int numMoistureSensors = 4;

// Relay Pins
const int relayPins[] = {16, 17, 18, 19, 21, 22, 23};
const int numRelays = 7;

// Water Level
#define WATER_LEVEL_PIN 32

// Analog Sensoren
#define PH_SENSOR_PIN 33
#define TDS_SENSOR_PIN 35
#define EC_SENSOR_PIN 36
#define LIGHT_SENSOR_PIN 39
#define MQ135_PIN 34
#define GP2Y1010_ANALOG_PIN 34
#define GP2Y1010_LED_PIN 25

// I2C Pins (Standard ESP32)
// SDA: GPIO 21
// SCL: GPIO 22

// UART Sensoren (Serial2)
// RX: GPIO 16
// TX: GPIO 17

// ========================================
// SENSOR-BIBLIOTHEKEN
// ========================================

#include "sensors/CO2_Sensors.h"
#include "sensors/Light_Sensors.h"
#include "sensors/Water_Quality_Sensors.h"
#include "sensors/VOC_Sensors.h"
#include "sensors/PM_Sensors.h"

// ========================================
// GLOBALE OBJEKTE
// ========================================

WebSocketsClient webSocket;
DHT dht(DHT_PIN, DHT_TYPE);

// CO2 Sensoren
#ifdef USE_MHZ19B
MHZ19B co2Sensor(&Serial2);
#endif

#ifdef USE_SCD30
SCD30Sensor scd30;
#endif

// Lichtsensoren
#ifdef USE_BH1750
BH1750Sensor lightSensor;
#endif

#ifdef USE_ANALOG_LIGHT
AnalogLightSensor ldrSensor(LIGHT_SENSOR_PIN);
#endif

// Wasserqualität
#ifdef USE_PH_SENSOR
AnalogpHSensor phSensor(PH_SENSOR_PIN);
#endif

#ifdef USE_TDS_SENSOR
TDSSensor tdsSensor(TDS_SENSOR_PIN);
#endif

#ifdef USE_EC_SENSOR
ECSensor ecSensor(EC_SENSOR_PIN);
#endif

// VOC Sensoren
#ifdef USE_SGP30
SGP30Sensor vocSensor;
#endif

#ifdef USE_CCS811
CCS811Sensor ccs811;
#endif

#ifdef USE_MQ135
MQ135Sensor airQuality(MQ135_PIN);
#endif

// PM Sensoren
#ifdef USE_PMS5003
PMS5003Sensor pmsSensor(&Serial2);
#endif

#ifdef USE_GP2Y1010
GP2Y1010Sensor dustSensor(GP2Y1010_ANALOG_PIN, GP2Y1010_LED_PIN);
#endif

// ========================================
// TIMING
// ========================================

const unsigned long sensorInterval = 5000;  // Sensoren alle 5 Sekunden
unsigned long lastSensorRead = 0;

#ifdef USE_SGP30
unsigned long lastSGP30Read = 0;
const unsigned long sgp30Interval = 1000;  // SGP30 jede Sekunde!
#endif

// ========================================
// RELAY STATES
// ========================================

bool relayStates[7] = {false};
unsigned long pumpTimers[7] = {0};
int pumpDurations[7] = {0};

// ========================================
// SETUP
// ========================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n");
  Serial.println("===============================================");
  Serial.println("🌱 Grow Monitoring System - ESP32");
  Serial.println("   All Sensors Edition v2.0.0");
  Serial.println("===============================================\n");

  // Initialize I2C
  Wire.begin();

  // Initialize DHT
  #ifdef USE_DHT22
  dht.begin();
  Serial.println("✓ DHT22 initialized");
  #endif

  // Initialize CO2 Sensors
  #ifdef USE_MHZ19B
  co2Sensor.begin();
  co2Sensor.setAutoCalibration(true);
  Serial.println("✓ MH-Z19B initialized");
  #endif

  #ifdef USE_SCD30
  if (scd30.begin()) {
    scd30.setMeasurementInterval(2);
    scd30.setAltitudeCompensation(300);  // Passen Sie die Höhe an!
    Serial.println("✓ SCD30 initialized");
  }
  #endif

  // Initialize Light Sensors
  #ifdef USE_BH1750
  if (lightSensor.begin()) {
    Serial.println("✓ BH1750 Light Sensor initialized");
  }
  #endif

  #ifdef USE_ANALOG_LIGHT
  ldrSensor.begin();
  ldrSensor.calibrate(100, 3800);
  Serial.println("✓ Analog Light Sensor initialized");
  #endif

  // Initialize Water Quality Sensors
  #ifdef USE_PH_SENSOR
  phSensor.begin();
  // Kalibrierung: phSensor.calibrate(voltage_pH4, voltage_pH7);
  Serial.println("✓ pH Sensor initialized");
  #endif

  #ifdef USE_TDS_SENSOR
  tdsSensor.begin();
  Serial.println("✓ TDS Sensor initialized");
  #endif

  #ifdef USE_EC_SENSOR
  ecSensor.begin();
  Serial.println("✓ EC Sensor initialized");
  #endif

  // Initialize VOC Sensors
  #ifdef USE_SGP30
  if (vocSensor.begin()) {
    Serial.println("✓ SGP30 VOC Sensor initialized");
    Serial.println("  (Warming up... optimal after 12h)");
  }
  #endif

  #ifdef USE_CCS811
  if (ccs811.begin()) {
    ccs811.setDriveMode(1);  // 1 Messung/Sekunde
    Serial.println("✓ CCS811 initialized");
  }
  #endif

  #ifdef USE_MQ135
  airQuality.begin();
  airQuality.setRZero(76.63);  // Kalibriert auf 400ppm CO2
  Serial.println("✓ MQ-135 Air Quality Sensor initialized");
  #endif

  // Initialize PM Sensors
  #ifdef USE_PMS5003
  pmsSensor.begin();
  pmsSensor.setActiveMode();
  pmsSensor.wakeUp();
  delay(1000);
  Serial.println("✓ PMS5003 PM Sensor initialized");
  #endif

  #ifdef USE_GP2Y1010
  dustSensor.begin();
  Serial.println("✓ GP2Y1010 Dust Sensor initialized");
  #endif

  // Initialize Relays
  for (int i = 0; i < numRelays; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], LOW);
  }
  Serial.println("✓ Relays initialized");

  // Initialize Moisture Sensors
  #ifdef USE_MOISTURE_SENSORS
  for (int i = 0; i < numMoistureSensors; i++) {
    pinMode(moisturePins[i], INPUT);
  }
  Serial.println("✓ Moisture Sensors initialized");
  #endif

  // Initialize Water Level
  #ifdef USE_WATER_LEVEL
  pinMode(WATER_LEVEL_PIN, INPUT);
  Serial.println("✓ Water Level Sensor initialized");
  #endif

  // Connect to WiFi
  connectWiFi();

  // Connect to WebSocket
  webSocket.begin(serverIP, serverPort, "/ws");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);

  Serial.println("\n✓ Setup complete!\n");
}

// ========================================
// MAIN LOOP
// ========================================

void loop() {
  webSocket.loop();

  // SGP30 muss jede Sekunde gelesen werden!
  #ifdef USE_SGP30
  if (millis() - lastSGP30Read >= sgp30Interval) {
    lastSGP30Read = millis();
    vocSensor.measure();
    vocSensor.updateBaseline();
  }
  #endif

  // Alle anderen Sensoren alle X Sekunden
  if (millis() - lastSensorRead >= sensorInterval) {
    lastSensorRead = millis();
    readAndSendAllSensors();
  }

  // Handle pump timers
  handlePumpTimers();
}

// ========================================
// SENSOR READING
// ========================================

void readAndSendAllSensors() {
  StaticJsonDocument<1024> doc;
  doc["type"] = "sensor_data_batch";
  JsonObject data = doc.createNestedObject("data");

  // Environment Sensors
  #ifdef USE_DHT22
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  if (!isnan(temp)) data["temperature"] = temp;
  if (!isnan(hum)) data["humidity"] = hum;
  #endif

  // CO2 Sensors
  #ifdef USE_MHZ19B
  int co2 = co2Sensor.readCO2();
  if (co2 >= 0) data["co2"] = co2;
  #endif

  #ifdef USE_SCD30
  if (scd30.isAvailable()) {
    data["co2"] = scd30.readCO2();
    if (!data.containsKey("temperature")) data["temperature"] = scd30.readTemperature();
    if (!data.containsKey("humidity")) data["humidity"] = scd30.readHumidity();
  }
  #endif

  // Light Sensors
  #ifdef USE_BH1750
  float lux = lightSensor.readLux();
  float par = lightSensor.readPAR();
  data["light"] = lux;
  data["par"] = par;
  #endif

  #ifdef USE_ANALOG_LIGHT
  data["light"] = ldrSensor.readLuxEstimate();
  #endif

  // Water Quality
  #ifdef USE_PH_SENSOR
  data["ph"] = phSensor.readpH();
  #endif

  #ifdef USE_TDS_SENSOR
  float temp_for_tds = data.containsKey("temperature") ? data["temperature"].as<float>() : 25.0;
  tdsSensor.setTemperature(temp_for_tds);
  data["tds"] = tdsSensor.readTDS();
  #endif

  #ifdef USE_EC_SENSOR
  float temp_for_ec = data.containsKey("temperature") ? data["temperature"].as<float>() : 25.0;
  ecSensor.setTemperature(temp_for_ec);
  data["ec"] = ecSensor.readEC();
  #endif

  // VOC Sensors
  #ifdef USE_SGP30
  data["tvoc"] = vocSensor.readTVOC();
  data["eco2"] = vocSensor.readeCO2();
  #endif

  #ifdef USE_CCS811
  if (ccs811.isAvailable() && ccs811.readData()) {
    data["tvoc"] = ccs811.readTVOC();
    if (!data.containsKey("eco2")) data["eco2"] = ccs811.readeCO2();
  }
  #endif

  #ifdef USE_MQ135
  data["airQuality"] = airQuality.readPPM();
  if (!data.containsKey("co2")) data["co2"] = airQuality.readCO2();
  #endif

  // PM Sensors
  #ifdef USE_PMS5003
  if (pmsSensor.read()) {
    data["pm1_0"] = pmsSensor.getPM1_0();
    data["pm2_5"] = pmsSensor.getPM2_5();
    data["pm10"] = pmsSensor.getPM10();
    data["aqi"] = pmsSensor.getAQI();
  }
  #endif

  #ifdef USE_GP2Y1010
  data["dustDensity"] = dustSensor.readDustDensity();
  #endif

  // Water Level
  #ifdef USE_WATER_LEVEL
  int waterLevel = analogRead(WATER_LEVEL_PIN);
  float waterPercent = map(waterLevel, 0, 4095, 0, 100);
  data["tankLevel"] = waterPercent;
  #endif

  // Moisture Sensors
  #ifdef USE_MOISTURE_SENSORS
  JsonArray moistureArray = data.createNestedArray("moisture");
  for (int i = 0; i < numMoistureSensors; i++) {
    int rawValue = analogRead(moisturePins[i]);
    float moisturePercent = map(rawValue, 3000, 1500, 0, 100);
    moisturePercent = constrain(moisturePercent, 0, 100);

    JsonObject moistureObj = moistureArray.createNestedObject();
    moistureObj["sensorId"] = i + 1;
    moistureObj["value"] = moisturePercent;
  }
  #endif

  // Send JSON
  String output;
  serializeJson(doc, output);
  sendMessage(output.c_str());

  // Debug output
  Serial.println("Sensor Data:");
  serializeJsonPretty(doc, Serial);
  Serial.println();
}

// ========================================
// WEBSOCKET
// ========================================

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("✓ WiFi connected - IP: ");
  Serial.println(WiFi.localIP());
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("✗ WebSocket disconnected");
      break;

    case WStype_CONNECTED:
      Serial.println("✓ WebSocket connected");
      sendMessage("{\"type\":\"esp32_identify\",\"version\":\"2.0.0\"}");
      break;

    case WStype_TEXT:
      handleWebSocketMessage((char*)payload);
      break;
  }
}

void handleWebSocketMessage(char* payload) {
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (error) {
    Serial.println("Failed to parse JSON");
    return;
  }

  const char* type = doc["type"];

  if (strcmp(type, "relay_control") == 0) {
    int relayId = doc["data"]["relayId"];
    bool status = doc["data"]["status"];
    controlRelay(relayId, status);
  }
  else if (strcmp(type, "pump_control") == 0) {
    int pumpId = doc["data"]["pumpId"];
    const char* action = doc["data"]["action"];
    int duration = doc["data"]["duration"] | 0;

    if (strcmp(action, "start") == 0) {
      startPump(pumpId, duration);
    }
  }
}

void sendMessage(const char* message) {
  webSocket.sendTXT(message);
}

// ========================================
// RELAY CONTROL
// ========================================

void controlRelay(int relayId, bool status) {
  if (relayId < 1 || relayId > numRelays) return;

  int index = relayId - 1;
  digitalWrite(relayPins[index], status ? HIGH : LOW);
  relayStates[index] = status;

  Serial.print("Relay ");
  Serial.print(relayId);
  Serial.print(" -> ");
  Serial.println(status ? "ON" : "OFF");
}

void startPump(int pumpId, int durationSeconds) {
  if (pumpId < 1 || pumpId > numRelays) return;

  int index = pumpId - 1;
  digitalWrite(relayPins[index], HIGH);
  relayStates[index] = true;
  pumpTimers[index] = millis();
  pumpDurations[index] = durationSeconds * 1000;

  Serial.print("Pump ");
  Serial.print(pumpId);
  Serial.print(" started for ");
  Serial.print(durationSeconds);
  Serial.println(" seconds");
}

void handlePumpTimers() {
  unsigned long currentMillis = millis();

  for (int i = 0; i < numRelays; i++) {
    if (pumpDurations[i] > 0 && relayStates[i]) {
      if (currentMillis - pumpTimers[i] >= pumpDurations[i]) {
        digitalWrite(relayPins[i], LOW);
        relayStates[i] = false;
        pumpDurations[i] = 0;

        Serial.print("Pump ");
        Serial.print(i + 1);
        Serial.println(" stopped (timer expired)");
      }
    }
  }
}
