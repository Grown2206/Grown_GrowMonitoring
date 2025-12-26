# 💡 RJ11 GROWLICHT-STEUERUNG - KOMPLETTANLEITUNG

**Version:** 2.45.0
**Datum:** 26. Dezember 2024

---

## 📋 ÜBERSICHT

Diese Anleitung erklärt die **0-10V PWM Steuerung** für professionelle Growlichter über **RJ11-Stecker** (6P6C).

### Was ist 0-10V PWM?

- **Industrie-Standard** für LED-Dimmer
- **0V** = Licht AUS (0%)
- **10V** = Licht VOLL AN (100%)
- **5V** = 50% Helligkeit (linear)

### Warum RJ11?

✅ Standard-Anschluss bei vielen Growlights
✅ 6 Pins für Steuerung + Feedback
✅ Sichere Verbindung mit Clip
✅ Einfach zu verkabeln

---

## 🔌 RJ11 PINOUT (6P6C)

```
        Ansicht von vorne (Clip unten)

        ┌─────────────────┐
        │  1  2  3  4  5  6│
        │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ │
        │ │ │ │ │ │ │ │ │ │
        └─┴─┴─┴─┴─┴─┴─┴─┴─┘
```

| Pin | Farbe (Standard) | Funktion | ESP32/Modul | Spannung |
|-----|------------------|----------|-------------|----------|
| 1 | **ROT** | VCC+10V | Boost Converter OUT | 10V DC |
| 2 | **SCHWARZ** | GND | ESP32 GND | 0V |
| 3 | **GELB** | PWM 0-10V | MCP4725 DAC OUT | 0-10V |
| 4 | **WEISS** | FG (Frame Ground) | ESP32 GND (optional) | 0V |
| 5 | - | N.C. | Nicht verbunden | - |
| 6 | - | N.C. | Nicht verbunden | - |

---

## 🛠️ HARDWARE-AUFBAU

### Benötigte Komponenten

| # | Komponente | Zweck | Preis |
|---|------------|-------|-------|
| 1 | **MCP4725 DAC** | I2C → 0-5V Analog | ~8€ |
| 2 | **Boost Converter 5V→10V** | VCC+10V erzeugen | ~7€ |
| 3 | **RJ11 Buchse 6P6C** | Anschluss für Growlicht | ~3€ |
| 4 | **RJ11 Kabel 2m** | Verbindungskabel | ~4€ |
| 5 | **Op-Amp (optional)** | 0-5V → 0-10V verstärken | ~2€ |

**Gesamt:** ~24€

---

## 📐 SCHALTPLAN DETAILLIERT

### Variante 1: Mit Op-Amp (Empfohlen)

```
ESP32           MCP4725         Op-Amp          RJ11
────────        ────────        ──────          ────

GPIO21 (SDA)─── SDA
GPIO22 (SCL)─── SCL
3.3V ───────── VCC
GND ────────── GND
                    OUT ─────── IN+ ─────┐
                                         │
                                    ┌────┴────┐
                                    │  OpAmp  │
                                    │  2x Gain│
GND ────────────────────────────── IN- ───────┤
                                               │
                                          OUT ─┴──→ RJ11 Pin 3 (Gelb)
                                              0-10V PWM


Boost Conv.
────────────
GPIO25 (PWM)─── PWM IN (optional)
5V ──────────── VIN
GND ─────────── GND
               OUT ────────────────────────→ RJ11 Pin 1 (Rot)
                                            VCC+10V
```

### Variante 2: Ohne Op-Amp (Budget)

```
ESP32           MCP4725         Voltage Doubler    RJ11
────────        ────────        ────────────────   ────

GPIO21 (SDA)─── SDA
GPIO22 (SCL)─── SCL
5V ────────── VCC (WICHTIG: 5V statt 3.3V!)
GND ───────── GND
                  OUT ─────────── IN+ ────┐
                                          │
                                     ┌────┴────┐
                        10kΩ         │  Charge │
                        ┌───┐        │  Pump   │
                    IN─┤   ├─┐      │  Circuit│
                        └───┘ │      │         │
                        Cap   Cap    └─────────┘
                              │           │
                         GND──┴───────────┴──→ RJ11 Pin 3
                                              0-10V (approx)

ACHTUNG: Ungenauer als Op-Amp!
```

