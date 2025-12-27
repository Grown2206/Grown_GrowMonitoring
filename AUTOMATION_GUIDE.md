# 🤖 Automatisierte Installation - Grow Monitoring System

## Übersicht

Dieses Projekt bietet **drei verschiedene Automatisierungs-Optionen**:

1. **Komplettes Setup-Script** - Installiert ALLES automatisch
2. **MQTT-Only Setup** - Nur MQTT Broker installieren
3. **Docker Compose** - Ultimative Automatisierung mit Containern

---

## Option 1: Komplettes Setup-Script (Empfohlen für Anfänger)

### Linux / macOS / Raspberry Pi

```bash
# 1. In Projekt-Verzeichnis wechseln
cd Grown_GrowMonitoring

# 2. Script ausführen
./setup-complete.sh

# Fertig! 🎉
# Das Script installiert automatisch:
#   ✓ Node.js (falls nicht vorhanden)
#   ✓ Backend Dependencies
#   ✓ Frontend Dependencies
#   ✓ MQTT Broker (Mosquitto)
#   ✓ Konfiguriert alle .env Dateien
#   ✓ Initialisiert Datenbank
#   ✓ Führt Tests durch
```

**Dauer:** ~5-10 Minuten (abhängig von Internet)

**Was passiert:**

```
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║     🌱 Grow Monitoring System - Komplette Automatische Installation  ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

[INFO] Erkenne Betriebssystem...
[✓] Erkannt: Ubuntu 22.04 LTS

[INFO] Prüfe Node.js Installation...
[✓] Node.js gefunden: v18.17.0

[INFO] Installiere Backend Dependencies...
[✓] Backend Dependencies installiert

[INFO] Konfiguriere Backend .env...
[✓] .env erstellt von .env.example
[✓] JWT_SECRET generiert und eingetragen

[INFO] Installiere Frontend Dependencies...
[✓] Frontend Dependencies installiert

[INFO] Konfiguriere Frontend .env...
[✓] Frontend .env erstellt
[INFO] API URL: http://192.168.1.105:3001

[INFO] Installiere MQTT Broker (Mosquitto)...
[✓] Mosquitto installiert

[INFO] Konfiguriere MQTT Broker...
[✓] MQTT konfiguriert
[✓] MQTT Service gestartet

[INFO] Aktiviere MQTT im Backend...
[✓] Backend MQTT konfiguriert

[INFO] Initialisiere Datenbank...
[✓] Datenbank-Verzeichnis bereit

[INFO] Führe System-Tests durch...
[✓] Node.js: v18.17.0
[✓] npm: 9.8.1
[✓] Backend Dependencies installiert
[✓] Frontend Dependencies installiert
[✓] Backend .env vorhanden
[✓] Frontend .env vorhanden
[✓] Mosquitto installiert
[✓] MQTT Port 1883 offen

╔═══════════════════════════════════════════════════════════════════════╗
║                    ✓✓✓ INSTALLATION ERFOLGREICH! ✓✓✓                  ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Nach der Installation:**

```bash
# Terminal 1: Backend starten
cd backend
npm run dev

# Terminal 2: Frontend starten
cd frontend
npm start

# Browser öffnet automatisch: http://localhost:3000
# Login: admin / Admin123!
```

---

## Option 2: Nur MQTT Setup

Wenn Backend und Frontend bereits laufen und Sie nur MQTT hinzufügen möchten:

### Linux / macOS / Raspberry Pi

```bash
./setup-mqtt.sh
```

### Windows (PowerShell als Administrator)

```powershell
.\setup-mqtt.ps1
```

**Was wird installiert:**

```
✓ Mosquitto MQTT Broker
✓ Mosquitto Client-Tools (mosquitto_pub, mosquitto_sub)
✓ Automatische Konfiguration
✓ Service Auto-Start
✓ Firewall-Regeln (Windows)
✓ Backend .env MQTT-Konfiguration
✓ Verbindungs-Tests
```

**Dauer:** ~2-5 Minuten

**Nach der Installation:**

```bash
# MQTT testen
# Terminal 1:
mosquitto_sub -h localhost -t 'grow_monitoring/#' -v

# Terminal 2:
mosquitto_pub -h localhost -t 'grow_monitoring/test' -m 'Hello MQTT!'

# Backend neu starten (damit MQTT aktiviert wird)
cd backend
npm run dev
```

---

## Option 3: Docker Compose (Ultimative Automatisierung)

### Voraussetzungen

```bash
# Docker installieren
# Ubuntu/Debian:
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Neu anmelden!

