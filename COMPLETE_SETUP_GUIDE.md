# 🚀 KOMPLETTE EINRICHTUNGSANLEITUNG - Grow Monitoring System

## 📚 Inhaltsverzeichnis

1. [Systemübersicht](#1-systemübersicht)
2. [Was Sie benötigen](#2-was-sie-benötigen)
3. [Software Installation](#3-software-installation)
4. [Netzwerk vorbereiten](#4-netzwerk-vorbereiten)
5. [Backend einrichten](#5-backend-einrichten)
6. [Frontend einrichten](#6-frontend-einrichten)
7. [Hardware aufbauen](#7-hardware-aufbauen)
8. [ESP32 programmieren](#8-esp32-programmieren)
9. [System starten](#9-system-starten)
10. [Fehlerbehebung](#10-fehlerbehebung)

---

## 1. Systemübersicht

### Wie funktioniert das System?

```
┌─────────────────────────────────────────────────────────────────┐
│                    Ihr Grow Monitoring System                    │
└─────────────────────────────────────────────────────────────────┘

    ESP32 (Hardware)          Backend (Server)         Frontend (Web)
    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │              │         │              │         │              │
    │  Sensoren    │  WiFi   │   Node.js    │  HTTP   │   Browser    │
    │  ├─ Boden    ├────────►│   Server     │◄────────┤   Dashboard  │
    │  ├─ Temp     │         │              │         │              │
    │  └─ Licht    │         │  SQLite DB   │         │   Charts     │
    │              │         │              │         │   Controls   │
    │  Relais      │         │              │         │              │
    │  ├─ Pumpen   │◄────────┤  WebSocket   │         │              │
    │  └─ Licht    │         │              │         │              │
    │              │         │              │         │              │
    └──────────────┘         └──────────────┘         └──────────────┘
         Pflanzen              Ihr Computer            Ihr Browser
```

### Komponenten

1. **ESP32**: Microcontroller, der Sensoren ausliest und Pumpen steuert
2. **Backend**: Node.js Server, der Daten speichert und verarbeitet
3. **Frontend**: Web-Interface für Überwachung und Steuerung
4. **MQTT** (Optional): Für Home Assistant Integration

---

## 2. Was Sie benötigen

### 2.1 Hardware - Minimum Setup (~80-150€)

#### Computer/Server
```
Option A: Ihr Windows/Mac/Linux PC
  - Mindestens 4GB RAM
  - 10GB freier Speicher
  - WiFi oder LAN

Option B: Raspberry Pi 4 (empfohlen für 24/7 Betrieb)
  - Raspberry Pi 4 (2GB RAM) ~45€
  - 32GB SD-Karte ~10€
  - Netzteil ~10€
```

#### ESP32 Basis-Kit
```
✓ ESP32 Development Board          ~8-15€
  → ESP32-DevKitC oder NodeMCU-32S
  → Mit USB-Kabel

✓ 4x Kapazitive Bodenfeuchtesensoren  ~12-20€
  → NICHT resistive Sensoren verwenden!
  → Mit Kabel (min. 50cm)

✓ 1x DHT22 Sensor                    ~5-8€
  → Temperatur & Luftfeuchtigkeit
  → Mit Kabel

✓ 4-Kanal Relais-Modul               ~6-10€
  → 5V LOW-Level Trigger
  → Mit Optokoppler

✓ 4x 12V Wasserpumpen                ~16-24€
  → Mini Tauch-Pumpen
  → 12V DC, ~100-200mA

✓ 12V Netzteil (2A)                  ~8-12€
  → Für Pumpen

✓ 5V Netzteil (2A)                   ~6-10€
  → Für ESP32 und Relais

✓ Breadboard + Jumper Kabel          ~8-12€
  → 830 Punkte Breadboard
  → Male-Male, Male-Female Kabel

✓ Wasserschlauch (3mm/5mm)           ~5€
  → Silikonschlauch
```

**Gesamt Minimum: ~80-120€**

### 2.2 Hardware - Erweitertes Setup (+50-150€)

```
✓ CO2 Sensor MH-Z19B                 ~20-25€
✓ Lichtsensor BH1750                 ~3-5€
✓ pH Sensor (Analog)                 ~25-30€
✓ TDS/EC Sensor                      ~10-15€
✓ Wasserstandssensor                 ~3-5€
✓ 12V LED Grow Light                 ~20-40€
✓ 12V Lüfter                         ~8-12€
```

### 2.3 Software (Alles kostenlos!)

```
✓ Node.js (v16 oder höher)
✓ Arduino IDE
✓ Google Chrome oder Firefox
✓ Text Editor (VS Code empfohlen)
```

### 2.4 Netzwerk

```
✓ WiFi Router (2.4 GHz!)
  → ESP32 unterstützt KEIN 5 GHz WiFi
  → SSID sollte sichtbar sein (nicht versteckt)
  → WPA2 Verschlüsselung

✓ Statische IP oder Zugang zum Router
  → Um IP-Adresse herauszufinden
```

---

## 3. Software Installation

### 3.1 Node.js installieren

#### Windows:
```
1. Öffnen Sie https://nodejs.org/
2. Download "LTS" Version (z.B. 18.x.x)
3. Installer ausführen → Alles Standard-Optionen
4. Nach Installation PC neu starten

Testen:
  - Windows-Taste drücken
  - "cmd" eingeben → Enter
  - Eingeben: node --version
  - Sollte zeigen: v18.x.x
```

#### Mac:
```
1. Öffnen Sie https://nodejs.org/
2. Download "LTS" Version
3. .pkg Datei ausführen → Installieren
4. Terminal öffnen (Programme → Dienstprogramme → Terminal)
5. Testen: node --version
```

#### Linux (Ubuntu/Debian):
```bash
# Terminal öffnen (Strg+Alt+T)
sudo apt update
sudo apt install -y nodejs npm
node --version  # Sollte v12+ zeigen
```

#### Raspberry Pi:
```bash
# Terminal öffnen
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

### 3.2 Arduino IDE installieren

```
1. Download Arduino IDE 2.x
   → https://www.arduino.cc/en/software

2. Installation:
   Windows: .exe ausführen
   Mac: .dmg öffnen → In Programme ziehen
   Linux: AppImage ausführbar machen

3. Arduino IDE starten

4. ESP32 Support hinzufügen:
   a) Datei → Einstellungen
   b) "Zusätzliche Boardverwalter-URLs":
      https://dl.espressif.com/dl/package_esp32_index.json
   c) OK klicken

   d) Werkzeuge → Board → Boardverwalter
   e) Suchen: "esp32"
   f) Installieren: "esp32 by Espressif Systems"
   g) Warten bis fertig (kann 5-10 Min dauern)

5. Bibliotheken installieren:
   a) Sketch → Bibliothek einbinden → Bibliotheken verwalten
   b) Folgende installieren:
      - "WebSockets" by Markus Sattler
      - "ArduinoJson" by Benoit Blanchon
      - "DHT sensor library" by Adafruit
      - "Adafruit Unified Sensor"
```

### 3.3 Git installieren (Optional aber empfohlen)

#### Windows:
```
1. Download: https://git-scm.com/download/win
2. Installieren mit Standard-Optionen
```

#### Mac:
```
Bereits vorinstalliert oder:
brew install git
```

#### Linux:
```bash
sudo apt install git
```

---

## 4. Netzwerk vorbereiten

### 4.1 Ihre Computer IP-Adresse finden

#### Windows:
```
1. Windows-Taste + R
2. Eingeben: cmd
3. Eingeben: ipconfig
4. Suchen nach "IPv4-Adresse"
   Beispiel: 192.168.1.100

Notieren Sie:
  IP-Adresse: _________________
```

#### Mac:
```
1. Systemeinstellungen → Netzwerk
2. Ihre aktive Verbindung auswählen (WiFi oder Ethernet)
3. IP-Adresse steht rechts

Notieren Sie:
  IP-Adresse: _________________
```

#### Linux/Raspberry Pi:
```bash
hostname -I
# oder
ip addr show

Notieren Sie:
  IP-Adresse: _________________
```

### 4.2 WiFi-Daten notieren

```
SSID (WiFi Name):     _________________
Passwort:             _________________
Frequenz:             [ ] 2.4 GHz  [ ] 5 GHz  (ESP32 braucht 2.4 GHz!)

Wenn 5 GHz:
  → Router-Einstellungen öffnen
  → 2.4 GHz Netzwerk aktivieren
  → Oder separates 2.4 GHz SSID erstellen
```

### 4.3 Router-Einstellungen (Optional aber empfohlen)

```
Für stabileren Betrieb:

1. Router Admin-Panel öffnen:
   Meist: http://192.168.1.1 oder http://192.168.0.1

2. Statische IP für ESP32 reservieren:
   DHCP → Reservierung → MAC-Adresse des ESP32
   Empfohlene IP: 192.168.1.150

3. Firewall-Einstellungen:
   Port 3001 für lokales Netzwerk freigeben
```

---

## 5. Backend einrichten

### 5.1 Projekt herunterladen

#### Mit Git:
```bash
# Terminal / CMD öffnen
cd Desktop
git clone https://github.com/IHR_USERNAME/Grown_GrowMonitoring.git
cd Grown_GrowMonitoring
```

#### Ohne Git:
```
1. Projekt als ZIP herunterladen
2. Entpacken auf Desktop
3. Ordner umbenennen zu: Grown_GrowMonitoring
```

### 5.2 Backend konfigurieren

```bash
# Im Projekt-Ordner:
cd backend

# Abhängigkeiten installieren (dauert 2-5 Min)
npm install

# .env Datei erstellen
cp .env.example .env
```

#### .env Datei bearbeiten (Windows):
```bash
notepad .env
```

#### .env Datei bearbeiten (Mac/Linux):
```bash
nano .env
# oder
code .env  # Wenn VS Code installiert
```

#### Wichtige Einstellungen in .env:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (ÄNDERN SIE DIES!)
JWT_SECRET=mein-super-geheimes-passwort-12345

# Database
DB_PATH=./data/grow-monitoring.db

# CORS (Ihre Computer-IP eintragen!)
CORS_ORIGIN=http://localhost:3000

# SMTP (Optional - für Email-Benachrichtigungen)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ihre-email@gmail.com
SMTP_PASS=ihr-app-passwort
```

**Speichern und schließen:**
- Notepad: Strg+S, dann schließen
- Nano: Strg+X, dann Y, dann Enter

### 5.3 Backend starten (Test)

```bash
npm run dev
```

**Erwartete Ausgabe:**
```
> grow-monitoring-backend@3.0.0 dev
> ts-node-dev --respawn --transpile-only src/server.ts

🌱 Grow Monitoring Backend v3.0.0
✓ Database initialized
✓ Default admin user created
✓ Server started on port 3001
✓ WebSocket server ready
```

**Falls Fehler:**
- `Error: Cannot find module`: `npm install` erneut ausführen
- `Port 3001 already in use`: Anderen Port in .env einstellen
- `Permission denied`: Terminal als Administrator ausführen

**Backend läuft!** → Lassen Sie dieses Terminal-Fenster offen

---

## 6. Frontend einrichten

### 6.1 Neues Terminal öffnen

```
Windows: Neues CMD-Fenster (Windows-Taste → cmd)
Mac/Linux: Neues Terminal-Fenster (Strg+Shift+N)
```

### 6.2 Frontend installieren

```bash
# Zurück zum Projekt-Ordner
cd Desktop/Grown_GrowMonitoring/frontend

# Abhängigkeiten installieren (dauert 3-10 Min!)
npm install
```

### 6.3 Frontend konfigurieren

```bash
# .env Datei erstellen
# Windows:
copy .env.example .env

# Mac/Linux:
cp .env.example .env

# .env bearbeiten
notepad .env    # Windows
nano .env       # Mac/Linux
```

**Inhalt der .env:**
```env
# Ersetzen Sie 192.168.1.100 mit Ihrer IP aus Schritt 4.1!
REACT_APP_API_URL=http://192.168.1.100:3001
REACT_APP_WS_URL=ws://192.168.1.100:3001
```

### 6.4 Frontend starten

```bash
npm start
```

**Browser öffnet sich automatisch:** http://localhost:3000

**Login-Daten:**
```
Username: admin
Passwort: Admin123!
```

**Frontend läuft!** → Lassen Sie auch dieses Terminal-Fenster offen

---

## 7. Hardware aufbauen

### 7.1 Werkzeuge & Vorbereitung

```
Benötigt:
✓ Breadboard
✓ Jumper-Kabel (verschiedene Längen)
✓ Abisolierzange (optional)
✓ Multimeter (empfohlen für Fehlersuche)
✓ Kabelbinder
✓ Isolierband
```

### 7.2 Sicherheitshinweise ⚠️

```
KRITISCH:
❌ NIEMALS Pumpen direkt an ESP32 anschließen!
❌ NIEMALS 5V an 3.3V Pins anlegen!
❌ NIEMALS Netzteil-Pole vertauschen!

✅ IMMER gemeinsames GND (Common Ground)
✅ IMMER Polarität prüfen (+ und -)
✅ IMMER zuerst ohne Strom verkabeln
```

### 7.3 Schritt-für-Schritt Verkabelung

#### Schritt 1: ESP32 auf Breadboard setzen

```
┌─────────────────────────────────────┐
│         Breadboard                  │
│                                     │
│  [  ][  ][  ]ESP32[  ][  ][  ]    │
│  ═══════════════════════════════   │
│  [  ][  ][  ][  ][  ][  ][  ]    │
└─────────────────────────────────────┘

Achten Sie darauf:
- ESP32 sitzt fest
- Pins sind in den Löchern
- Beide Seiten haben Platz
```

#### Schritt 2: Stromversorgung

```
5V Netzteil (2A):
┌────────────┐
│ 5V Netzteil│
│   [+ -]    │
└─────┬──────┘
      │
      ├──── + → ESP32 VIN Pin
      └──── - → Breadboard GND Rail (blaue Linie)

WICHTIG:
- Plus (+) zu VIN
- Minus (-) zu GND
- Polarität prüfen!
```

#### Schritt 3: DHT22 Sensor anschließen

```
DHT22 (3 Pins):
┌─────┐
│  S  │───────── ESP32 GPIO 4
│  +  │───────── ESP32 3.3V
│  -  │───────── Breadboard GND Rail
└─────┘

Pinout DHT22:
  Von links nach rechts:
  1. VCC (+)
  2. Data (Signal)
  3. NC (nicht verwendet)
  4. GND (-)
```

#### Schritt 4: Bodenfeuchtesensoren

```
Sensor 1:
┌────────┐
│ SIGNAL │──── ESP32 GPIO 34
│  VCC   │──── ESP32 3.3V
│  GND   │──── GND Rail
└────────┘

Sensor 2: GPIO 35
Sensor 3: GPIO 36
Sensor 4: GPIO 39

Alle VCC zu 3.3V
Alle GND zu GND Rail
```

#### Schritt 5: Relais-Modul vorbereiten

```
Relais-Modul Jumper-Einstellung:
┌─────────────────┐
│  VCC    JD-VCC  │
│   ○──┐  ○       │  ← Jumper ENTFERNEN!
│      │          │
│  GND │  GND     │
└──────┴──────────┘

Warum?
- ESP32 liefert nur 3.3V
- Relais braucht 5V
- Separate Versorgung notwendig
```

#### Schritt 6: Relais-Modul anschließen

```
Relais-Modul:
┌──────────────┐
│ VCC          │──── ESP32 3.3V (nur für Logik!)
│ GND          │──── GND Rail
│ JD-VCC       │──── 5V Netzteil (+)
│              │
│ IN1          │──── ESP32 GPIO 18
│ IN2          │──── ESP32 GPIO 19
│ IN3          │──── ESP32 GPIO 23
│ IN4          │──── ESP32 GPIO 5
└──────────────┘

5V Netzteil GND auch zu GND Rail!
```

#### Schritt 7: Pumpen anschließen

```
12V Netzteil + Pumpe über Relais:

Relais 1 (für Pumpe 1):
┌─────────────┐
│ COM         │──── 12V Netzteil (+)
│ NO          │──── Pumpe 1 (+)
│ NC          │──── (nicht verwendet)
└─────────────┘

Pumpe 1 (-) ──── 12V Netzteil (-)

Schema:
12V(+) → Relais COM → Relais NO → Pumpe(+)
                                     │
                                  Pumpe(-)
                                     │
12V(-) ──────────────────────────────┘

Wiederholen für Pumpen 2, 3, 4
```

### 7.4 Vollständige Pin-Belegung Tabelle

```
╔═══════════════════════════════════════════════════════════╗
║                    ESP32 Pin-Belegung                     ║
╠═══════════════════════════════════════════════════════════╣
║ Pin       │ Verbindung                                    ║
╠═══════════════════════════════════════════════════════════╣
║ VIN       │ 5V Netzteil (+)                               ║
║ GND       │ GND Rail (alle GND zusammen!)                 ║
║ 3.3V      │ DHT22 VCC, Sensoren VCC, Relais VCC          ║
║           │                                               ║
║ GPIO 4    │ DHT22 Data                                    ║
║ GPIO 5    │ Relais IN4                                    ║
║ GPIO 18   │ Relais IN1                                    ║
║ GPIO 19   │ Relais IN2                                    ║
║ GPIO 23   │ Relais IN3                                    ║
║           │                                               ║
║ GPIO 34   │ Moisture Sensor 1 Signal                      ║
║ GPIO 35   │ Moisture Sensor 2 Signal                      ║
║ GPIO 36   │ Moisture Sensor 3 Signal                      ║
║ GPIO 39   │ Moisture Sensor 4 Signal                      ║
║ GPIO 32   │ Water Level Sensor Signal (optional)          ║
╚═══════════════════════════════════════════════════════════╝
```

### 7.5 Gemeinsames GND (WICHTIGSTER SCHRITT!)

```
ALLE GND müssen verbunden sein:

ESP32 GND ──┬──── Breadboard GND Rail
            │
DHT22 GND ──┤
            │
Moisture 1-4 GND ──┤
            │
Relais GND ─┤
            │
5V Netzteil (-) ──┤
            │
12V Netzteil (-) ──┘

Ohne gemeinsames GND funktioniert NICHTS!
```

### 7.6 Verkabelung prüfen

**Checkliste:**
```
[ ] ESP32 sitzt fest auf Breadboard
[ ] VIN an 5V Netzteil (+)
[ ] Alle GND zusammen an GND Rail
[ ] DHT22: 3 Kabel korrekt (3.3V, GND, GPIO 4)
[ ] Jeder Moisture Sensor: 3 Kabel korrekt
[ ] Relais VCC an 3.3V (nur Logik!)
[ ] Relais JD-VCC an 5V Netzteil
[ ] Relais IN1-IN4 an GPIOs
[ ] Pumpen über Relais COM und NO
[ ] Pumpen (-) an 12V Netzteil (-)
[ ] Polarität überprüft (+ und -)
```

---

## 8. ESP32 programmieren

### 8.1 Firmware-Datei öffnen

```
1. Arduino IDE starten
2. Datei → Öffnen
3. Navigieren zu:
   Desktop/Grown_GrowMonitoring/esp32/GrowMonitor.ino
4. Datei wird geöffnet
```

### 8.2 WiFi-Daten eintragen

**Suchen Sie diese Zeilen (ca. Zeile 15-20):**

```cpp
// WiFi Credentials
const char* ssid = "IHR_WIFI_NAME";
const char* password = "IHR_WIFI_PASSWORT";

// Server IP
const char* serverIP = "192.168.1.100";  // Ihre IP aus Schritt 4.1
const int serverPort = 3001;
```

**Ersetzen Sie:**
- `IHR_WIFI_NAME` → Ihr SSID aus Schritt 4.2
- `IHR_WIFI_PASSWORT` → Ihr WiFi-Passwort
- `192.168.1.100` → Ihre Computer-IP aus Schritt 4.1

**Beispiel:**
```cpp
const char* ssid = "MeinWLAN";
const char* password = "GeheimesPasswort123";
const char* serverIP = "192.168.1.105";
const int serverPort = 3001;
```

### 8.3 ESP32 verbinden

```
1. ESP32 via USB an Computer anschließen
2. Warten 10 Sekunden (Treiber Installation)
3. In Arduino IDE:
   Werkzeuge → Board → esp32 → "ESP32 Dev Module"
4. Werkzeuge → Port → COMx (Windows) oder /dev/ttyUSB0 (Linux)
```

**Port nicht sichtbar?**
```
Windows:
  - CP210x Treiber installieren
  - https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

Mac:
  - CH340 Treiber installieren
  - https://github.com/adrianmihalko/ch340g-ch34g-ch34x-mac-os-x-driver

Linux:
  sudo usermod -a -G dialout $USER
  (Neuanmeldung erforderlich)
```

### 8.4 Board-Einstellungen

```
Werkzeuge → Folgende Einstellungen:

Board: "ESP32 Dev Module"
Upload Speed: "115200"
CPU Frequency: "240MHz (WiFi/BT)"
Flash Frequency: "80MHz"
Flash Mode: "QIO"
Flash Size: "4MB (32Mb)"
Partition Scheme: "Default 4MB with spiffs"
Core Debug Level: "None"
Port: [Ihr COM-Port]
```

### 8.5 Hochladen!

```
1. Klicken Sie auf den Upload-Button (Pfeil →)
2. Warten Sie auf "Connecting..."
3. Falls "Connecting..." länger als 10 Sekunden:
   → BOOT-Taste am ESP32 gedrückt halten
   → Dann RESET-Taste kurz drücken
   → BOOT-Taste loslassen

4. Upload startet:
   "Writing at 0x00001000... (1 %)"
   "Writing at 0x00002000... (2 %)"
   ...
   "Writing at 0x00100000... (100 %)"

5. Fertig:
   "Hash of data verified."
   "Leaving...
   Hard resetting via RTS pin..."
```

**Upload-Dauer: ca. 30-60 Sekunden**

### 8.6 Seriellen Monitor öffnen

```
1. Werkzeuge → Serieller Monitor
2. Baud-Rate unten rechts: "115200"
3. Sie sollten sehen:

===============================================
🌱 Grow Monitoring System - ESP32
   Version 2.0.0
===============================================

✓ DHT22 initialized
✓ Moisture Sensors initialized
✓ Relays initialized

Connecting to WiFi: MeinWLAN
...
✓ WiFi connected!
   IP address: 192.168.1.150
   Signal: -45 dBm (Excellent)

Connecting to server: 192.168.1.105:3001
✓ WebSocket connected!

Sending sensor data...
Temperature: 22.5°C
Humidity: 58.0%
Moisture 1: 45%
Moisture 2: 52%
Moisture 3: 38%
Moisture 4: 61%
```

**Falls Probleme:** Siehe Abschnitt 10 - Fehlerbehebung

---

## 9. System starten

### 9.1 Alles ist bereit!

**Prüfen Sie:**
```
[ ] Backend läuft (Terminal 1)
[ ] Frontend läuft (Terminal 2)
[ ] ESP32 ist verbunden (Serieller Monitor)
[ ] Browser zeigt Dashboard
```

### 9.2 Im Dashboard einloggen

```
1. Browser öffnen: http://localhost:3000
2. Login:
   Username: admin
   Passwort: Admin123!
3. Enter drücken
```

### 9.3 Erste Schritte im Dashboard

#### 1. Pflanze anlegen

```
Linke Sidebar → "Plants" klicken
→ Button "+ New Plant"

Eingeben:
  Name: Pflanze 1
  Sensor ID: 1
  Phase: Vegetative
  Strain: (leer lassen oder auswählen)

→ "Save" klicken
```

#### 2. Live-Daten beobachten

```
Dashboard anschauen:
→ Sie sehen jetzt Live-Daten von ESP32!

Karten zeigen:
  - Temperatur (von DHT22)
  - Luftfeuchtigkeit (von DHT22)
  - Bodenfeuchtigkeit (von Sensoren 1-4)
  - Diagramme aktualisieren sich automatisch
```

#### 3. Bewässerung testen

```
Sidebar → "Irrigation"

Manueller Test:
1. Wählen Sie "Pflanze 1"
2. Klicken Sie "Water Now"
3. Dauer: 3 Sekunden
4. Bestätigen

→ Relais 1 sollte klicken
→ Pumpe 1 sollte 3 Sekunden laufen
→ Im Seriellen Monitor: "Relay 1: ON → OFF"
```

#### 4. Auto-Bewässerung einrichten

```
Irrigation Seite:

1. Toggle "Auto-Irrigation" AN
2. Moisture Threshold: 30%
3. Watering Duration: 5 Sekunden
4. Cooldown: 3600 Sekunden (1 Stunde)
5. "Save" klicken

Jetzt:
→ Wenn Bodenfeuchtigkeit < 30%
→ Pumpe läuft automatisch 5 Sekunden
→ Wartet dann 1 Stunde
```

### 9.4 System-Test durchführen

#### Test 1: Sensor-Werte

```
1. Serieller Monitor beobachten
2. Sensor in Wasser tauchen
3. Wert sollte steigen (z.B. 45% → 85%)
4. Sensor rausziehen
5. Wert sollte fallen

✓ Funktioniert: Sensor OK
✗ Kein Wert: Verkabelung prüfen (Schritt 7.6)
```

#### Test 2: Relais-Steuerung

```
1. Dashboard → Irrigation
2. "Water Now" klicken
3. Lauschen: Relais sollte klicken
4. Pumpe sollte laufen

✓ Relais klickt, Pumpe läuft: OK
✗ Nichts passiert:
  - Relais-Verkabelung prüfen
  - Serieller Monitor prüfen auf Fehler
  - Pumpen-Stromversorgung prüfen
```

#### Test 3: WebSocket-Verbindung

```
1. Dashboard öffnen
2. Serieller Monitor: ESP32 neu starten (RESET-Taste)
3. Warten auf "WebSocket connected"
4. Dashboard sollte sich aktualisieren

✓ Daten erscheinen: Verbindung OK
✗ "Connection lost":
  - Backend läuft?
  - IP-Adresse korrekt?
  - Firewall prüfen
```

### 9.5 Mobile App (Optional)

```
Vom Handy aus zugreifen:

1. Handy im gleichen WiFi wie Computer
2. Browser öffnen
3. Adresse: http://192.168.1.105:3000
   (Ihre Computer-IP aus Schritt 4.1)
4. Login: admin / Admin123!

→ Jetzt können Sie von überall im Haus zugreifen!
```

---

## 10. Fehlerbehebung

### 10.1 Backend startet nicht

#### Problem: "Cannot find module"
```bash
Lösung:
cd backend
rm -rf node_modules
npm install
npm run dev
```

#### Problem: "Port 3001 already in use"
```bash
Lösung:
# Anderen Port verwenden
# In backend/.env:
PORT=3002

# Dann ESP32 Code anpassen:
const int serverPort = 3002;
```

#### Problem: "SQLITE_CANTOPEN"
```bash
Lösung:
cd backend
mkdir data
npm run dev
```

### 10.2 Frontend startet nicht

#### Problem: "npm: command not found"
```bash
Lösung:
# Node.js neu installieren (Schritt 3.1)
# Terminal neu starten
```

#### Problem: "Port 3000 already in use"
```bash
Lösung:
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### 10.3 ESP32 Probleme

#### Problem: "Port not found"
```
Lösung:
1. USB-Kabel prüfen (Datenkabel, nicht nur Ladekabel!)
2. Anderen USB-Port versuchen
3. Treiber installieren (Schritt 8.3)
4. ESP32 neu anschließen
```

#### Problem: "WiFi connection failed"
```
Prüfen im Seriellen Monitor:
  Connecting to WiFi: MeinWLAN
  Failed to connect
  Retrying...

Lösungen:
✓ SSID korrekt? (Groß-/Kleinschreibung!)
✓ Passwort korrekt?
✓ 2.4 GHz WiFi? (ESP32 unterstützt KEIN 5 GHz!)
✓ SSID sichtbar? (Nicht versteckt)
✓ Router-Reichweite OK?
✓ Zu viele Geräte im WiFi? (DHCP voll)

Test:
  Handy Hotspot erstellen (2.4 GHz)
  ESP32 damit verbinden
  Wenn OK → Router-Problem
```

#### Problem: "WebSocket connection failed"
```
Serieller Monitor zeigt:
  ✓ WiFi connected
  Connecting to server: 192.168.1.105:3001
  ✗ WebSocket connection failed
  Retrying...

Lösungen:
1. Backend läuft?
   → Terminal prüfen, npm run dev ausführen

2. IP-Adresse korrekt?
   → Schritt 4.1 wiederholen
   → ESP32 Code anpassen

3. Firewall blockiert?
   → Windows: Firewall → Port 3001 freigeben
   → Mac: Systemeinstellungen → Firewall → Node.js erlauben

4. Beide im gleichen Netzwerk?
   → ESP32 WiFi = Computer WiFi
```

#### Problem: "Sensor gibt nur 0 oder 4095"
```
Bedeutung:
  0 = Kurzschluss oder Sensor defekt
  4095 = Nicht verbunden oder falscher Pin

Lösung:
1. Verkabelung prüfen (Schritt 7.4)
2. Pin-Nummer im Code korrekt?
3. Sensor testen: Multimeter messen
   Zwischen Signal und GND: 1.5-2.5V normal
4. Anderer Sensor / Pin testen
```

#### Problem: "Relais klickt, aber Pumpe läuft nicht"
```
Prüfen:
1. Pumpe direkt an 12V testen
   → Läuft? Pumpe OK
   → Läuft nicht? Pumpe defekt oder Polung falsch

2. Relais-Ausgang messen (Multimeter)
   → Relay ON: Spannung zwischen COM und NO?
   → Keine Spannung: Relais-Verdrahtung falsch

3. Relais-Typ prüfen
   → LOW-trigger oder HIGH-trigger?
   → Im Code: digitalWrite(pin, LOW) für ON testen
```

### 10.4 Netzwerk-Probleme

#### Problem: "Cannot connect to backend"
```
Browser zeigt:
  "Unable to connect to server"

Lösungen:
1. Backend läuft?
   cd backend
   npm run dev

2. Port korrekt?
   http://localhost:3001
   (nicht 3000!)

3. Browser-Cache leeren
   Strg+Shift+Del → Cache löschen

4. Andere Browser versuchen
   Chrome, Firefox, Edge
```

#### Problem: "CORS Error"
```
Browser Console (F12) zeigt:
  "Access to fetch at ... has been blocked by CORS policy"

Lösung:
backend/.env anpassen:
  CORS_ORIGIN=http://localhost:3000

Backend neu starten:
  Strg+C (Backend stoppen)
  npm run dev (Backend starten)
```

### 10.5 Daten-Probleme

#### Problem: "Keine Sensordaten im Dashboard"
```
Prüfen:
1. ESP32 verbunden?
   → Serieller Monitor: "WebSocket connected"?

2. Daten werden gesendet?
   → Serieller Monitor: "Sending sensor data"?

3. Backend empfängt?
   → Backend Terminal: "Sensor data received"?

4. Browser aktualisieren
   → F5 drücken

5. Browser Console prüfen
   → F12 → Console → Fehler?
```

#### Problem: "Auto-Irrigation funktioniert nicht"
```
Prüfen:
1. Auto-Irrigation aktiviert?
   → Toggle muss GRÜN sein

2. Schwellwert richtig?
   → Aktueller Wert < Schwellwert?

3. Cooldown abgelaufen?
   → Nach Bewässerung 1h warten

4. Pflanze hat Sensor-ID?
   → Plants → Edit → Sensor ID gesetzt?

Backend Log prüfen:
  "Auto-irrigation triggered for plant 1"
  "Relay 1 activated for 5000ms"
```

---

## 11. Erweiterte Einrichtung

### 11.1 MQTT Broker (Optional)

Für Home Assistant Integration:

#### Mosquitto installieren

**Windows:**
```
1. Download: https://mosquitto.org/download/
2. Installieren mit Standard-Optionen
3. Service starten:
   Win+R → services.msc → Mosquitto Broker → Starten
```

**Linux/Raspberry Pi:**
```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

**Mac:**
```bash
brew install mosquitto
brew services start mosquitto
```

#### Backend MQTT aktivieren

```bash
# backend/.env erweitern:
echo "MQTT_ENABLED=true" >> .env
echo "MQTT_BROKER=mqtt://localhost:1883" >> .env
echo "MQTT_USERNAME=" >> .env
echo "MQTT_PASSWORD=" >> .env
```

Backend neu starten.

### 11.2 Raspberry Pi 24/7 Server

#### System vorbereiten
```bash
# Raspberry Pi OS installiert?
sudo apt update
sudo apt upgrade -y

# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git installieren
sudo apt install git
```

#### Auto-Start einrichten

```bash
# PM2 Process Manager installieren
sudo npm install -g pm2

# Projekt klonen
cd /home/pi
git clone https://github.com/IHR_USER/Grown_GrowMonitoring.git
cd Grown_GrowMonitoring/backend

# Abhängigkeiten
npm install

# .env konfigurieren
cp .env.example .env
nano .env

# PM2 starten
pm2 start npm --name "grow-backend" -- run dev
pm2 save
pm2 startup

# Frontend build
cd ../frontend
npm install
npm run build

# Webserver (nginx)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default
```

**nginx Config:**
```nginx
server {
    listen 80;
    server_name _;

    location / {
        root /home/pi/Grown_GrowMonitoring/frontend/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

Zugriff: http://[RASPBERRY_PI_IP]

### 11.3 Statische IP für ESP32

Router-Admin-Panel öffnen:

```
1. http://192.168.1.1 (oder Router-IP)
2. Login (meist auf Router-Rückseite)
3. DHCP → Reservierung/Static Lease
4. MAC-Adresse: (aus ESP32 Seriell Monitor)
5. IP-Adresse: z.B. 192.168.1.150
6. Speichern

Vorteil:
→ ESP32 hat immer gleiche IP
→ Keine Anpassung nach Router-Neustart
```

### 11.4 Remote-Zugriff (Internet)

**Option A: DynDNS + Port Forwarding**

```
1. DynDNS Service (z.B. No-IP, DuckDNS)
2. Router Port-Forwarding:
   External Port 8080 → Internal 192.168.1.X:3000

Sicherheit:
⚠️ NICHT empfohlen ohne HTTPS!
⚠️ Passwort ändern!
```

**Option B: VPN (empfohlen)**

```
WireGuard VPN installieren:
→ Sicherer Zugriff von überall
→ Keine offenen Ports

Tutorial:
https://www.wireguard.com/install/
```

**Option C: Cloudflare Tunnel (einfachste)**

```
1. Account auf cloudflare.com
2. Zero Trust → Tunnels
3. Tunnel erstellen
4. Cloudflared installieren
5. Backend verbinden

→ Kostenlos
→ Automatisches HTTPS
→ Keine Router-Konfiguration
```

---

## 12. Wartung & Updates

### 12.1 Regelmäßige Wartung

**Wöchentlich:**
```
[ ] Sensoren reinigen (Bodenfeuchtigkeit)
[ ] Wassertank auffüllen
[ ] Schläuche auf Lecks prüfen
[ ] Pumpen-Funktion testen
```

**Monatlich:**
```
[ ] Sensoren kalibrieren
[ ] Relais-Kontakte prüfen
[ ] Kabel-Verbindungen festziehen
[ ] Backup der Datenbank
```

### 12.2 Datenbank-Backup

```bash
cd backend
cp data/grow-monitoring.db data/backup-$(date +%Y%m%d).db

# Automatisches Backup (Linux/Mac):
crontab -e
# Hinzufügen:
0 3 * * * cp /pfad/zu/backend/data/grow-monitoring.db /pfad/zu/backup/backup-$(date +\%Y\%m\%d).db
```

### 12.3 Software-Updates

```bash
# Backend
cd backend
git pull
npm install
npm run dev

# Frontend
cd ../frontend
git pull
npm install
npm start

# ESP32: Neue .ino hochladen (Schritt 8)
```

---

## 13. Support & Ressourcen

### 13.1 Dokumentation

```
README.md                 → Projekt-Übersicht
QUICK_START.md           → 5-Minuten Schnellstart
esp32/README.md          → ESP32 Details
esp32/WIRING_GUIDE.md    → Verkabelung Details
HARDWARE_SHOPPING_LIST.md → Einkaufsliste
```

### 13.2 Hilfe bekommen

```
1. GitHub Issues:
   https://github.com/IHR_USER/Grown_GrowMonitoring/issues

2. Seriellen Monitor prüfen
   → Fehlermeldungen kopieren

3. Screenshots machen
   → Dashboard
   → Fehler
   → Verkabelung

4. Issue erstellen mit:
   - Hardware-Setup (welche Sensoren?)
   - Software-Versionen (Node.js, Arduino IDE)
   - Fehlermeldung (komplett!)
   - Was schon versucht wurde
```

### 13.3 Community

```
Discord: [Link]
Forum: [Link]
Wiki: [Link]
```

---

## 14. Checkliste Komplett-Setup

**Kopieren Sie diese Liste und haken Sie ab:**

### Software
```
[ ] Node.js installiert (node --version funktioniert)
[ ] Arduino IDE installiert
[ ] ESP32 Board Support installiert
[ ] Bibliotheken installiert (WebSockets, ArduinoJson, DHT)
[ ] Git installiert (optional)
```

### Netzwerk
```
[ ] Computer-IP notiert: _________________
[ ] WiFi-SSID notiert: _________________
[ ] WiFi ist 2.4 GHz (nicht 5 GHz!)
[ ] Port 3001 in Firewall frei
```

### Backend
```
[ ] Projekt heruntergeladen
[ ] npm install durchgeführt
[ ] .env erstellt und konfiguriert
[ ] npm run dev startet ohne Fehler
[ ] http://localhost:3001 erreichbar
```

### Frontend
```
[ ] npm install durchgeführt
[ ] .env mit richtiger IP konfiguriert
[ ] npm start funktioniert
[ ] Login mit admin/Admin123! möglich
[ ] Dashboard sichtbar
```

### Hardware
```
[ ] Alle Teile vorhanden (siehe Schritt 2)
[ ] ESP32 auf Breadboard
[ ] Stromversorgung verkabelt (5V, 12V)
[ ] ALLE GND zusammen (Common Ground!)
[ ] DHT22 angeschlossen (GPIO 4)
[ ] 4x Moisture Sensoren (GPIO 34,35,36,39)
[ ] Relais-Modul angeschlossen
[ ] Pumpen über Relais
[ ] Verkabelung doppelt geprüft
```

### ESP32 Firmware
```
[ ] GrowMonitor.ino geöffnet
[ ] WiFi-Daten eingetragen
[ ] Server-IP eingetragen
[ ] Board eingestellt: "ESP32 Dev Module"
[ ] Port ausgewählt
[ ] Upload erfolgreich
[ ] Serieller Monitor zeigt "WiFi connected"
[ ] Serieller Monitor zeigt "WebSocket connected"
```

### Tests
```
[ ] Sensor-Werte im Dashboard sichtbar
[ ] "Water Now" aktiviert Pumpe
[ ] Relais klickt hörbar
[ ] Auto-Irrigation konfiguriert
[ ] System läuft stabil 10 Minuten
```

---

## 🎉 Geschafft!

**Ihr Grow Monitoring System läuft!**

```
Sie können jetzt:
✓ Sensordaten in Echtzeit überwachen
✓ Pflanzen automatisch bewässern
✓ Alerts bei Problemen erhalten
✓ Historische Daten analysieren
✓ Berichte erstellen
✓ Von überall zugreifen (Mobile)

Nächste Schritte:
→ Weitere Sensoren hinzufügen (CO2, Licht, pH)
→ Home Assistant Integration (MQTT)
→ Notifications einrichten (Email, Telegram)
→ Zeitpläne erstellen
→ ML-Modelle trainieren (optional)
```

**Viel Erfolg beim Growing! 🌱**

---

**Letzte Aktualisierung:** 2024-12-27
**Version:** 3.0.0
**Support:** GitHub Issues