### Variante 3: Fertiges PWM-to-0-10V Modul (Einfachste)

```
ESP32           PWM-to-0-10V Modul         RJ11
────────        ──────────────────         ────

GPIO25 (PWM)─── PWM IN
5V ──────────── VCC
GND ─────────── GND
                      0-10V OUT ───────→ RJ11 Pin 3 (Gelb)

Amazon: "PWM to 0-10V Converter Module" (~15€)
Plug & Play! ✅
```

---

## 🔧 AUFBAU SCHRITT-FÜR-SCHRITT

### Schritt 1: MCP4725 DAC anschließen

```cpp
Verbindungen:
MCP4725 VCC  → ESP32 3.3V
MCP4725 GND  → ESP32 GND
MCP4725 SDA  → ESP32 GPIO21
MCP4725 SCL  → ESP32 GPIO22
```

Test-Code:
```cpp
#include <Adafruit_MCP4725.h>

Adafruit_MCP4725 dac;

void setup() {
  Serial.begin(115200);
  dac.begin(0x60);

  // Test: 50% Output (2.5V bei 5V VCC)
  dac.setVoltage(2048, false);
  Serial.println("DAC Output: 2.5V");
}
```

### Schritt 2: Op-Amp Schaltung

**TL071 oder LM358 Op-Amp:**

```
Schaltung (Non-Inverting Amplifier, Gain=2):

         R2 (10kΩ)
          ┌─────┐
MCP OUT ──┤     │
          │ +\  │
       R1 │   ├─┴──→ 0-10V OUT
 10kΩ ────┤ -/  │
          │ OpAmp
   GND ───┤     │
          └─────┘

Formel: Vout = Vin * (1 + R2/R1) = Vin * 2

Beispiel:
MCP OUT = 5V → Op-Amp OUT = 10V ✓
MCP OUT = 2.5V → Op-Amp OUT = 5V ✓
```

**Breadboard-Aufbau:**
1. Op-Amp in Breadboard stecken
2. Pin 4 (V-) an GND
3. Pin 8 (V+) an 12V (oder 10V vom Boost)
4. Pin 3 (+IN) an MCP4725 OUT
5. Pin 2 (-IN) über 10kΩ an GND
6. Pin 6 (OUT) über 10kΩ zurück an Pin 2
7. Pin 6 (OUT) ist 0-10V Signal

### Schritt 3: Boost Converter 5V→10V

```
Einstellung Boost Converter:
1. VIN an 5V, GND an GND
2. Multimeter an VOUT
3. Potentiometer drehen bis 10.0V
4. Fixieren mit Heißkleber
```

**Verkabelung:**
```
ESP32 5V ──→ Boost VIN
ESP32 GND ─→ Boost GND
Boost OUT ─→ RJ11 Pin 1 (VCC+10V)
```

### Schritt 4: RJ11 Buchse löten

**Vorbereitung:**
1. RJ11 Buchse mit Multimeter Pins durchmessen
2. Pin-Belegung notieren (kann variieren!)
3. Kabel abisolieren (je ~5mm)

**Löten:**
```
Buchse Pin 1 (Rot)    ← Boost Converter 10V OUT
Buchse Pin 2 (Schwarz)← ESP32 GND + Boost GND + MCP GND
Buchse Pin 3 (Gelb)   ← Op-Amp OUT (0-10V)
Buchse Pin 4 (Weiß)   ← ESP32 GND (optional)
```

**Isolieren:**
- Schrumpfschlauch über Lötstellen
- Heißkleber für mechanische Festigkeit

### Schritt 5: Test ohne Growlicht

```cpp
void testGrowlightSignal() {
  Serial.println("Testing 0-10V Signal...");

  // Mit Multimeter an RJ11 Pin 3 messen:

  Serial.println("0% → 0V");
  setGrowlightBrightness(0);
  delay(3000);

  Serial.println("25% → 2.5V");
  setGrowlightBrightness(25);
  delay(3000);

  Serial.println("50% → 5.0V");
  setGrowlightBrightness(50);
  delay(3000);

  Serial.println("75% → 7.5V");
  setGrowlightBrightness(75);
  delay(3000);

  Serial.println("100% → 10.0V");
  setGrowlightBrightness(100);
  delay(3000);
}
```