# macOS/Windows:
# Docker Desktop von https://www.docker.com/products/docker-desktop
```

### Installation

```bash
# 1. Docker Compose starten
docker-compose up -d

# Fertig! Alles läuft!
```

**Services:**

```
✓ mosquitto:  MQTT Broker (Port 1883, 9001)
✓ backend:    Node.js Server (Port 3001)
✓ frontend:   React Dev Server (Port 3000)
```

**Vorteile:**

- Ein Befehl, alles läuft
- Keine lokale Node.js Installation nötig
- Isolierte Umgebung
- Einfaches Neu-Starten
- Automatische Netzwerk-Konfiguration

**Befehle:**

```bash
# Alle Services starten
docker-compose up -d

# Logs ansehen
docker-compose logs -f

# Nur Backend Logs
docker-compose logs -f backend

# Status prüfen
docker-compose ps

# Stoppen
docker-compose down

# Neu bauen und starten
docker-compose up -d --build

# Alles löschen (inkl. Daten!)
docker-compose down -v
```

**Zugriff:**

```
Frontend:     http://localhost:3000
Backend API:  http://localhost:3001
MQTT Broker:  mqtt://localhost:1883
WebSocket:    ws://localhost:9001
```

---

## Vergleich der Optionen

| Feature | Setup-Complete | Setup-MQTT | Docker Compose |
|---------|---------------|------------|----------------|
| **Benötigt Node.js lokal** | Ja | Ja | Nein |
| **Benötigt Docker** | Nein | Nein | Ja |
| **Installation Dauer** | 5-10 Min | 2-5 Min | 2-3 Min (+ Download) |
| **Schwierigkeit** | ⭐☆☆☆☆ | ⭐⭐☆☆☆ | ⭐⭐⭐☆☆ |
| **Ideal für** | Anfänger | MQTT-Update | Entwickler |
| **Automatisierung** | Hoch | Mittel | Sehr Hoch |
| **Isolierung** | Nein | Nein | Ja |

---

## Welche Option soll ich wählen?

### Wähle **Setup-Complete**, wenn:

```
✓ Du bist Anfänger
✓ Du kennst Docker nicht
✓ Du willst alles auf deinem System installiert haben
✓ Du willst später Code anpassen
```

### Wähle **Setup-MQTT**, wenn:

```
✓ Backend & Frontend laufen bereits
✓ Du willst nur MQTT hinzufügen
✓ Du willst Home Assistant Integration
```

### Wähle **Docker Compose**, wenn:

```
✓ Du kennst Docker
✓ Du willst schnellsten Start
✓ Du willst isolierte Umgebung
✓ Du entwickelst aktiv am Code
✓ Du willst einfach testen ohne System zu "verschmutzen"
```

---

## Automatisierte Tests

Alle Setup-Scripts führen automatisch Tests durch:

### Was wird getestet:

```
1. Node.js Installation & Version
2. npm Installation & Version
3. Backend Dependencies (node_modules vorhanden?)
4. Frontend Dependencies (node_modules vorhanden?)
5. Backend .env Datei (vorhanden & konfiguriert?)
6. Frontend .env Datei (vorhanden & konfiguriert?)
7. MQTT Broker Installation
8. MQTT Port 1883 (offen & erreichbar?)
9. MQTT Verbindung (Pub/Sub funktioniert?)
10. Backend MQTT Konfiguration
```

### Test-Logs:

Alle Scripts erstellen Log-Dateien:

```bash
# Setup-Complete
setup-YYYYMMDD_HHMMSS.log

# Bei Problemen:
cat setup-*.log | grep "ERROR"
cat setup-*.log | grep "WARN"
```

---

## Automatische Konfiguration

### Backend .env

**Automatisch generiert/konfiguriert:**

```env
# Port
PORT=3001

# JWT Secret (automatisch generiert, sicher!)
JWT_SECRET=[32-Zeichen Random String]

# CORS (Ihre IP)
CORS_ORIGIN=http://192.168.1.105:3000

# MQTT (wenn MQTT installiert)
MQTT_ENABLED=true
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_BASE_TOPIC=grow_monitoring
MQTT_HA_DISCOVERY=true
```

### Frontend .env

**Automatisch generiert:**

```env
# Backend URL (Ihre IP wird automatisch erkannt!)
REACT_APP_API_URL=http://192.168.1.105:3001
REACT_APP_WS_URL=ws://192.168.1.105:3001
```

### MQTT mosquitto.conf

**Automatisch erstellt:**

```conf
listener 1883
protocol mqtt
listener 9001
protocol websockets
allow_anonymous true
persistence true
log_dest file /var/log/mosquitto/mosquitto.log
```

---

## Rollback / Deinstallation

### Setup-Complete rückgängig machen

```bash
# 1. Services stoppen
# Strg+C im Backend & Frontend Terminal

