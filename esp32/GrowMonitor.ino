/*
 * ESP32 Grow Monitoring System Firmware
 * Version: 1.1.0
 *
 * Hardware Requirements:
 * - ESP32 Development Board
 * - Capacitive Soil Moisture Sensors (Analog)
 * - Water Pumps (12V DC)
 * - Relay Module (for pumps, lights, fans)
 * - Water Level Sensor (optional)
 * - DHT22 Temperature/Humidity Sensor (optional)
 *
 * Pin Configuration:
 * - Moisture Sensors: GPIO 34, 35, 36, 39 (Analog pins)
 * - Relays: GPIO 16, 17, 18, 19, 21, 22, 23 (Digital)
 * - DHT22: GPIO 4
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* serverIP = "192.168.1.100";  // Your backend server IP
const int serverPort = 3001;

// Pin Definitions
#define DHT_PIN 4
#define DHT_TYPE DHT22

// Moisture Sensors (Analog Pins)
const int moisturePins[] = {34, 35, 36, 39};
const int numMoistureSensors = 4;

// Relay Pins (Digital Pins)
const int relayPins[] = {16, 17, 18, 19, 21, 22, 23};
const int numRelays = 7;

// Water Level Sensor (optional)
#define WATER_LEVEL_PIN 32

// Sensor Reading Interval (milliseconds)
const unsigned long sensorInterval = 1000;  // Read sensors every 1 second
unsigned long lastSensorRead = 0;

// Objects
WebSocketsClient webSocket;
DHT dht(DHT_PIN, DHT_TYPE);

// State
bool relayStates[7] = {false};
unsigned long pumpTimers[7] = {0};
int pumpDurations[7] = {0};

void setup() {
  Serial.begin(115200);
  Serial.println("🌱 Grow Monitoring System - ESP32");
  Serial.println("Version 1.1.0");

  // Initialize DHT sensor
  dht.begin();

  // Initialize relay pins
  for (int i = 0; i < numRelays; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], LOW);  // Relays OFF initially
  }

  // Initialize moisture sensor pins
  for (int i = 0; i < numMoistureSensors; i++) {
    pinMode(moisturePins[i], INPUT);
  }

  // Initialize water level sensor
  pinMode(WATER_LEVEL_PIN, INPUT);

  // Connect to WiFi
  connectWiFi();

  // Connect to WebSocket server
  webSocket.begin(serverIP, serverPort, "/ws");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);

  Serial.println("✓ Setup complete");
}

void loop() {
  webSocket.loop();

  // Read sensors at interval
  if (millis() - lastSensorRead >= sensorInterval) {
    lastSensorRead = millis();
    readAndSendSensorData();
  }

  // Handle pump timers
  handlePumpTimers();
}

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
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("✗ WebSocket disconnected");
      break;

    case WStype_CONNECTED:
      Serial.println("✓ WebSocket connected");
      // Identify as ESP32
      sendMessage("{\"type\":\"esp32_identify\"}");
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

void readAndSendSensorData() {
  // Read temperature and humidity
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Read water level (0-4095, convert to liters or percentage)
  int waterLevel = analogRead(WATER_LEVEL_PIN);
  float waterLevelPercent = map(waterLevel, 0, 4095, 0, 100);

  // Read and send each moisture sensor
  for (int i = 0; i < numMoistureSensors; i++) {
    int rawValue = analogRead(moisturePins[i]);

    // Convert to percentage (calibrate these values for your sensors!)
    // Typical values: Dry = 3000-4095, Wet = 1000-1500
    float moisturePercent = map(rawValue, 3000, 1500, 0, 100);
    moisturePercent = constrain(moisturePercent, 0, 100);

    // Create JSON message
    StaticJsonDocument<256> doc;
    doc["type"] = "sensor_data";
    JsonObject data = doc.createNestedObject("data");
    data["sensorId"] = i + 1;  // Sensor IDs start at 1
    data["moistureLevel"] = moisturePercent;

    // Add temperature and humidity to first sensor only
    if (i == 0) {
      if (!isnan(temperature)) data["temperature"] = temperature;
      if (!isnan(humidity)) data["humidity"] = humidity;
      data["tankLevel"] = waterLevelPercent;
    }

    // Serialize and send
    String output;
    serializeJson(doc, output);
    sendMessage(output.c_str());
  }
}

void controlRelay(int relayId, bool status) {
  if (relayId < 1 || relayId > numRelays) {
    Serial.println("Invalid relay ID");
    return;
  }

  int index = relayId - 1;
  digitalWrite(relayPins[index], status ? HIGH : LOW);
  relayStates[index] = status;

  Serial.print("Relay ");
  Serial.print(relayId);
  Serial.print(" -> ");
  Serial.println(status ? "ON" : "OFF");

  // Send status update
  StaticJsonDocument<128> doc;
  doc["type"] = "relay_status";
  JsonObject data = doc.createNestedObject("data");
  data["relayId"] = relayId;
  data["status"] = status;

  String output;
  serializeJson(doc, output);
  sendMessage(output.c_str());
}

void startPump(int pumpId, int durationSeconds) {
  if (pumpId < 1 || pumpId > numRelays) {
    Serial.println("Invalid pump ID");
    return;
  }

  int index = pumpId - 1;

  // Turn on pump
  digitalWrite(relayPins[index], HIGH);
  relayStates[index] = true;

  // Set timer
  pumpTimers[index] = millis();
  pumpDurations[index] = durationSeconds * 1000;

  Serial.print("Pump ");
  Serial.print(pumpId);
  Serial.print(" started for ");
  Serial.print(durationSeconds);
  Serial.println(" seconds");

  // Send status
  controlRelay(pumpId, true);
}

void handlePumpTimers() {
  unsigned long currentMillis = millis();

  for (int i = 0; i < numRelays; i++) {
    if (pumpDurations[i] > 0 && relayStates[i]) {
      if (currentMillis - pumpTimers[i] >= pumpDurations[i]) {
        // Timer expired, turn off pump
        digitalWrite(relayPins[i], LOW);
        relayStates[i] = false;
        pumpDurations[i] = 0;

        Serial.print("Pump ");
        Serial.print(i + 1);
        Serial.println(" stopped (timer expired)");

        // Send status
        controlRelay(i + 1, false);
      }
    }
  }
}

void sendMessage(const char* message) {
  webSocket.sendTXT(message);
}