**Erwartete Werte am Multimeter:**
- 0% → 0.0V ±0.1V
- 25% → 2.5V ±0.2V
- 50% → 5.0V ±0.2V
- 75% → 7.5V ±0.2V
- 100% → 10.0V ±0.2V

### Schritt 6: Growlicht anschließen

1. **Growlicht TRENNEN** von 220V!
2. RJ11-Kabel vom ESP32 zu Growlicht stecken
3. Growlicht an 220V anschließen
4. ESP32 Firmware starten
5. Helligkeit über WebApp steuern

---

## 🧪 TROUBLESHOOTING

### Problem: Kein Signal (0V)

**Checks:**
```
☑ MCP4725 I2C Adresse korrekt? (0x60)
☑ I2C Scanner laufen lassen
☑ MCP4725 VCC = 3.3V oder 5V?
☑ GND verbunden?
☑ DAC Code läuft?
```

**Test:**
```cpp
Wire.begin(21, 22);
dac.begin(0x60);
dac.setVoltage(4095, false);  // Max Output
// Mit Multimeter an MCP OUT messen → sollte VCC sein
```

### Problem: Spannung zu niedrig (<10V)

**Ursachen:**
- Op-Amp VCC zu niedrig (min. 12V empfohlen)
- R1/R2 Widerstandsverhältnis falsch
- Boost Converter falsch eingestellt

**Fix:**
```
1. Boost Converter auf exakt 10.0V einstellen
2. Op-Amp VCC = 12V (nicht 5V!)
3. Widerstände prüfen (beide 10kΩ?)
```

### Problem: Growlicht reagiert nicht

**Checks:**
```
☑ Growlicht unterstützt 0-10V Dimming?
☑ RJ11 Pin-Belegung korrekt?
☑ VCC+10V vorhanden?
☑ GND verbunden?
☑ PWM Signal präsent?
```

**Growlicht-Kompatibilität:**
- **Kompatibel:** Mars Hydro, Spider Farmer, Lumatek, SANlight
- **NICHT kompatibel:** Billige Amazon-LEDs ohne Dimm-Eingang
- **Check:** Growlicht-Manual → "0-10V Dimming" oder "RJ11 Control"

### Problem: Flackern

**Ursachen:**
- PWM-Frequenz zu niedrig
- Schlechte GND-Verbindung
- Störungen auf Signal-Leitung

**Fix:**
```cpp
// MCP4725 Update-Rate reduzieren
if (millis() - lastUpdate > 1000) {  // nur 1x/Sekunde
  setGrowlightBrightness(brightness);
  lastUpdate = millis();
}

// Oder: Kondensator 100µF an RJ11 Pin 3 + GND
```

### Problem: Growlicht bleibt immer 100%

**Check:**
- Signal-Leitung vertauscht? (Pin 3 ↔ Pin 1)
- Growlicht auf "Manual Mode"?
- Pull-Up Widerstand intern?

**Test:**
```
RJ11 Pin 3 mit GND verbinden (kurzschließen)
→ Licht sollte auf 0% gehen
Wenn nicht: Growlicht-Problem
```

---

## 📊 GROWLICHT-ZEITPLAN (Firmware)

### Automatischer Betrieb

```cpp
// In Firmware anpassen:

GrowlightSchedule growlightSchedule = {
  .onHour = 6,      // 6:00 Uhr AN
  .offHour = 22,    // 22:00 Uhr AUS
  .brightness = 100, // 100% Helligkeit
  .autoMode = true   // Automatik aktiviert
};
```

### Über WebSocket steuern

**Manuell AN/AUS:**
```json
{
  "action": "growlight",
  "on": true,
  "brightness": 75
}
```

**Zeitplan setzen:**
```json
{
  "action": "growlight_schedule",
  "on_hour": 6,
  "off_hour": 22,
  "brightness": 100,
  "auto_mode": true
}
```

