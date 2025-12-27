# 🔌 IoT Stack Komplettanleitung - Grow Monitoring System

## Inhaltsverzeichnis

1. [Was ist der IoT Stack?](#1-was-ist-der-iot-stack)
2. [Architektur-Übersicht](#2-architektur-übersicht)
3. [MQTT Broker installieren](#3-mqtt-broker-installieren)
4. [Backend MQTT konfigurieren](#4-backend-mqtt-konfigurieren)
5. [Home Assistant Integration](#5-home-assistant-integration)
6. [ESP32 MQTT aktivieren](#6-esp32-mqtt-aktivieren)
7. [Datenfluss testen](#7-datenfluss-testen)
8. [Erweiterte Szenarien](#8-erweiterte-szenarien)

---

## 1. Was ist der IoT Stack?

### Standard-Setup (ohne MQTT)
```
ESP32 ←→ WebSocket ←→ Backend ←→ HTTP ←→ Frontend
```

### IoT Stack (mit MQTT)
```
                    ┌─────────────────┐
                    │  MQTT Broker    │
                    │  (Mosquitto)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌─────▼─────┐       ┌─────▼─────┐
   │  ESP32  │         │  Backend  │       │   Home    │
   │ Sensors │         │  Node.js  │       │ Assistant │
   └─────────┘         └───────────┘       └───────────┘
                             │
                       ┌─────▼─────┐
                       │  Frontend │
                       │  Browser  │
                       └───────────┘
```

### Vorteile des IoT Stacks

```
✓ Mehrere Clients gleichzeitig
✓ Home Assistant Integration
✓ MQTT-Protokoll Standard (universell)
✓ Automatische Wiederverbindung
✓ QoS (Quality of Service)
✓ Retained Messages
✓ Last Will Testament (LWT)
✓ Einfache Erweiterung (weitere Geräte)
```

---

## 2. Architektur-Übersicht

### MQTT Topics Struktur

```
grow_monitoring/                    (Base Topic)
├── sensor/
│   ├── temperature                 → {"value": 24.5, "unit": "°C"}
│   ├── humidity                    → {"value": 58.2, "unit": "%"}
│   ├── soil_moisture               → {"value": 45, "sensorId": 1}
│   ├── light                       → {"value": 12500, "unit": "lux"}
│   ├── co2                         → {"value": 850, "unit": "ppm"}
│   └── ph                          → {"value": 6.5, "unit": "pH"}
│
├── relay/
│   ├── 1/
│   │   ├── state                   → "ON" oder "OFF"
│   │   └── set                     → Command Topic
│   ├── 2/state
│   ├── 2/set
│   └── ...
│
├── alert/
│   └── [alert_id]                  → {"severity": "warning", "message": "..."}
│
└── system/
    ├── status                      → "online" / "offline"
    └── health                      → {"uptime": 3600, "freeHeap": 234000}
```

### Datenfluss

```
1. ESP32 liest Sensor
   └→ Publiziert zu: grow_monitoring/sensor/temperature

2. MQTT Broker empfängt
   └→ Verteilt an alle Subscribers

3. Backend subscribed
   └→ Empfängt Daten
   └→ Speichert in Datenbank
   └→ Sendet zu Frontend (WebSocket)

4. Home Assistant subscribed
   └→ Empfängt Daten
   └→ Zeigt in Dashboard
   └→ Kann Automationen triggern
```

---

## 3. MQTT Broker installieren

### 3.1 Mosquitto auf Windows

#### Download & Installation
```
1. Download Mosquitto:
   https://mosquitto.org/download/

2. Version wählen:
   "mosquitto-2.0.18-install-windows-x64.exe"

3. Installer ausführen
   → Standard-Pfad: C:\Program Files\mosquitto
   → Alle Optionen aktiviert lassen
   → Install

4. Windows Firewall:
   → Zugriff erlauben wenn gefragt
```

#### Konfiguration

```
1. Explorer öffnen
2. Navigieren zu: C:\Program Files\mosquitto
3. Datei öffnen: mosquitto.conf

4. Am Ende hinzufügen:
```

**mosquitto.conf:**
```conf
# Listener
listener 1883
protocol mqtt

# WebSocket Listener (für Browser)
listener 9001
protocol websockets

# Authentifizierung (vorerst deaktiviert)
allow_anonymous true

# Logging
log_dest file C:\Program Files\mosquitto\mosquitto.log
log_type all
log_timestamp true
log_timestamp_format %Y-%m-%dT%H:%M:%S

# Persistence
persistence true
persistence_location C:\Program Files\mosquitto\data\

# Retain Messages
retained_persistence true
```

#### Service starten

```
1. Windows-Taste + R
2. Eingeben: services.msc
3. Enter
4. Suchen: "Mosquitto Broker"
5. Rechtsklick → Eigenschaften
6. Starttyp: "Automatisch"
7. Status: "Starten"
8. OK
```

**Testen:**
```cmd
# CMD als Administrator öffnen
cd "C:\Program Files\mosquitto"

# Subscriber starten
mosquitto_sub -h localhost -t test/topic

# Neues CMD öffnen
cd "C:\Program Files\mosquitto"

# Publisher starten
mosquitto_pub -h localhost -t test/topic -m "Hello MQTT"

→ Im ersten Fenster sollte "Hello MQTT" erscheinen
```

### 3.2 Mosquitto auf Linux/Raspberry Pi

```bash
# Repository aktualisieren
sudo apt update

# Mosquitto installieren
sudo apt install -y mosquitto mosquitto-clients

# Auto-Start aktivieren
sudo systemctl enable mosquitto

# Starten
sudo systemctl start mosquitto

# Status prüfen
sudo systemctl status mosquitto
```

**Konfiguration:**
```bash
sudo nano /etc/mosquitto/mosquitto.conf
```

**Inhalt:**
```conf
# Default Listener
listener 1883
protocol mqtt

# WebSocket
listener 9001
protocol websockets

# Authentifizierung (vorerst aus)
allow_anonymous true

# Logging
log_dest file /var/log/mosquitto/mosquitto.log
log_type all

# Persistence
persistence true
persistence_location /var/lib/mosquitto/

# Retained
retained_persistence true
```

**Neu starten:**
```bash
sudo systemctl restart mosquitto
```

**Testen:**
```bash
# Terminal 1: Subscribe
mosquitto_sub -h localhost -t test/topic

# Terminal 2: Publish
mosquitto_pub -h localhost -t test/topic -m "Hello MQTT"
```

### 3.3 Mosquitto auf Mac

```bash
# Homebrew installieren (falls nicht vorhanden)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Mosquitto installieren
brew install mosquitto

# Konfiguration
nano /opt/homebrew/etc/mosquitto/mosquitto.conf

# Service starten
brew services start mosquitto

# Status
brew services list
```

### 3.4 Docker Alternative (alle Plattformen)

```bash
# Docker installiert?
docker --version

# Mosquitto Container starten
docker run -d \
  --name mosquitto \
  -p 1883:1883 \
  -p 9001:9001 \
  -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf \
  eclipse-mosquitto

# Logs
docker logs -f mosquitto

# Stoppen
docker stop mosquitto

# Neustarten
docker start mosquitto
```

---

## 4. Backend MQTT konfigurieren

### 4.1 Backend-Umgebungsvariablen

```bash
cd backend
nano .env
```

**In .env hinzufügen:**
```env
# MQTT Configuration
MQTT_ENABLED=true
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_BASE_TOPIC=grow_monitoring
MQTT_CLIENT_ID=grow_backend

# Home Assistant Discovery
MQTT_HA_DISCOVERY=true
MQTT_HA_PREFIX=homeassistant
```

### 4.2 MQTT Service aktivieren

Der MQTT Service ist bereits im Backend implementiert!

**Datei:** `backend/src/services/mqttService.ts`

**Funktionen:**
- ✅ Automatische Verbindung zu Broker
- ✅ Sensor-Daten publizieren
- ✅ Relais-Commands empfangen
- ✅ Home Assistant Discovery
- ✅ Automatische Reconnect
- ✅ Status-Monitoring

### 4.3 MQTT-Routen verwenden

**API-Endpunkte:**

```bash
# MQTT Status abrufen
curl http://localhost:3001/api/mqtt/status

# MQTT Einstellungen ändern
curl -X POST http://localhost:3001/api/mqtt/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "brokerUrl": "mqtt://192.168.1.100:1883",
    "baseTopic": "grow_monitoring",
    "homeAssistantDiscovery": true
  }'

# MQTT Test-Nachricht senden
curl -X POST http://localhost:3001/api/mqtt/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test/topic",
    "message": "Hello from Backend"
  }'
```

### 4.4 Backend neu starten

```bash
# Backend stoppen (Strg+C im Terminal)
# Backend neu starten
npm run dev
```

**Erwartete Ausgabe:**
```
🌱 Grow Monitoring Backend v3.0.0
✓ Database initialized
✓ MQTT Service initialized (enabled)
✓ MQTT connected to broker
✓ Subscribed to grow_monitoring/relay/+/set
✓ Server started on port 3001
```

---

## 5. Home Assistant Integration

### 5.1 Home Assistant installieren (Optional)

#### Raspberry Pi / Linux

```bash
# Docker verwenden
docker run -d \
  --name homeassistant \
  --privileged \
  --restart=unless-stopped \
  -e TZ=Europe/Berlin \
  -v /home/pi/homeassistant:/config \
  --network=host \
  ghcr.io/home-assistant/home-assistant:stable

# Nach 2 Min:
# Browser: http://[PI_IP]:8123
```

#### Andere Installationen
```
https://www.home-assistant.io/installation/
```

### 5.2 MQTT Integration in Home Assistant

```
1. Home Assistant öffnen: http://localhost:8123

2. Einstellungen → Geräte & Dienste

3. "+ Integration hinzufügen"

4. Suchen: "MQTT"

5. Konfigurieren:
   Broker: localhost (oder IP)
   Port: 1883
   Username: (leer)
   Password: (leer)

6. "Absenden"
```

### 5.3 Auto-Discovery Sensoren

Wenn Backend läuft mit `MQTT_HA_DISCOVERY=true`:

```
Home Assistant entdeckt automatisch:

Sensoren:
  - sensor.grow_temperature
  - sensor.grow_humidity
  - sensor.grow_soil_moisture
  - sensor.grow_light_level
  - sensor.grow_co2_level
  - sensor.grow_ph_level

Schalter:
  - switch.grow_relay_pump_1
  - switch.grow_relay_pump_2
  - switch.grow_relay_light
  - switch.grow_relay_fan
```

**Anzeigen:**
```
Einstellungen → Geräte & Dienste → MQTT
→ "Grow Monitoring System" sollte erscheinen
→ Klicken → Alle Entities sehen
```

### 5.4 Home Assistant Dashboard erstellen

```yaml
# In Home Assistant:
# Übersicht → Bearbeiten → + Dashboard hinzufügen

title: Grow Monitoring
views:
  - title: Overview
    cards:
      - type: entities
        title: Sensoren
        entities:
          - sensor.grow_temperature
          - sensor.grow_humidity
          - sensor.grow_soil_moisture
          - sensor.grow_light_level
          - sensor.grow_co2_level

      - type: history-graph
        title: Temperatur-Verlauf
        entities:
          - sensor.grow_temperature
        hours_to_show: 24

      - type: entities
        title: Steuerung
        entities:
          - switch.grow_relay_pump_1
          - switch.grow_relay_pump_2
          - switch.grow_relay_light
          - switch.grow_relay_fan

      - type: gauge
        title: Bodenfeuchtigkeit
        entity: sensor.grow_soil_moisture
        min: 0
        max: 100
        severity:
          green: 40
          yellow: 30
          red: 0
```

### 5.5 Home Assistant Automationen

**Auto-Bewässerung:**
```yaml
automation:
  - alias: "Grow: Auto Water bei niedrigem Moisture"
    trigger:
      - platform: numeric_state
        entity_id: sensor.grow_soil_moisture
        below: 30
    condition:
      - condition: state
        entity_id: switch.grow_relay_pump_1
        state: 'off'
    action:
      - service: switch.turn_on
        entity_id: switch.grow_relay_pump_1
      - delay: '00:00:05'  # 5 Sekunden
      - service: switch.turn_off
        entity_id: switch.grow_relay_pump_1
      - service: notify.mobile_app
        data:
          message: "Pflanze wurde bewässert (Moisture war {{ states('sensor.grow_soil_moisture') }}%)"
```

**Licht-Zeitplan:**
```yaml
automation:
  - alias: "Grow: Licht AN um 6:00"
    trigger:
      - platform: time
        at: "06:00:00"
    action:
      - service: switch.turn_on
        entity_id: switch.grow_relay_light

  - alias: "Grow: Licht AUS um 22:00"
    trigger:
      - platform: time
        at: "22:00:00"
    action:
      - service: switch.turn_off
        entity_id: switch.grow_relay_light
```

**Alarm bei hoher Temperatur:**
```yaml
automation:
  - alias: "Grow: Alarm bei Temperatur > 30°C"
    trigger:
      - platform: numeric_state
        entity_id: sensor.grow_temperature
        above: 30
    action:
      - service: notify.mobile_app
        data:
          title: "⚠️ Temperatur-Alarm!"
          message: "Temperatur ist zu hoch: {{ states('sensor.grow_temperature') }}°C"
      - service: switch.turn_on
        entity_id: switch.grow_relay_fan
```

---

## 6. ESP32 MQTT aktivieren

### 6.1 MQTT-Fähige Firmware verwenden

**Datei:** `esp32/GrowMonitor_AllSensors.ino`

Diese Version unterstützt MQTT!

### 6.2 MQTT im ESP32-Code aktivieren

**Bibliotheken installieren:**
```
Arduino IDE → Sketch → Bibliothek einbinden → Bibliotheken verwalten
Suchen: "PubSubClient"
Installieren: "PubSubClient" by Nick O'Leary
```

**Code-Konfiguration:**

```cpp
// WiFi Credentials
const char* ssid = "IHR_WIFI";
const char* password = "IHR_PASSWORT";

// MQTT Broker
const char* mqtt_server = "192.168.1.100";  // Ihr PC/Raspberry Pi
const int mqtt_port = 1883;
const char* mqtt_user = "";  // Leer wenn keine Auth
const char* mqtt_password = "";
const char* mqtt_client_id = "ESP32_GrowMonitor_1";

// MQTT Topics
const char* mqtt_base_topic = "grow_monitoring";

// MQTT aktivieren
#define USE_MQTT true
```

### 6.3 ESP32 MQTT-Funktionen

**Bereits implementiert:**

```cpp
void mqttConnect() {
  // Verbindung zu MQTT Broker
  // Auto-Reconnect bei Verbindungsverlust
}

void publishSensorData() {
  // Sensor-Daten zu MQTT publizieren
  // Topics: grow_monitoring/sensor/[type]
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // MQTT Messages empfangen
  // Relais-Commands verarbeiten
}

void subscribeToCommands() {
  // Subscribe zu Relay-Commands
  // grow_monitoring/relay/+/set
}
```

### 6.4 Firmware hochladen

```
1. Arduino IDE → GrowMonitor_AllSensors.ino öffnen
2. MQTT-Daten eintragen (siehe 6.2)
3. Upload auf ESP32
4. Serieller Monitor öffnen (115200 Baud)
```

**Erwartete Ausgabe:**
```
===============================================
🌱 Grow Monitoring System - ESP32
   All Sensors Edition v2.0.0
===============================================

✓ WiFi connected - IP: 192.168.1.150

✓ MQTT connecting to: 192.168.1.100:1883
✓ MQTT connected!
✓ Subscribed to: grow_monitoring/relay/+/set

Publishing sensor data...
  → grow_monitoring/sensor/temperature: 24.5
  → grow_monitoring/sensor/humidity: 58.2
  → grow_monitoring/sensor/soil_moisture: 45
```

---

## 7. Datenfluss testen

### 7.1 MQTT Explorer (Desktop-Tool)

**Download & Installation:**
```
http://mqtt-explorer.com/
→ Windows, Mac, Linux verfügbar
```

**Verbinden:**
```
1. MQTT Explorer öffnen
2. Connection → +
3. Name: Grow Monitoring
4. Host: localhost (oder IP)
5. Port: 1883
6. Username: (leer)
7. Password: (leer)
8. CONNECT
```

**Was Sie sehen sollten:**
```
grow_monitoring/
├── sensor/
│   ├── temperature → 24.5
│   ├── humidity → 58.2
│   ├── soil_moisture → {"sensorId":1,"value":45}
│   └── light → 12500
├── relay/
│   ├── 1/state → OFF
│   └── 2/state → OFF
└── system/
    └── status → online
```

### 7.2 Kommandozeilen-Test

**Terminal 1: Subscribe zu allen Topics**
```bash
mosquitto_sub -h localhost -t 'grow_monitoring/#' -v
```

**Terminal 2: Relay-Command senden**
```bash
mosquitto_pub -h localhost -t 'grow_monitoring/relay/1/set' -m 'ON'
```

**Terminal 1 sollte zeigen:**
```
grow_monitoring/relay/1/set ON
grow_monitoring/relay/1/state ON
```

**ESP32 sollte Relay aktivieren!**

### 7.3 End-to-End Test

```
1. ESP32 läuft (Serieller Monitor offen)
2. Backend läuft (Terminal)
3. MQTT Explorer offen
4. Home Assistant Dashboard offen (optional)

Test-Ablauf:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Sensor-Daten fließen:
   ESP32 → MQTT → Backend → Dashboard
   ✓ Serieller Monitor: "Publishing temperature: 24.5"
   ✓ MQTT Explorer: Wert erscheint
   ✓ Backend Log: "Sensor data received from MQTT"
   ✓ Dashboard: Chart aktualisiert sich
   ✓ Home Assistant: Sensor aktualisiert

2. Relay-Command von Dashboard:
   Dashboard → Backend → MQTT → ESP32
   ✓ Dashboard: "Water Now" Button klicken
   ✓ Backend Log: "Publishing relay command"
   ✓ MQTT Explorer: grow_monitoring/relay/1/set → ON
   ✓ ESP32: Relay aktiviert
   ✓ Pumpe läuft!

3. Relay-Command von Home Assistant:
   Home Assistant → MQTT → ESP32
   ✓ HA: Switch.grow_relay_pump_1 → ON
   ✓ MQTT Explorer: Message sichtbar
   ✓ ESP32: Relay aktiviert
   ✓ Backend empfängt State-Update
   ✓ Dashboard zeigt Status
```

### 7.4 Performance-Test

```bash
# Terminal 1: Subscribe mit Timestamps
mosquitto_sub -h localhost -t 'grow_monitoring/sensor/#' -v | while read line; do echo "$(date +%H:%M:%S.%3N) $line"; done

# Terminal 2: Schnelle Messages senden
for i in {1..100}; do
  mosquitto_pub -h localhost -t 'grow_monitoring/test' -m "$i"
  sleep 0.1
done
```

**Erwartung:**
- < 10ms Latenz (lokales Netzwerk)
- Keine verlorenen Messages
- Reihenfolge erhalten

---

## 8. Erweiterte Szenarien

### 8.1 Mehrere ESP32 Geräte

**ESP32 Device 1:**
```cpp
const char* mqtt_client_id = "ESP32_Zone1";
const char* device_prefix = "zone1";

// Topics:
// grow_monitoring/zone1/sensor/temperature
// grow_monitoring/zone1/relay/1/set
```

**ESP32 Device 2:**
```cpp
const char* mqtt_client_id = "ESP32_Zone2";
const char* device_prefix = "zone2";

// Topics:
// grow_monitoring/zone2/sensor/temperature
// grow_monitoring/zone2/relay/1/set
```

**Backend empfängt beide:**
```javascript
// Subscribe zu allen Zonen
mqtt.subscribe('grow_monitoring/+/sensor/#');
mqtt.subscribe('grow_monitoring/+/relay/+/state');
```

### 8.2 Externe Sensoren integrieren

**Beispiel: Xiaomi Bluetooth Sensor**

```yaml
# Home Assistant configuration.yaml
sensor:
  - platform: xiaomi_miflora
    mac: 'C4:7C:8D:XX:XX:XX'
    name: external_soil
    force_update: true
    median: 3

# Automation: Werte zu MQTT forwarden
automation:
  - alias: "Forward External Sensor to MQTT"
    trigger:
      - platform: state
        entity_id: sensor.external_soil_moisture
    action:
      - service: mqtt.publish
        data:
          topic: "grow_monitoring/sensor/external_moisture"
          payload: "{{ states('sensor.external_soil_moisture') }}"
```

### 8.3 Cloud-Integration (Adafruit IO, AWS IoT)

**Adafruit IO Bridge:**

```python
# Python Script auf Server
import paho.mqtt.client as mqtt

# Lokaler Broker
local_broker = "localhost"
local_topic = "grow_monitoring/sensor/#"

# Adafruit IO
aio_broker = "io.adafruit.com"
aio_user = "YOUR_USERNAME"
aio_key = "YOUR_KEY"

def on_message(client, userdata, message):
    topic = message.topic.split('/')[-1]  # temperature, humidity, etc.
    payload = message.payload.decode()

    # Forward to Adafruit IO
    aio_client.publish(f"{aio_user}/feeds/{topic}", payload)

# Local MQTT
client = mqtt.Client()
client.on_message = on_message
client.connect(local_broker, 1883)
client.subscribe(local_topic)

# Adafruit MQTT
aio_client = mqtt.Client()
aio_client.username_pw_set(aio_user, aio_key)
aio_client.connect(aio_broker, 1883)

# Run
client.loop_forever()
```

### 8.4 MQTT-Authentifizierung einrichten

**Mosquitto Passwort-Datei erstellen:**

```bash
# Passwort-Datei erstellen
sudo mosquitto_passwd -c /etc/mosquitto/passwd grow_user

# Weiteren User hinzufügen
sudo mosquitto_passwd /etc/mosquitto/passwd esp32_device

# Konfiguration anpassen
sudo nano /etc/mosquitto/mosquitto.conf
```

**mosquitto.conf:**
```conf
# Authentifizierung aktivieren
allow_anonymous false
password_file /etc/mosquitto/passwd

# ACL (Access Control List)
acl_file /etc/mosquitto/acl

listener 1883
```

**/etc/mosquitto/acl:**
```
# User: grow_user (Backend)
user grow_user
topic readwrite grow_monitoring/#
topic readwrite homeassistant/#

# User: esp32_device (ESP32)
user esp32_device
topic read grow_monitoring/relay/+/set
topic write grow_monitoring/sensor/#
topic write grow_monitoring/relay/+/state
```

**ESP32 Code anpassen:**
```cpp
const char* mqtt_user = "esp32_device";
const char* mqtt_password = "ihr_passwort";
```

**Backend .env anpassen:**
```env
MQTT_USERNAME=grow_user
MQTT_PASSWORD=ihr_passwort
```

### 8.5 TLS/SSL Verschlüsselung

**Mosquitto TLS konfigurieren:**

```bash
# Zertifikate erstellen (selbstsigniert für lokales Netzwerk)
cd /etc/mosquitto/certs

# CA Key
openssl genrsa -out ca.key 2048

# CA Cert
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt

# Server Key
openssl genrsa -out server.key 2048

# Server CSR
openssl req -new -key server.key -out server.csr

# Server Cert (von CA signiert)
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 3650
```

**mosquitto.conf:**
```conf
listener 8883
protocol mqtt
cafile /etc/mosquitto/certs/ca.crt
certfile /etc/mosquitto/certs/server.crt
keyfile /etc/mosquitto/certs/server.key
require_certificate false
```

**Backend anpassen:**
```env
MQTT_BROKER_URL=mqtts://localhost:8883
MQTT_CA_CERT=/path/to/ca.crt
```

---

## 9. Monitoring & Debugging

### 9.1 MQTT Logs überwachen

**Linux/Raspberry Pi:**
```bash
tail -f /var/log/mosquitto/mosquitto.log
```

**Windows:**
```cmd
Get-Content "C:\Program Files\mosquitto\mosquitto.log" -Wait -Tail 50
```

### 9.2 Connection-Status prüfen

```bash
# Aktive Verbindungen
mosquitto_sub -h localhost -t '$SYS/broker/clients/connected' -C 1

# Gesendete Messages
mosquitto_sub -h localhost -t '$SYS/broker/messages/sent' -C 1

# Empfangene Messages
mosquitto_sub -h localhost -t '$SYS/broker/messages/received' -C 1

# Alle System-Topics
mosquitto_sub -h localhost -t '$SYS/#' -v
```

### 9.3 Performance-Metriken

**MQTT Explorer:**
```
Statistics → Zeigt:
  - Messages/sec
  - Bytes/sec
  - Retained Messages
  - Connected Clients
```

**Backend API:**
```bash
curl http://localhost:3001/api/mqtt/status | jq
```

**Ausgabe:**
```json
{
  "enabled": true,
  "connected": true,
  "brokerUrl": "mqtt://localhost:1883",
  "publishedEntities": 12,
  "homeAssistantDiscovery": true,
  "uptime": 3600,
  "messagesSent": 1250,
  "messagesReceived": 45
}
```

---

## 10. Troubleshooting

### Problem: MQTT Broker startet nicht

**Logs prüfen:**
```bash
# Linux
sudo journalctl -u mosquitto -f

# Windows
Get-Content "C:\Program Files\mosquitto\mosquitto.log" -Tail 50
```

**Häufige Fehler:**
```
Error: Address already in use
→ Lösung: Anderer Service nutzt Port 1883
  sudo netstat -tulpn | grep 1883
  sudo kill [PID]

Error: Permission denied
→ Lösung: mosquitto.conf Berechtigungen
  sudo chmod 644 /etc/mosquitto/mosquitto.conf

Error: Config file not found
→ Lösung: Pfad prüfen
  mosquitto -c /etc/mosquitto/mosquitto.conf -v
```

### Problem: ESP32 kann nicht verbinden

**Serieller Monitor zeigt:**
```
MQTT connection failed, rc=-2
```

**RC-Codes:**
```
-4: Connection timeout
-3: Connection lost
-2: Connection failed
-1: Disconnected
 1: Wrong protocol version
 2: Client ID rejected
 3: Server unavailable
 4: Bad username/password
 5: Not authorized
```

**Lösungen:**
```
rc=-2: Broker läuft nicht oder falsche IP
  → mosquitto Status prüfen
  → IP-Adresse im ESP32-Code prüfen
  → Firewall Port 1883 öffnen

rc=4: Authentifizierung fehlgeschlagen
  → Username/Password prüfen
  → mosquitto.conf: allow_anonymous true?

rc=5: ACL verbietet Zugriff
  → /etc/mosquitto/acl prüfen
```

### Problem: Home Assistant erkennt keine Sensoren

**Prüfen:**
```
1. MQTT Integration aktiv?
   → Einstellungen → Geräte & Dienste → MQTT

2. Discovery aktiviert?
   → Backend .env: MQTT_HA_DISCOVERY=true

3. Discovery Messages gesendet?
   → MQTT Explorer: homeassistant/ Topics vorhanden?

4. Manuelle Entity hinzufügen:
   configuration.yaml:

   sensor:
     - platform: mqtt
       name: "Grow Temperature"
       state_topic: "grow_monitoring/sensor/temperature"
       unit_of_measurement: "°C"
       value_template: "{{ value_json.value }}"
```

---

## 11. Best Practices

### 11.1 Topic-Naming

```
✓ GUTE Topics:
  grow_monitoring/sensor/temperature
  grow_monitoring/zone1/relay/1/set
  homeassistant/sensor/grow_temp/config

✗ SCHLECHTE Topics:
  GrowMonitoring/Sensor/Temperature  (inkonsistente Groß-/Kleinschreibung)
  sensor-data/temp                    (nicht hierarchisch)
  grow/monitoring/sensor/1/temp/c     (zu tief)
```

### 11.2 QoS (Quality of Service) wählen

```
QoS 0 (At most once):
  - Schnellste
  - Keine Garantie
  → Verwenden für: Häufige Sensor-Daten (alle 10s)

QoS 1 (At least once):
  - Garantiert Zustellung
  - Duplikate möglich
  → Verwenden für: Wichtige Events, Commands

QoS 2 (Exactly once):
  - Langsamste
  - Garantiert genau einmal
  → Verwenden für: Kritische Commands (selten nötig)
```

**Im Code:**
```cpp
// ESP32
client.publish("grow_monitoring/sensor/temp", payload, 0);  // QoS 0

// Backend
mqtt.publish('grow_monitoring/relay/1/set', 'ON', { qos: 1 });  // QoS 1
```

### 11.3 Retained Messages

```
Retained = TRUE:
  - Letzte Message wird gespeichert
  - Neue Clients erhalten sofort aktuellen Wert
  → Verwenden für: Status, Konfiguration

Retained = FALSE:
  - Message wird nicht gespeichert
  → Verwenden für: Sensor-Daten, Events
```

### 11.4 Last Will Testament (LWT)

```cpp
// ESP32
void setup() {
  // LWT setzen
  client.setWill("grow_monitoring/system/status", "offline", true, 0);

  // Bei Verbindung: Online-Status
  if (client.connect(mqtt_client_id)) {
    client.publish("grow_monitoring/system/status", "online", true);
  }
}

// Bei unerwarteter Trennung sendet Broker automatisch:
// grow_monitoring/system/status → "offline"
```

---

## 12. Checkliste IoT Stack Setup

```
[ ] MQTT Broker installiert
[ ] Mosquitto Service läuft
[ ] Port 1883 erreichbar
[ ] mosquitto_sub/pub funktioniert
[ ] Backend .env mit MQTT konfiguriert
[ ] Backend verbindet zu MQTT
[ ] ESP32 mit MQTT-Bibliothek
[ ] ESP32 verbindet zu Broker
[ ] ESP32 publiziert Sensor-Daten
[ ] Backend empfängt MQTT-Daten
[ ] MQTT Explorer zeigt Topics
[ ] Relay-Commands funktionieren (beide Richtungen)
[ ] Home Assistant MQTT-Integration (optional)
[ ] Home Assistant Discovery funktioniert (optional)
[ ] Automationen getestet (optional)
```

---

**Ihr IoT Stack ist einsatzbereit! 🚀**

Nächste Schritte:
- Monitoring einrichten
- Backup-Strategie (MQTT Persistence)
- Skalierung (mehrere Devices)
- Cloud-Integration (optional)

Bei Fragen: GitHub Issues oder Community-Forum
