# ESP32 Firmware für Grow Monitoring System

## Hardware-Anforderungen

- **ESP32 Development Board** (z.B. ESP32-DevKitC, NodeMCU-32S)
- **Kapazitive Bodenfeuchtesensoren** (4x) - Analog
- **Wasserpumpen** (12V DC)
- **Relais-Modul** (7-8 Kanal)
- **DHT22** - Temperatur/Luftfeuchtigkeit Sensor (optional)
- **Wasserstandssensor** (optional)
- **12V Netzteil** für Pumpen/Relais
- **Jumper-Kabel**

## Pin-Belegung

### Analog Inputs (Sensoren)
- **GPIO 34**: Bodenfeuchtesensor 1
- **GPIO 35**: Bodenfeuchtesensor 2
- **GPIO 36**: Bodenfeuchtesensor 3
- **GPIO 39**: Bodenfeuchtesensor 4
- **GPIO 32**: Wasserstandssensor

### Digital Outputs (Relais)
- **GPIO 16**: Relais 1 (z.B. Pumpe 1)
- **GPIO 17**: Relais 2 (z.B. Pumpe 2)
- **GPIO 18**: Relais 3 (z.B. Licht)
- **GPIO 19**: Relais 4 (z.B. Ventilator)
- **GPIO 21**: Relais 5
- **GPIO 22**: Relais 6
- **GPIO 23**: Relais 7

### Sensoren
- **GPIO 4**: DHT22 (Temperatur/Luftfeuchtigkeit)

## Installation

### 1. Arduino IDE Setup

1. Installieren Sie die **Arduino IDE** (https://www.arduino.cc/en/software)
2. Fügen Sie ESP32 Board Support hinzu:
   - Datei → Voreinstellungen
   - Zusätzliche Boardverwalter-URLs: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Werkzeuge → Board → Boardverwalter
   - Suchen Sie nach "ESP32" und installieren Sie "esp32 by Espressif Systems"

### 2. Bibliotheken installieren

Gehen Sie zu Sketch → Bibliothek einbinden → Bibliotheken verwalten und installieren Sie:

- **WebSockets** by Markus Sattler
- **ArduinoJson** by Benoit Blanchon (Version 6.x)
- **DHT sensor library** by Adafruit

### 3. Konfiguration

Öffnen Sie `GrowMonitor.ino` und passen Sie folgende Werte an:

```cpp
// WiFi
const char* ssid = "IHR_WIFI_NAME";
const char* password = "IHR_WIFI_PASSWORT";

// Server (Backend IP-Adresse)
const char* serverIP = "192.168.1.100";  // IP des Backend-Servers
const int serverPort = 3001;
```

### 4. Upload

1. Verbinden Sie den ESP32 via USB
2. Wählen Sie Board: Werkzeuge → Board → ESP32 Dev Module
3. Wählen Sie Port: Werkzeuge → Port → (Ihr COM-Port)
4. Klicken Sie auf Upload

## Sensor-Kalibrierung

### Bodenfeuchtesensoren

Die Rohwerte der kapazitiven Sensoren variieren je nach Sensor. Kalibrieren Sie diese:

1. **Trockener Wert**: Sensor in der Luft → typisch 3000-4095
2. **Nasser Wert**: Sensor in Wasser → typisch 1000-1500

Passen Sie diese Werte in der Funktion `readAndSendSensorData()` an:

```cpp
float moisturePercent = map(rawValue, 3000, 1500, 0, 100);
//                                    ^dry    ^wet
```

### Wasserstandssensor

Kalibrieren Sie den Wasserstandsbereich für Ihren Tank.

## Fehlerbehebung

### ESP32 verbindet sich nicht mit WiFi
- Prüfen Sie SSID und Passwort
- Stellen Sie sicher, dass 2.4 GHz WiFi verwendet wird (nicht 5 GHz)

### Keine WebSocket-Verbindung
- Prüfen Sie die Server IP-Adresse
- Stellen Sie sicher, dass Backend läuft
- Prüfen Sie Firewall-Einstellungen

### Sensoren liefern falsche Werte
- Kalibrieren Sie die Sensor-Werte
- Prüfen Sie die Verkabelung
- Verwenden Sie externe Pull-up Widerstände wenn nötig (10kΩ)

## Serieller Monitor

Öffnen Sie den Seriellen Monitor (115200 Baud) um Debug-Ausgaben zu sehen:

```
🌱 Grow Monitoring System - ESP32
Version 1.1.0
Connecting to WiFi...
✓ WiFi connected - IP: 192.168.1.50
✓ WebSocket connected
Relay 1 -> ON
Pump 2 started for 5 seconds
```

## Schaltplan-Hinweise

1. **Relais-Modul**: Verwenden Sie ein 5V oder 3.3V kompatibles Relais-Modul
2. **Pumpen**: Schließen Sie 12V Pumpen an die Relais-Ausgänge an
3. **Stromversorgung**: ESP32 und Relais benötigen separate Stromversorgung!
4. **Ground**: Verbinden Sie alle GND-Pins gemeinsam

## Erweiterungen

- Weitere Sensoren hinzufügen (pH, EC, Lichtstärke)
- Mehr Relais für zusätzliche Geräte
- LCD Display für lokale Anzeige
- SD-Karte für Offline-Logging
