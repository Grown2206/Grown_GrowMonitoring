# 🌱 Grow Monitoring System v2.30.0

Ein vollständiges IoT-System zur Überwachung und Steuerung von Pflanzenzucht-Anlagen mit ESP32-Hardware, Web-Interface und Echtzeit-Datenübertragung.

![Version](https://img.shields.io/badge/version-2.30.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Features

### Echtzeit-Überwachung
- **Live Sensor-Daten**: Bodenfeuchtigkeit, Temperatur, Luftfeuchtigkeit, Wassertank-Level
- **WebSocket-Integration**: Echtzeit-Updates im Dashboard (1-Sekunden-Takt)
- **Historische Daten**: Diagramme und Trend-Analysen

### Pflanzenverwaltung
- Individuelle Pflanzen-Profile mit Sorteninformationen
- Wachstumsphasen-Tracking (Keimung → Vegetation → Blüte → Ernte)
- Strain-Datenbank (Indica/Sativa/Hybrid)
- Notizen und Kalender für Events

### Automatische Bewässerung
- Schwellwert-basierte Auto-Bewässerung
- Konfigurierbare Pumpendauer und Cooldown
- Manuelle Bewässerungssteuerung
- Event-Logging

### Gerätesteuerung
- Relais-Steuerung (Licht, Lüftung, Pumpen)
- Zeitgesteuerte Automation
- Remote-Kontrolle via Web-Interface

### Alert-System
- E-Mail-Benachrichtigungen
- Webhook-Integration
- Konfigurierbare Bedingungen (Tank-Level, Feuchtigkeit, Nährstoffe)

### Sicherheit
- JWT-basierte Authentifizierung
- API-Key System
- Rate Limiting
- Bcrypt Passwort-Hashing

## 🛠️ Technologie-Stack

### Backend
- **Node.js** + Express
- **TypeScript**
- **Sequelize** (SQLite Datenbank)
- **WebSocket** (ws library)
- **JWT** für Authentication

### Frontend
- **React 18** + TypeScript
- **Material-UI** (MUI v5)
- **Recharts** für Diagramme
- **React Router** für Navigation

### Hardware
- **ESP32** Microcontroller
- **Kapazitive Bodenfeuchtesensoren**
- **DHT22** Temperatur/Luftfeuchtigkeit
- **Relais-Module** für Pumpen/Geräte

## 📦 Installation

### Voraussetzungen
- Node.js 16+ und npm
- Git
- Arduino IDE (für ESP32-Programmierung)

### Backend Setup

```bash
cd backend
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env
# Bearbeiten Sie .env mit Ihren Einstellungen

# Datenbank initialisieren und Server starten
npm run dev
```

Der Backend-Server läuft auf **http://localhost:3001**

### Frontend Setup

```bash
cd frontend
npm install

# Umgebungsvariablen konfigurieren
# .env ist bereits erstellt mit Standardwerten

# Entwicklungsserver starten
npm start
```

Das Frontend läuft auf **http://localhost:3000**

### ESP32 Setup

1. Öffnen Sie `esp32/GrowMonitor.ino` in der Arduino IDE
2. Installieren Sie erforderliche Bibliotheken (siehe [esp32/README.md](esp32/README.md))
3. Konfigurieren Sie WiFi und Server-IP im Code
4. Upload auf ESP32

Detaillierte Anleitung: [ESP32 README](esp32/README.md)

## 🚀 Verwendung

### Erster Start

1. **Backend starten**: `cd backend && npm run dev`
2. **Frontend starten**: `cd frontend && npm start`
3. **Browser öffnen**: http://localhost:3000

### Standard-Login
```
Username: admin
Password: Admin123!
```

**⚠️ WICHTIG**: Ändern Sie das Admin-Passwort nach dem ersten Login!

### Workflow

1. **Strains anlegen**: Definieren Sie Sorten (optional)
2. **Pflanzen hinzufügen**: Name, Sensor-ID, Phase, Sorte
3. **Bewässerung konfigurieren**: Auto-Bewässerung für jede Pflanze
4. **Dashboard überwachen**: Live-Daten und Diagramme
5. **Alerts einrichten**: Benachrichtigungen bei kritischen Werten

## 📁 Projektstruktur

```
Grown_GrowMonitoring/
├── backend/                 # Node.js Backend
│   ├── src/
│   │   ├── models/         # Datenbank-Modelle
│   │   ├── routes/         # API-Endpunkte
│   │   ├── services/       # Business Logic
│   │   ├── middleware/     # Auth, Validation
│   │   ├── websocket/      # WebSocket-Server
│   │   └── server.ts       # Main Server
│   ├── package.json
│   └── .env
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # UI-Komponenten
│   │   ├── pages/         # Seiten (Dashboard, Plants, etc.)
│   │   ├── services/      # API & WebSocket Services
│   │   ├── contexts/      # React Contexts
│   │   └── App.tsx
│   └── package.json
│
├── esp32/                 # ESP32 Firmware
│   ├── GrowMonitor.ino   # Arduino Sketch
│   └── README.md
│
└── README.md
```

## 🔌 API-Endpunkte

### Authentication
```
POST   /api/auth/register      - Benutzer registrieren
POST   /api/auth/login         - Login
GET    /api/auth/me            - Aktueller Benutzer
POST   /api/auth/change-password
GET    /api/auth/api-keys      - API Keys verwalten
```

### Plants & Strains
```
GET    /api/plants             - Alle Pflanzen
POST   /api/plants             - Pflanze erstellen
GET    /api/strains            - Alle Sorten
```

### Sensors
```
GET    /api/sensors/latest     - Neueste Sensordaten
GET    /api/sensors/history    - Historische Daten
GET    /api/sensors/status     - Status aller Pflanzen
```

### Irrigation
```
GET    /api/irrigation/config  - Bewässerungs-Konfigurationen
POST   /api/irrigation/config  - Konfiguration speichern
POST   /api/irrigation/manual  - Manuelle Bewässerung
GET    /api/irrigation/history - Bewässerungs-Historie
```

### Relays & Controls
```
GET    /api/relays             - Alle Relais
POST   /api/relays/:id/control - Relais steuern
```

### Alerts, Notes, Events
```
GET/POST/PUT/DELETE   /api/alerts
GET/POST/PUT/DELETE   /api/notes
GET/POST/PUT/DELETE   /api/events
```

### Export
```
GET    /api/export/sensor-data  - Sensor-Daten exportieren
GET    /api/export/plants       - Pflanzen exportieren
GET    /api/export/full-backup  - Vollständiges Backup
```

## 🔐 Sicherheit

- **JWT-Tokens**: 7 Tage Gültigkeit
- **Bcrypt**: Passwort-Hashing mit 10 Runden
- **Rate Limiting**: 100 Requests/15min (API), 5 Requests/15min (Auth)
- **CORS**: Konfigurierbar via Environment Variable
- **Helmet**: Security Headers
- **Input Validation**: Joi-Schema Validierung

## 🎨 Screenshots & Features

### Dashboard
- Live-Karten mit aktuellen Werten
- Echtzeit-Diagramme (Recharts)
- Pflanzen-Status Übersicht
- Geräte-Status

### Pflanzen-Verwaltung
- Übersichtliche Karten-Ansicht
- CRUD-Operationen
- Strain-Zuordnung
- Wachstumsphasen

### Bewässerung
- Manuelle Steuerung
- Auto-Bewässerung Konfiguration
- Historie-Tabelle

## 🔧 Konfiguration

### Backend (.env)
```env
PORT=3001
JWT_SECRET=your-secret-key
DB_PATH=./data/grow-monitoring.db
CORS_ORIGIN=http://localhost:3000

# Optional: SMTP für E-Mail-Alerts
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001/ws
```

### ESP32
```cpp
const char* ssid = "YOUR_WIFI";
const char* password = "PASSWORD";
const char* serverIP = "192.168.1.100";
```

## 📊 Datenbank-Schema

- **users** - Benutzer und Authentifizierung
- **api_keys** - API-Schlüssel
- **strains** - Pflanzensorten
- **plants** - Pflanzen-Instanzen
- **sensor_data** - Sensor-Messwerte
- **relays** - Relais/Geräte
- **irrigation_configs** - Auto-Bewässerung Konfiguration
- **irrigation_logs** - Bewässerungs-Events
- **alerts** - Alert-Konfigurationen
- **notes** - Notizen
- **calendar_events** - Kalender-Events

## 🐛 Fehlerbehebung

### Backend startet nicht
- Prüfen Sie Node.js Version (16+)
- `npm install` erneut ausführen
- Prüfen Sie .env Datei

### Frontend verbindet nicht
- Backend muss laufen
- CORS-Einstellungen prüfen
- WebSocket-URL in .env prüfen

### ESP32 sendet keine Daten
- WebSocket-Verbindung prüfen
- Server-IP korrekt?
- Serieller Monitor prüfen (115200 Baud)

## 🚀 Produktions-Deployment

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
npm run build
# Serve build/ Ordner mit nginx/apache
```

### Empfehlungen
- Verwenden Sie PostgreSQL statt SQLite
- Setzen Sie sichere JWT_SECRET
- Aktivieren Sie HTTPS
- Konfigurieren Sie Reverse Proxy (nginx)
- Setzen Sie NODE_ENV=production

## 📝 Lizenz

MIT License - Frei verwendbar für private und kommerzielle Projekte

## 🤝 Support

Bei Fragen oder Problemen:
1. Prüfen Sie die README-Dateien
2. Schauen Sie in die Code-Kommentare
3. Öffnen Sie ein GitHub Issue

## 🎯 Roadmap

- [ ] Mobile App (React Native)
- [ ] Kamera-Integration
- [ ] ML-basierte Krankheitserkennung
- [ ] Multi-Raum Support
- [ ] Cloud-Synchronisation
- [ ] Erweiterte Analytics

## ⭐ Credits

Entwickelt mit ❤️ für die Grow-Community

**Version**: 1.1.0
**Datum**: 2024
**Status**: Production Ready