# 2. MQTT deinstallieren
# Ubuntu/Debian:
sudo systemctl stop mosquitto
sudo apt remove mosquitto mosquitto-clients

# macOS:
brew services stop mosquitto
brew uninstall mosquitto

# 3. Dependencies entfernen (optional)
rm -rf backend/node_modules
rm -rf frontend/node_modules

# 4. .env Dateien löschen (optional)
rm backend/.env
rm frontend/.env

# 5. Datenbank löschen (optional)
rm -rf backend/data/
```

### Docker Compose stoppen

```bash
# Stoppen (Container + Network löschen)
docker-compose down

# Alles löschen (inkl. Volumes = Datenbank!)
docker-compose down -v

# Images auch löschen
docker-compose down --rmi all -v
```

---

## Fehlerbehandlung

### Setup-Script schlägt fehl

**Problem:** Node.js Installation fehlgeschlagen

```bash
# Lösung: Manuell installieren
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS:
brew install node

# Dann Script erneut ausführen
./setup-complete.sh
```

**Problem:** MQTT Installation fehlgeschlagen

```bash
# Lösung: Nur MQTT-Script verwenden
./setup-mqtt.sh

# Oder manuell:
sudo apt install mosquitto mosquitto-clients
```

**Problem:** "Permission denied"

```bash
# Script ist nicht ausführbar
chmod +x setup-complete.sh
chmod +x setup-mqtt.sh

# Oder ohne ausführbar machen:
bash setup-complete.sh
```

### Docker Compose Probleme

**Problem:** "Cannot connect to Docker daemon"

```bash
# Docker läuft nicht
sudo systemctl start docker

# Oder Docker Desktop starten (Windows/Mac)
```

**Problem:** Port 3001 already in use

```bash
# Anderen Service stoppt der Port nutzt
sudo lsof -i :3001
# Oder Port in docker-compose.yml ändern:
ports:
  - "3002:3001"  # Host:Container
```

**Problem:** "Build failed"

```bash
# Logs ansehen
docker-compose logs backend

# Neu bauen
docker-compose build --no-cache
docker-compose up -d
```

---

## Erweiterte Automatisierung

### Cronjob für Auto-Start (Raspberry Pi)

```bash
# Crontab bearbeiten
crontab -e

# Auto-Start nach Reboot
@reboot cd /home/pi/Grown_GrowMonitoring && ./start-all.sh
```

**start-all.sh erstellen:**

```bash
#!/bin/bash
cd backend
npm run dev &
cd ../frontend
npm start &
```

### PM2 für 24/7 Betrieb

```bash
# PM2 installieren
npm install -g pm2

# Backend mit PM2 starten
cd backend
pm2 start npm --name "grow-backend" -- run dev

# Auto-Start nach Reboot
pm2 startup
pm2 save
```

---

## Zusammenfassung

### Quick Commands

```bash
# Komplettes Setup (alles automatisch)
./setup-complete.sh

# Nur MQTT Setup
./setup-mqtt.sh          # Linux/Mac
.\setup-mqtt.ps1         # Windows

# Docker (alles in Containern)
docker-compose up -d

# Nach Setup: System starten
cd backend && npm run dev     # Terminal 1
cd frontend && npm start      # Terminal 2

# Testen
curl http://localhost:3001/api/health
```

### Checkliste nach Automatisierung

```
[ ] Setup-Script ohne Fehler durchgelaufen
[ ] Backend läuft (npm run dev)
[ ] Frontend läuft (npm start)
[ ] Browser öffnet http://localhost:3000
[ ] Login funktioniert (admin / Admin123!)
[ ] Dashboard zeigt Dummy-Daten
[ ] MQTT läuft (mosquitto Status prüfen)
[ ] Backend verbindet zu MQTT (Log prüfen)
```

**Wenn alle Checkboxen ✓ → System ist bereit für ESP32!**

---

## Support

Bei Problemen mit Automatisierung:

1. **Log-Dateien prüfen:** `setup-*.log`
2. **Script-Output lesen:** Fehler sind meist selbsterklärend
3. **GitHub Issue erstellen:** Mit Log-Datei anhängen
4. **Manuelle Installation:** COMPLETE_SETUP_GUIDE.md folgen

---

**Viel Erfolg mit der automatisierten Installation! 🚀**

*Letzte Aktualisierung: 2024-12-27*
*Version: 3.0.0*
