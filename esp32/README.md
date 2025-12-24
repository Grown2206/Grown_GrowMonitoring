# ESP32 Firmware für Grow Monitoring System

## 📋 Übersicht

Dieses Verzeichnis enthält die komplette ESP32/ESP8266 Firmware für das Grow Monitoring System mit Unterstützung für eine Vielzahl von Sensoren.

### Verfügbare Firmware-Varianten

| Firmware | Beschreibung | Empfohlen für |
|----------|--------------|---------------|
| **GrowMonitor.ino** | Basis-Version mit Standard-Sensoren | Einsteiger, 1-4 Pflanzen |
| **GrowMonitor_AllSensors.ino** | Erweiterte Version mit ALLEN Sensoren | Fortgeschrittene, große Setups |
| **ESP8266_README.md** | Dokumentation für ESP8266 | Budget-Projekte |

### Sensor-Treiber Bibliotheken

Im Verzeichnis `sensors/` finden Sie professionelle Treiber für:

| Bibliothek | Unterstützte Sensoren | Verwendung |
|------------|----------------------|------------|
| **CO2_Sensors.h** | MH-Z19B (UART), SCD30 (I2C) | CO2-Überwachung |
| **Light_Sensors.h** | BH1750, VEML7700, TSL2591, Analog LDR | Licht/PAR Messung |
| **Water_Quality_Sensors.h** | pH, TDS, EC (Analog & I2C) | Wasserqualität für Hydroponik |
| **VOC_Sensors.h** | SGP30, CCS811, BME680, MQ-135 | Luftqualität & VOC |
| **PM_Sensors.h** | PMS5003, PMS7003, SDS011, GP2Y1010 | Feinstaub PM2.5/PM10 |

## 🔧 Hardware-Anforderungen

### Basis-Setup (~50-100€)
- **ESP32 Development Board** (z.B. ESP32-DevKitC, NodeMCU-32S)
- **4x Kapazitive Bodenfeuchtesensoren** (Analog)
- **DHT22** Temperatur/Luftfeuchtigkeit Sensor
- **Relais-Modul** (4-8 Kanal)
- **Wasserpumpen** (12V DC)
- **12V Netzteil** (mind. 2A)

### Erweitert (~150-300€)
Zusätzlich zum Basis-Setup:
- **CO2 Sensor**: MH-Z19B (UART, ~20€) oder SCD30 (I2C, ~50€)
- **Lichtsensor**: BH1750 (I2C, ~5€) oder VEML7700 (I2C, ~8€)
- **pH Sensor**: Analog (~25€) oder Atlas Scientific (I2C, ~60€)
- **TDS/EC Sensor**: Analog (~10€)
- **VOC Sensor**: SGP30 (I2C, ~15€) oder CCS811 (I2C, ~12€)
- **PM2.5 Sensor**: PMS5003 (UART, ~20€) oder SDS011 (UART, ~25€)
- **Wasserstandssensor**: Analog oder Ultraschall

### Premium (~400-600€)
- SCD30 statt MH-Z19B
- VEML7700 + TSL2591 für präzises PAR
- Atlas Scientific pH/EC Sensoren (I2C)
- BME680 (Temp + Hum + Pressure + Gas)
- PMS5003 oder PMS7003

## 📌 Pin-Belegung ESP32

### I2C Bus (Mehrere Sensoren möglich!)
```
SDA: GPIO 21  →  SCD30, BH1750, VEML7700, SGP30, CCS811, BME680, etc.
SCL: GPIO 22  →  Alle I2C Sensoren teilen sich diese Pins
```

### UART Sensoren (Serial2)
```
RX: GPIO 16  →  MH-Z19B TX, PMS5003 TX, SDS011 TX
TX: GPIO 17  →  MH-Z19B RX, PMS5003 RX, SDS011 RX
```

### Analog Inputs (NUR Input, kein Output!)
```
GPIO 34: Bodenfeuchtesensor 1 oder pH Sensor
GPIO 35: Bodenfeuchtesensor 2 oder TDS Sensor
GPIO 36: Bodenfeuchtesensor 3 oder EC Sensor
GPIO 39: Bodenfeuchtesensor 4 oder Analog Light Sensor
GPIO 32: Wasserstandssensor
GPIO 33: Zusätzlicher Analog Sensor (z.B. MQ-135)
```

