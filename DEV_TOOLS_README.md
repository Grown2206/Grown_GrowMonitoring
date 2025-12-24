# 🛠️ Developer Tools - Testdaten-Generator

## Problem gelöst ✅

Das Problem war, dass die **Datenbank das alte Schema** hatte und die neue `deviceId`-Spalte in der `sensors`-Tabelle fehlte.

## Lösung

Die Datenbank wurde zurückgesetzt und mit dem neuen Schema neu erstellt.

## 🚀 Verwendung

### 1. Datenbank zurücksetzen (wenn nötig)

Wenn du Probleme mit dem Schema hast, führe aus:

```bash
cd backend
npm run db:reset
```

Dies wird:
- ✅ Alle Tabellen löschen
- ✅ Neue Tabellen mit korrektem Schema erstellen
- ✅ Admin-User erstellen (admin / admin123)

### 2. Backend starten (Development Mode)

```bash
cd backend
npm run dev
```

**Wichtig:** Das Backend muss im Development-Modus laufen, damit die Dev-Routes verfügbar sind!

### 3. Frontend starten

```bash
cd frontend
npm start
```

### 4. Testdaten generieren

1. **Öffne die Anwendung** im Browser (http://localhost:3000)
2. **Login** mit:
   - Username: `admin`
   - Password: `admin123`
3. **Gehe zu Settings** (Einstellungen)
4. **Klicke auf den Tab "Developer Tools"** (ganz rechts)
5. **Wähle einen Modus:**

#### Schnelle Demo 🚀
- 2 Strains
- 3 aktive Pflanzen
- 2 abgeschlossene Grows
- 30 Tage Sensordaten
- **Perfekt zum schnellen Testen**

#### Vollständige Testdaten 🔬
- 5 Strains (Northern Lights, Sour Diesel, Blue Dream, OG Kush, White Widow)
- 8 aktive Pflanzen
- 5 abgeschlossene Grows mit Ernten
- 120 Tage historische Sensordaten
- **Löscht existierende Daten zuerst!**

#### Benutzerdefiniert ⚙️
- Konfigurierbare Parameter
- Optional: Existierende Daten löschen

## 📊 Generierte Daten

Die Testdaten enthalten:

### Realistische Sensordaten
- **12 Sensor-Typen**: Temperature, Humidity, Moisture, CO2, PAR, pH, EC, TDS, VOC, PM2.5, Light, Water Level
- **Phasenspezifische Werte**:
  - Germination: 20-25°C, 70-80% Humidity
  - Seedling: 22-26°C, 60-70% Humidity
  - Vegetative: 24-28°C, 50-70% Humidity
  - Flowering: 20-26°C, 40-50% Humidity
- **Tag/Nacht-Zyklen** für Bodenfeuchtigkeit
- **Lichtzyklus** (PAR nur während Lichtperiode)

### Pflanzen & Grows
- **Verschiedene Wachstumsphasen**: Germination, Seedling, Vegetative, Flowering, Harvested
- **Vollständige Historie** für abgeschlossene Grows
- **Realistische Ernten**: 80-200g wet weight, 20-25% dry weight
- **Qualitätsbewertungen**: Excellent, Good, Average

### Zusätzliche Daten
- **Notizen**: Phasenspezifische Grow-Notizen
- **Events**: Phasenwechsel und wichtige Ereignisse
- **Devices**: ESP32/ESP8266 Test-Geräte
- **Strains**: 5 bekannte Cannabis-Sorten mit THC/CBD-Werten

## 🔧 Nützliche Befehle

```bash
# Datenbank zurücksetzen
npm run db:reset

# Testdaten direkt über CLI generieren (Quick Demo)
npm run seed:test

# Backend im Dev-Mode starten
npm run dev

# Build checken
npm run build
```

## 🔒 Sicherheit

- ✅ Nur im **Development-Modus** verfügbar
- ✅ In Production automatisch deaktiviert
- ✅ Authentifizierung erforderlich
- ✅ Doppelte Bestätigung beim Löschen

## 🐛 Troubleshooting

### "Development routes are disabled"
- ✅ Backend im Development-Mode starten: `npm run dev`
- ✅ Oder setze `ENABLE_DEV_ROUTES=true` in `.env`

### "SQLITE_ERROR: table X has no column Y"
- ✅ Datenbank zurücksetzen: `npm run db:reset`
- ✅ Neustart des Backends

### "Failed to generate test data"
- ✅ Überprüfe Backend-Konsole auf Fehler
- ✅ Stelle sicher, dass die Datenbank verbunden ist
- ✅ Versuche `npm run db:reset`

### Keine Daten in der UI
- ✅ Überprüfe Browser-Konsole (F12)
- ✅ Überprüfe Backend-Logs
- ✅ Stelle sicher, dass Backend läuft
- ✅ Überprüfe, dass du eingeloggt bist

## 📝 Hinweise

- Die generierten Daten sind **rein für Testing/Development**
- Alle Daten sind **fiktiv und zufällig**
- Strain-Informationen basieren auf bekannten Sorten, sind aber nicht exakt
- Sensordaten sind **realistisch simuliert** aber nicht von echten Sensoren

## ✨ Viel Spaß beim Testen!

Jetzt kannst du alle Features der Anwendung mit realistischen Daten testen:
- ✅ Analytics & Charts mit echten Verläufen
- ✅ Vergleiche zwischen Grows
- ✅ Report-Generierung
- ✅ Alarm-Testing
- ✅ Alle UI-Komponenten mit echten Daten