### Dimm-Kurven

**Linear (Standard):**
```
0% → 0V → Aus
50% → 5V → 50% Helligkeit
100% → 10V → Volle Helligkeit
```

**Logarithmisch (natürlicher):**
```cpp
// Für sanfteres Dimmen
float logBrightness(int percent) {
  return pow(percent / 100.0, 2) * 100;
}

// 50% Input → 25% Output (sanfter)
```

---

## ⚡ STROMVERBRAUCH

### Typische Werte

| Komponente | Stromaufnahme |
|------------|---------------|
| ESP32 | 100-250mA |
| MCP4725 | 0.4mA |
| Boost Converter (Idle) | 10-20mA |
| RJ11 Steuerleitung | <1mA |
| Op-Amp | 5-10mA |
| **GESAMT** | **~120-280mA @ 5V** |

**Wichtig:** Growlicht braucht eigene 220V Versorgung!

---

## 🔐 SICHERHEIT

### ⚠️ WARNUNGEN

```
❌ NIE 220V mit 12V/5V mischen!
❌ NIE RJ11 bei eingeschaltetem Growlicht ab-/anstecken!
❌ NIE Growlicht-Innenleben öffnen (Hochspannung!)
❌ NIE ohne Erdung betreiben!
```

### ✅ SICHER

```
✓ Galvanische Trennung (Growlicht hat eigenes Netzteil)
✓ Nur 0-10V Steuerleitung über RJ11
✓ ESP32 max. 3.3V/5V
✓ Alle GND verbunden
✓ FI-Schutzschalter für 220V
```

---

## 📝 CHECKLISTE

### Vor Inbetriebnahme

- [ ] MCP4725 DAC funktioniert (I2C Scanner)
- [ ] 0-5V Output messbar
- [ ] Op-Amp korrekt verdrahtet
- [ ] 0-10V Output messbar (ohne Growlicht)
- [ ] Boost Converter auf 10V eingestellt
- [ ] RJ11 Pins korrekt verlötet
- [ ] Alle GND verbunden
- [ ] Firmware kompiliert & geflasht
- [ ] Serial Monitor zeigt Daten
- [ ] WebSocket verbunden
- [ ] Growlicht 220V getrennt
- [ ] RJ11 Kabel eingesteckt
- [ ] Growlicht 220V angeschlossen
- [ ] Test mit 0%, 50%, 100%
- [ ] Funktioniert! 🎉

---

## 🎓 ERWEITERTE FEATURES

### PWM-Frequenz anpassen

```cpp
// Für empfindliche Growlichter
ledcSetup(0, 1000, 10);  // 1kHz, 10-bit
ledcAttachPin(BOOST_PWM_PIN, 0);
ledcWrite(0, 512);  // 50%
```

### Sunrise/Sunset Simulation

```cpp
void simulateSunrise() {
  for (int i = 0; i <= 100; i += 5) {
    setGrowlightBrightness(i);
    delay(60000);  // 1 Minute pro Step = 20min gesamt
  }
}
```

### DLI (Daily Light Integral) Tracking

```cpp
// Gesamte Lichtmenge pro Tag
float dli = 0;  // mol/m²/day

void updateDLI() {
  float currentPAR = sensors.par;  // µmol/m²/s
  float seconds = SENSOR_INTERVAL / 1000.0;

  dli += (currentPAR * seconds) / 1000000.0;  // Convert to mol
}
```

---

## 🔗 WEITERFÜHRENDE LINKS

- [MCP4725 Datasheet](https://www.microchip.com/en-us/product/MCP4725)
- [0-10V Dimming Standard](https://en.wikipedia.org/wiki/0%E2%80%9310_V_lighting_control)
- [Op-Amp Calculator](https://www.ti.com/tool/ANALOG-FILTER-WIZARD)
- [PAR vs Lux](https://www.apogeeinstruments.com/conversion-ppf-to-lux/)

---

**Happy Growing! 🌱**

**Support:** GitHub Issues | Discord | Wiki
**Version:** 2.45.0
**Lizenz:** MIT
