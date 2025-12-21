# 🚀 Quick Start Guide - Grow Monitoring System

## In 5 Minuten zum laufenden System!

### 1️⃣ Backend starten (Terminal 1)

```bash
cd backend
npm install
npm run dev
```

✓ Backend läuft auf http://localhost:3001

### 2️⃣ Frontend starten (Terminal 2)

```bash
cd frontend
npm install
npm start
```

✓ Frontend öffnet sich automatisch auf http://localhost:3000

### 3️⃣ Login

```
Username: admin
Password: Admin123!
```

### 4️⃣ ESP32 vorbereiten (optional)

Wenn Sie Hardware haben:

1. Öffnen Sie `esp32/GrowMonitor.ino` in Arduino IDE
2. Ändern Sie WiFi-Daten:
   ```cpp
   const char* ssid = "IHR_WIFI";
   const char* password = "IHR_PASSWORT";
   const char* serverIP = "192.168.1.XXX";  // IP Ihres PCs
   ```
3. Upload auf ESP32

## 📝 Erste Schritte im Dashboard

1. **Strain hinzufügen** (optional)
   - Name: z.B. "Northern Lights"
   - Typ: Indica/Sativa/Hybrid
   - Blütezeit: Wochen

2. **Pflanze hinzufügen**
   - Name: z.B. "Pflanze 1"
   - Sensor ID: 1
   - Phase: Vegetativ
   - Sorte: (optional wählen)

3. **Bewässerung einrichten**
   - Zur Irrigation-Seite
   - Pflanze wählen
   - Auto-Bewässerung aktivieren
   - Schwellwert: z.B. 30%
   - Dauer: z.B. 5 Sekunden

4. **Dashboard beobachten**
   - Live-Daten werden angezeigt
   - Diagramme aktualisieren sich automatisch

## 🔧 Schnell-Konfiguration

### Backend-Port ändern

`backend/.env`:
```env
PORT=3001  # Ändern Sie hier
```

### Frontend API-URL ändern

`frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001/ws
```

## 🐛 Probleme?

### Backend startet nicht
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

### Frontend startet nicht
```bash
cd frontend
rm -rf node_modules
npm install
npm start
```

### "Cannot connect to backend"
- Backend läuft?
- Port 3001 frei?
- Firewall?

## 📚 Nächste Schritte

- [Vollständige Dokumentation](README.md)
- [ESP32 Setup](esp32/README.md)
- [API Dokumentation](README.md#-api-endpunkte)

## 🎯 Test-Daten ohne Hardware

Wenn Sie keine ESP32-Hardware haben, können Sie die API direkt testen:

```bash
# Sensor-Daten senden (simuliert)
curl -X POST http://localhost:3001/api/sensors/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sensorId": 1, "moistureLevel": 45.5}'
```

Viel Erfolg! 🌱