### Digital Outputs (Relais, LEDs)
```
GPIO 16: Relais 1 (Pumpe 1)    *Achtung: konfliktiert mit Serial2!
GPIO 17: Relais 2 (Pumpe 2)    *Achtung: konfliktiert mit Serial2!
GPIO 18: Relais 3 (Licht)
GPIO 19: Relais 4 (Ventilator)
GPIO 23: Relais 5
GPIO 5:  Relais 6
GPIO 25: Relais 7 oder LED
```

### DHT22 Sensor
```
GPIO 4: DHT22 Data Pin
```

### Hinweis zu Pin-Konflikten
- **GPIO 16/17**: Wenn Sie Serial2 für UART-Sensoren verwenden, können diese NICHT für Relais genutzt werden!
- **GPIO 0, 2, 15**: Boot-Mode Pins, nur für I/O nutzen wenn Boot-Sequenz verstanden
- **GPIO 6-11**: Intern für Flash verwendet, NICHT nutzen!

## 📦 Installation

### 1. Arduino IDE Setup

1. Installieren Sie die [Arduino IDE](https://www.arduino.cc/en/software)
2. Fügen Sie ESP32 Board Support hinzu:
   - Datei → Voreinstellungen
   - Zusätzliche Boardverwalter-URLs:
     ```
     https://dl.espressif.com/dl/package_esp32_index.json
     ```
   - Werkzeuge → Board → Boardverwalter
   - Suchen: "ESP32" → Installieren: "esp32 by Espressif Systems"

### 2. Bibliotheken installieren

**Pflicht (für Basis-Setup):**
```
- WebSockets by Markus Sattler
- ArduinoJson by Benoit Blanchon (Version 6.x)
- DHT sensor library by Adafruit
- Adafruit Unified Sensor (Dependency)
```

**Optional (je nach Sensoren):**
```
- BH1750 by Christopher Laws
- Adafruit VEML7700 Library
- Adafruit TSL2591 Library
- SparkFun SCD30 Arduino Library
- Adafruit SGP30 Sensor
- Adafruit CCS811 Library
- Adafruit BME680 Library
- PMS Library by Mariusz Kacki (optional, Custom Code vorhanden)
```

**Installation:**
- Sketch → Bibliothek einbinden → Bibliotheken verwalten
- Oder: Download ZIP und Import via Sketch → Bibliothek einbinden → .ZIP Bibliothek hinzufügen

### 3. Firmware-Auswahl

#### Für Einsteiger: `GrowMonitor.ino`
- Basis-Sensoren: Feuchtigkeit, DHT22, Wasserstand
- Relais-Steuerung
- WebSocket-Kommunikation
- ~200 Zeilen Code

#### Für Fortgeschrittene: `GrowMonitor_AllSensors.ino`
- ALLE unterstützten Sensoren
- Modular aktivierbar via `#define`
- Batch Sensor-Daten über JSON
- ~500 Zeilen Code

### 4. Konfiguration

Öffnen Sie die `.ino` Datei und passen Sie an:

```cpp
// WiFi Credentials
const char* ssid = "IHR_WIFI_NAME";
const char* password = "IHR_WIFI_PASSWORT";

// Server IP
const char* serverIP = "192.168.1.100";  // IP Ihres Backend-Servers
const int serverPort = 3001;

// Sensoren aktivieren/deaktivieren
#define USE_MOISTURE_SENSORS    // Bodenfeuchtigkeit
#define USE_DHT22               // Temperatur & Luftfeuchtigkeit
//#define USE_MHZ19B            // CO2 (auskommentiert = deaktiviert)
//#define USE_SCD30             // CO2 + Temp + Hum
#define USE_BH1750              // Lichtsensor
// ... etc.
```

### 5. Upload

1. Verbinden Sie ESP32 via USB
2. Board auswählen: **Werkzeuge → Board → ESP32 Dev Module**
3. Port auswählen: **Werkzeuge → Port → COMx (Windows) oder /dev/ttyUSBx (Linux)**
4. Upload Speed: **115200** (sicherer) oder **921600** (schneller)
5. Partition Scheme: **Default 4MB** oder **Minimal SPIFFS**
6. **Upload** Button klicken

## 🔬 Sensor-Kalibrierung

### Bodenfeuchtesensoren (Kapazitiv)

**Warum kalibrieren?**
- Jeder Sensor hat unterschiedliche Rohwerte
- Abhängig von Bodenart (Erde, Cocos, Steinwolle)

**Kalibrierungs-Prozess:**
1. **Trocken-Wert**: Sensor komplett in der Luft → Serieller Monitor → Notieren (z.B. 3200)
2. **Nass-Wert**: Sensor komplett in Wasser → Serieller Monitor → Notieren (z.B. 1400)
3. **Code anpassen**:
   ```cpp
   float moisturePercent = map(rawValue, 3200, 1400, 0, 100);
   //                                    ^dry   ^wet
   ```

**Typische Werte:**
- **Trocken**: 2800 - 4095
- **Nass**: 1000 - 1800
- **Mittel**: ~1900 - 2400

### pH Sensor

**Wichtig:** 2-Punkt oder 3-Punkt Kalibrierung erforderlich!

**Benötigt:**
- pH 4.0 Puffer-Lösung (rot)
- pH 7.0 Puffer-Lösung (gelb)
- Optional: pH 10.0 Puffer-Lösung (blau)

**Prozess:**
1. Sensor 10min in destilliertem Wasser einweichen
2. In pH 7.0 Lösung tauchen → Wert stabilisieren → Spannung notieren
3. Sensor abspülen
4. In pH 4.0 Lösung tauchen → Wert stabilisieren → Spannung notieren
5. Code:
   ```cpp
   phSensor.calibrate(2.19, 1.65);  // (voltage@pH4, voltage@pH7)
   ```

**Lagerung:** In pH 4.0 Lösung oder KCl-Lösung, **NIE trocken!**

### TDS / EC Sensor

**Benötigt:**
- 1413 µS/cm Kalibrier-Lösung (Standard)
- Oder: 12.88 mS/cm Kalibrier-Lösung

**Prozess:**
1. Sensor in Kalibrier-Lösung tauchen
2. Warten bis stabil (30-60 Sekunden)
3. Code:
   ```cpp
   tdsSensor.calibrate(1413);  // Bekannter TDS-Wert in ppm
   ecSensor.calibrate(1.413);  // Bekannter EC-Wert in mS/cm
   ```

### CO2 Sensor (MH-Z19B)

**Auto-Kalibrierung:**
- Sensor kalibriert sich automatisch auf 400 ppm alle 24h
- Setzt voraus: Mindestens 20min/Tag Frischluft (400 ppm)

**Manuelle Kalibrierung:**
```cpp
mhz19b.calibrateZeroPoint();  // Nur in Frischluft durchführen!
```

**Aufwärm-Zeit:** 3 Minuten vor stabilen Werten

### Lichtsensor Kalibrierung

**BH1750/VEML7700:**
- Meist keine Kalibrierung nötig
- Optional: Vergleich mit Lux-Meter

**LDR (Analog):**
```cpp
// Min/Max Werte bestimmen:
ldrSensor.calibrate(100, 3800);  // (dunkel, hell)
```

**PAR Umrechnung:**
- 1 Lux ≈ 0.0185 µmol/m²/s (weiße LEDs)
- 1 Lux ≈ 0.015 µmol/m²/s (Vollspektrum)

### VOC Sensor (SGP30)

**Warm-up:**
- Erste 12 Stunden unstabile Werte
- Nach 12h: Baseline speichern!

**Baseline Management:**
```cpp
vocSensor.saveBaseline();  // Alle 12h
vocSensor.restoreBaseline(0x9234, 0x8ABC);  // Nach Neustart
```

### PM2.5 Sensor (PMS5003)

**Normalerweise keine Kalibrierung nötig.**

**Aufwärm-Zeit:** 30 Sekunden

**Stromsparen:**
```cpp
pmsSensor.sleep();   // Sensor ausschalten
// ... warten ...
pmsSensor.wakeUp();  // 30s warten vor Messung
```

## 🛠 Fehlerbehebung

### ESP32 verbindet sich nicht mit WiFi
```
Mögliche Ursachen:
✗ Falsches SSID/Passwort
✗ 5 GHz WiFi (ESP32 nur 2.4 GHz!)
✗ WiFi-Kanal > 11 (ESP32 max. Kanal 11)
✗ Verstecktes SSID (manche ESP32 haben Probleme)
✗ Unzureichende Stromversorgung

Lösung:
✓ SSID/Passwort prüfen
✓ Router auf 2.4 GHz Kanal 1-11 einstellen
✓ SSID Broadcasting aktivieren
✓ USB-Kabel mit 500mA+ oder externes Netzteil
```

### Keine WebSocket-Verbindung
```
✗ Backend läuft nicht
✗ Falsche IP-Adresse
✗ Firewall blockiert Port 3001
✗ ESP32 und Server in unterschiedlichen Netzwerken

Lösung:
✓ Backend starten: cd backend && npm run dev
✓ Server IP prüfen: ipconfig (Windows) oder ifconfig (Linux)
✓ Firewall-Regel für Port 3001 hinzufügen
✓ Beide Geräte im selben WLAN
```

### Sensoren liefern fehlerhafte Werte
```
✗ Verkabelung falsch
✗ Sensor nicht kalibriert
✗ Stromversorgung unzureichend
✗ Sensor defekt

Lösung:
✓ Pin-Belegung prüfen
✓ Kalibrierung durchführen
✓ Externes 5V Netzteil für Sensoren (nicht ESP32 Pin!)
✓ Seriellen Monitor prüfen für Fehler-Meldungen
✓ Sensor tauschen
```

### I2C Sensoren werden nicht erkannt
```
✗ Falsche I2C-Adresse
✗ SDA/SCL vertauscht
✗ Kein Pull-up Widerstand
✗ Zu viele I2C-Geräte am Bus

Lösung:
✓ I2C Scanner verwenden (Arduino Beispiel)
✓ SDA=GPIO21, SCL=GPIO22 prüfen
✓ 4.7kΩ Pull-up zu 3.3V hinzufügen (falls nicht auf Board)
✓ Max. 10-15 I2C Geräte pro Bus
```

### UART Sensoren funktionieren nicht
```
✗ RX/TX vertauscht
✗ Falsche Baud-Rate
✗ Serial Monitor verwendet Serial2
✗ Konflikt mit Relais auf GPIO 16/17

Lösung:
✓ ESP32 RX → Sensor TX, ESP32 TX → Sensor RX
✓ Baud-Rate prüfen (MH-Z19B: 9600, PMS5003: 9600)
✓ Serial Monitor nur auf Serial (USB), nicht Serial2
✓ Relais auf andere Pins verlegen
```

## 💾 Serieller Monitor

**Baudrate:** 115200

**Erwartete Ausgabe:**
```
===============================================
🌱 Grow Monitoring System - ESP32
   All Sensors Edition v2.0.0
===============================================

✓ DHT22 initialized
✓ BH1750 Light Sensor initialized
✓ Relays initialized
✓ Moisture Sensors initialized
✓ Water Level Sensor initialized

Connecting to WiFi...
✓ WiFi connected - IP: 192.168.1.42

✓ WebSocket connected

Sensor Data:
{
  "type": "sensor_data_batch",
  "data": {
    "temperature": 24.5,
    "humidity": 58.2,
    "light": 12450,
    "par": 230.3,
    "tankLevel": 75,
    "moisture": [
      {"sensorId": 1, "value": 42},
      {"sensorId": 2, "value": 38}
    ]
  }
}
```

## 🔌 Verkabelung & Schaltplan

### Stromversorgung - WICHTIG!

```
ESP32:
  - USB: 5V, max. 500mA (nur für ESP32 + kleine Sensoren)
  - VIN Pin: 5V, für Nutzung mit externem Netzteil
  - 3.3V Pin: NUR als Output, max. 200mA!

Relais-Modul:
  - Separate 5V Versorgung (mind. 500mA)
  - GND mit ESP32 GND verbinden (Common Ground!)

Pumpen:
  - 12V Netzteil (2A+)
  - NIEMALS direkt an ESP32!
  - Nur über Relais

Sensoren:
  - I2C Sensoren: Meist 3.3V oder 5V
  - Analog Sensoren: Meist 5V (mit Spannungsteiler für ESP32!)
  - UART Sensoren: Meist 5V
```

### Level Shifter für 5V Sensoren

Wenn Analog-Sensor 5V ausgibt, ESP32 aber nur 3.3V verträgt:

```
Spannungsteiler:
  Sensor 5V → [10kΩ] → ESP32 GPIO → [20kΩ] → GND

Oder: Bidirektionaler Level Shifter (z.B. TXB0104)
```

### Pull-up Widerstände

I2C Bus benötigt Pull-ups (meist auf Sensor-Board vorhanden):
```
SDA → [4.7kΩ] → 3.3V
SCL → [4.7kΩ] → 3.3V
```

## 📊 Sensor-Spezifikationen

| Sensor | Typ | Messbereich | Genauigkeit | Preis | Empfehlung |
|--------|-----|-------------|-------------|-------|------------|
| **Kapazitiver Bodenfeuchte** | Analog | 0-100% | ±5% | 3-5€ | ⭐⭐⭐⭐⭐ Pflicht |
| **DHT22** | Digital | -40-80°C, 0-100% | ±0.5°C, ±2% | 5-8€ | ⭐⭐⭐⭐⭐ Pflicht |
| **MH-Z19B** | UART | 0-5000ppm CO2 | ±50ppm | 20€ | ⭐⭐⭐⭐ Empfohlen |
| **SCD30** | I2C | 400-10000ppm | ±30ppm | 50€ | ⭐⭐⭐⭐⭐ Premium |
| **BH1750** | I2C | 1-65535 Lux | ±20% | 3-5€ | ⭐⭐⭐⭐ Gut |
| **VEML7700** | I2C | 0-120k Lux | ±10% | 8-10€ | ⭐⭐⭐⭐⭐ Sehr gut |
| **pH Sensor (Analog)** | Analog | pH 0-14 | ±0.1 | 25€ | ⭐⭐⭐ Braucht Wartung |
| **Atlas pH (I2C)** | I2C | pH 0-14 | ±0.002 | 60€ | ⭐⭐⭐⭐⭐ Profi |
| **TDS Sensor** | Analog | 0-1000ppm | ±10% | 10€ | ⭐⭐⭐⭐ Hydroponik |
| **SGP30** | I2C | 0-60k ppb VOC | ±15% | 15€ | ⭐⭐⭐⭐ Indoor |
| **PMS5003** | UART | PM1/2.5/10 | ±10% | 20€ | ⭐⭐⭐ Optional |

## 📚 Weiterführende Dokumentation

- **ESP8266_README.md** - ESP8266 Setup & Unterschiede
- **sensors/CO2_Sensors.h** - CO2 Sensor Dokumentation + Beispiele
- **sensors/Light_Sensors.h** - Licht/PAR Sensor Dokumentation
- **sensors/Water_Quality_Sensors.h** - pH/TDS/EC Dokumentation
- **sensors/VOC_Sensors.h** - VOC & Luftqualität
- **sensors/PM_Sensors.h** - Feinstaub PM2.5/PM10

## 🆘 Support & Community

Bei Problemen:
1. ✅ Seriellen Monitor prüfen (115200 Baud)
2. ✅ Verkabelung doppelt prüfen
3. ✅ Sensor-Kalibrierung durchführen
4. ✅ GitHub Issues erstellen mit:
   - Hardware-Setup
   - Serieller Monitor Output
   - Verwendete Sensoren
   - Fehlermeldung

## 📝 Version History

- **v2.0.0** (24.12.2024) - All Sensors Edition + Treiber-Bibliotheken
- **v1.1.0** (21.12.2024) - Multi-Device Support
- **v1.0.0** (20.12.2024) - Initial Release
