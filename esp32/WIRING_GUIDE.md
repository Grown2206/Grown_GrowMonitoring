# 🔌 Wiring Guide - ESP32 Grow Monitoring System

## Inhaltsverzeichnis
1. [Basis-Setup](#basis-setup)
2. [I2C Sensoren](#i2c-sensoren)
3. [UART Sensoren](#uart-sensoren)
4. [Analog Sensoren](#analog-sensoren)
5. [Relais & Pumpen](#relais--pumpen)
6. [Komplettes Setup](#komplettes-setup)
7. [Tipps & Tricks](#tipps--tricks)

---

## Basis-Setup

### ESP32 + DHT22 + 4x Bodenfeuchtigkeit + Wasserstand

```
                              ESP32 DevKit
                       ┌────────────────────┐
                       │                    │
    DHT22              │ GPIO 4    ○○○ 3.3V├──┐
    ┌────┐            │ GPIO 5             │  │ (I2C Pull-ups)
    │ S  ├────────────┤ GPIO 18            │  │   ┌───┤>├───┐
    │ +  ├────────────┤ 3.3V               │  └───┤ 4.7kΩ  │
    │ -  ├────────────┤ GND                │      │         │
    └────┘            │                    │      └─────────┼── SDA (GPIO 21)
                       │ GPIO 21 (SDA) ○───┼──────────────┼── SCL (GPIO 22)
  Moisture 1           │ GPIO 22 (SCL) ○───┘              │
  ┌────┐            │                    │              │
  │ S  ├────────────┤ GPIO 34            │              │
  │ +  ├────────────┤ 3.3V               │              │
  │ -  ├────────────┤ GND                │              │
  └────┘            │                    │              │
                       │ GPIO 35 ○──────────┤              │
  Moisture 2           │ GPIO 36 ○──────────┤              │
  ┌────┐            │ GPIO 39 ○──────────┤              │
  │ S  ├────────────┘                    │              │
  │ +  ├────────────── 3.3V                              │
  │ -  ├────────────── GND                               │
  └────┘                                                 │
                                                           │
  Water Level                                              │
  ┌────┐                                                 │
  │ S  ├────────────── GPIO 32                             │
  │ +  ├────────────── 3.3V                              │
  │ -  ├────────────── GND ────────────────────────────┘
  └────┘

```

**Pin-Liste:**
| Sensor | ESP32 Pin | VCC | GND |
|--------|-----------|-----|-----|
| DHT22 | GPIO 4 | 3.3V | GND |
| Moisture 1 | GPIO 34 | 3.3V | GND |
| Moisture 2 | GPIO 35 | 3.3V | GND |
| Moisture 3 | GPIO 36 | 3.3V | GND |
| Moisture 4 | GPIO 39 | 3.3V | GND |
| Water Level | GPIO 32 | 3.3V | GND |

---

## I2C Sensoren

### Mehrere I2C Sensoren am selben Bus

```
                       ESP32
                  ┌──────────┐
                  │ SDA (21) ├──────┬──────┬──────┬──────┐
                  │ SCL (22) ├────┐ │    │ │    │ │    │ │
                  │ 3.3V     ├──┐ │ │    │ │    │ │    │ │
                  │ GND      ├┐ │ │ │    │ │    │ │    │ │
                  └──────────┘│ │ │ │    │ │    │ │    │ │
                               │ │ │ │    │ │    │ │    │ │
                     ┌─────────┤ │ │ │    │ │    │ │    │ │
                     │  ┌────────┤ │ │    │ │    │ │    │ │
                     │  │  ┌─────┼─┼─┼────┼─┼────┼─┼────┼─┘
                     │  │  │     │ │ │    │ │    │ │    │
                  ┌──┴──┴──┴──┐  │ │ │    │ │    │ │    │
                  │ BH1750    │  │ │ │    │ │    │ │    │
                  │ SDA SCL   │  │ │ │    │ │    │ │    │
                  │ VCC GND   │  │ │ │    │ │    │ │    │
                  └───────────┘  │ │ │    │ │    │ │    │
                  ┌──────────────┴─┴─┴┐   │ │    │ │    │
                  │ SCD30            │   │ │    │ │    │
                  │ SDA SCL          │   │ │    │ │    │
                  │ VCC GND          │   │ │    │ │    │
                  └──────────────────┘   │ │    │ │    │
                  ┌──────────────────────┴─┴┐   │ │    │
                  │ SGP30                  │   │ │    │
                  │ SDA SCL                │   │ │    │
                  │ VCC GND                │   │ │    │
                  └────────────────────────┘   │ │    │
                  ┌──────────────────────────────┴┐   │
                  │ VEML7700                      │   │
                  │ SDA SCL                       │   │
                  │ VCC GND                       │   │
                  └───────────────────────────────┘   │
                  ┌────────────────────────────────────┘
                  │ BME680
                  │ SDA SCL
                  │ VCC GND
                  └────────────────────────────────────
```

**Wichtig:**
- **Alle I2C Sensoren teilen sich SDA und SCL!**
- Pull-up Widerstände (4.7kΩ) meist auf Sensor-Board vorhanden
- Falls nicht: Externe 4.7kΩ von SDA→3.3V und SCL→3.3V
- **Gemeinsames GND** für alle Geräte!
- Max. 10-15 Geräte am I2C Bus

**I2C Adressen:**
| Sensor | Standard-Adresse | Alternative |
|--------|------------------|-------------|
| BH1750 | 0x23 | 0x5C |
| SCD30 | 0x61 | - |
| SGP30 | 0x58 | - |
| CCS811 | 0x5A | 0x5B |
| VEML7700 | 0x10 | - |
| BME680 | 0x77 | 0x76 |
| ADS1115 | 0x48 | 0x49-0x4B |

---

## UART Sensoren

### MH-Z19B CO2 Sensor

```
                   ESP32                      MH-Z19B
              ┌──────────┐                 ┌──────────┐
              │          │                 │          │
              │ RX (16)  ├─────────────────┤ TX       │
              │ TX (17)  ├─────────────────┤ RX       │
              │ 5V       ├─────────────────┤ VCC (5V) │
              │ GND      ├─────────────────┤ GND      │
              │          │                 │          │
              └──────────┘                 └──────────┘
```

**Wichtig:**
- **ESP32 RX → Sensor TX** (gekreuzt!)
- **ESP32 TX → Sensor RX** (gekreuzt!)
- MH-Z19B benötigt 5V (nicht 3.3V!)
- Baud Rate: 9600

### PMS5003 PM2.5 Sensor

```
                   ESP32                      PMS5003
              ┌──────────┐                 ┌──────────┐
              │          │      Weiß       │          │
              │ RX (16)  ├─────[  ]────────┤ TX       │
              │ TX (17)  ├─────[  ]────────┤ RX       │
              │ 5V       ├─────[  ]────────┤ VCC      │ (Pin 1)
              │ GND      ├─────[  ]────────┤ GND      │ (Pin 2)
              │          │      Grün                  │
              └──────────┘                            │
                            Optional:                  │
                 GPIO 25 ├────────────────────SET     │
                 GPIO 26 ├────────────────────RESET   │
                            Gelb             └──────────┘

```

**Pin-Out PMS5003 (10-Pin Connector):**
```
1: VCC (5V)      6: NC
2: GND           7: NC
3: SET           8: NC
4: RX            9: NC
5: TX           10: RESET
```

**Wichtig:**
- VCC: 5V (4.5-5.5V)
- SET: HIGH=aktiv, LOW=Sleep
- RESET: LOW=Reset, HIGH=Normal
- Baud Rate: 9600

---

## Analog Sensoren

### pH Sensor (DFRobot oder ähnlich)

```
                   ESP32                    pH Sensor
              ┌──────────┐                 ┌──────────┐
              │          │                 │          │
              │ GPIO 34  ├─────────────────┤ Signal   │
              │ 5V       ├─────────────────┤ VCC (5V) │
              │ GND      ├─────────────────┤ GND      │
              │          │                 │          │
              └──────────┘                 └──────────┘

WARNUNG: pH Sensor gibt oft 0-5V aus!
ESP32 verträgt nur 0-3.3V!

Lösung: Spannungsteiler

pH Sensor          Spannungsteiler          ESP32
┌────┐                                   ┌────────┐
│ Po ├───┬───[10kΩ]───┬──────────────────┤ GPIO34 │
│ +  ├───┤            │                  │        │
│ -  ├─┐ └───[20kΩ]───┴───┐              │        │
└────┘ │                   │              │        │
       └───────────────────┴──────────────┤ GND    │
                                           └────────┘

Formel: Vout = Vin * (R2 / (R1 + R2))
        Vout = 5V * (20kΩ / 30kΩ) = 3.33V ✓
```

### TDS / EC Sensor

```
Gleiche Verkabelung wie pH Sensor:
- Signal → GPIO 35 (mit Spannungsteiler falls 5V!)
- VCC → 5V
- GND → GND
```

### GP2Y1010 Staub-Sensor (Sharp)

```
                   ESP32                   GP2Y1010AU0F
              ┌──────────┐                 ┌──────────┐
              │ GPIO 34  ├─────────────────┤ Vo (Pin 5)
              │ GPIO 25  ├────┬────────────┤ LED (Pin 3)
              │ 5V       ├────┼────[150Ω]──┘
              │ GND      ├────┴────┬───────┤ GND (Pin 1,2)
              │          │         │       │
              └──────────┘         │       │ VCC (Pin 6)
                                    │       └──────────┘
                              [220µF]
                                    │
                                   GND

Pin-Out GP2Y1010 (6 Pins):
┌─┬─┬─┬─┬─┬─┐
│1│2│3│4│5│6│
└─┴─┴─┴─┴─┴─┘
 G G L NC V V
 N N E   o C
 D D D   u C
         t

1: GND
2: GND
3: LED
4: NC (Notconnected)
5: Vout
6: VCC (5V)
```

**Wichtig:**
- 150Ω Widerstand zwischen LED-Pin und 5V
- 220µF Kondensator zwischen VCC und GND
- Pulse-Timing im Code erforderlich!

---

## Relais & Pumpen

### 4-Kanal Relais-Modul

```
                   ESP32                    Relais-Modul
              ┌──────────┐                 ┌──────────────┐
              │ GPIO 18  ├─────────────────┤ IN1          │
              │ GPIO 19  ├─────────────────┤ IN2          │
              │ GPIO 23  ├─────────────────┤ IN3          │
              │ GPIO 5   ├─────────────────┤ IN4          │
              │          │                 │              │
              │ GND      ├─────────────────┤ GND          │
              │          │                 │              │
              └──────────┘                 │ VCC ○ JD-VCC │
                                            └──┬───────┬───┘
                  ┌─ 5V Netzteil (1A)────────┘       │
                  │                                    │
                Jumper:                                │
                  - Jumper ON: ESP32 3.3V → VCC        │
                  - Jumper OFF: Externe 5V → VCC      │
                                (empfohlen!)            │
                                                        │
                                        Pumpen-Power    │
                                      12V Netzteil (2A)─┘

Relais-Ausgänge (Beispiel Pumpe 1):
                 ┌─────────────┐
       12V+ ─────┤ COM         │
                 │     NO      ├──── Pumpe + ───┐
                 │     NC      │                 │
                 └─────────────┘          ┌──────┴──────┐
                                           │  12V Pumpe  │
       12V- ──────────────────────────────┤             │
                                           └─────────────┘

COM = Common (12V+)
NO = Normally Open (wird bei HIGH geschlossen)
NC = Normally Closed (wird bei HIGH geöffnet)

Für Pumpen: COM + NO verwenden!
```

**WICHTIG - Relais-Logik:**
- **LOW-Level Trigger**: Relais ON bei GPIO = LOW (0V)
- **HIGH-Level Trigger**: Relais ON bei GPIO = HIGH (3.3V)

Meisten Relais-Module verwenden LOW-Level Trigger:
```cpp
digitalWrite(RELAY_PIN, LOW);   // Relais AN
digitalWrite(RELAY_PIN, HIGH);  // Relais AUS
```

Falls HIGH-Level Trigger:
```cpp
digitalWrite(RELAY_PIN, HIGH);  // Relais AN
digitalWrite(RELAY_PIN, LOW);   // Relais AUS
```

**Sicherheitshinweise:**
- ⚠️ Niemals Pumpen direkt an ESP32!
- ⚠️ Separate Stromversorgung für Relais (5V, 1A)
- ⚠️ Separate Stromversorgung für Pumpen (12V, 2A+)
- ⚠️ Gemeinsames GND für ESP32, Relais, und Netzteile
- ⚠️ Relais-Rating prüfen (meist 10A bei 250V AC / 30V DC)

---

## Komplettes Setup

### All-in-One: ESP32 + Alle Sensoren

```
                          ╔═══════════════════════════╗
                          ║     ESP32 DevKit V1       ║
                          ║                           ║
I2C Bus:                  ║  SDA (21) ○ ○ SCL (22)    ║ ← BH1750, SCD30, SGP30
                          ║                           ║
UART (Serial2):           ║  RX (16)  ○ ○ TX (17)     ║ ← MH-Z19B ODER PMS5003
                          ║                           ║
Analog Sensors:           ║  GPIO 34  ○               ║ ← Moisture 1 / pH
                          ║  GPIO 35  ○               ║ ← Moisture 2 / TDS
                          ║  GPIO 36  ○               ║ ← Moisture 3 / EC
                          ║  GPIO 39  ○               ║ ← Moisture 4 / LDR
                          ║  GPIO 32  ○               ║ ← Water Level
                          ║  GPIO 33  ○               ║ ← MQ-135 / Dust
                          ║                           ║
Digital (DHT22):          ║  GPIO 4   ○               ║ ← DHT22 Data
                          ║                           ║
Digital Outputs:          ║  GPIO 18  ○               ║ ← Relay 1
                          ║  GPIO 19  ○               ║ ← Relay 2
                          ║  GPIO 23  ○               ║ ← Relay 3
                          ║  GPIO 5   ○               ║ ← Relay 4
                          ║  GPIO 25  ○               ║ ← Relay 5 / LED Control
                          ║                           ║
Power:                    ║  VIN      ○               ║ ← 5V External (optional)
                          ║  3.3V     ○               ║ ← 3.3V Output (max 200mA)
                          ║  GND      ○ ○ ○ ○ ○       ║ ← Common Ground
                          ╚═══════════════════════════╝
```

### Power Distribution

```
                        Stromversorgung
                        ===============

USB Power (5V, 500mA):
┌──────────┐
│ USB Port ├─────┬──── ESP32 (VIN)
└──────────┘     │
                  └──── Kleine I2C Sensoren (3.3V via ESP32)

Für größere Setups:

5V Netzteil (2A):
┌──────────┐
│ 5V 2A    ├─────┬──── ESP32 (VIN)
│ Netzteil │     ├──── Relais-Modul (VCC)
└──────────┘     ├──── MH-Z19B (5V)
                  ├──── PMS5003 (5V)
                  ├──── pH Sensor (5V)
                  └──── TDS Sensor (5V)

12V Netzteil (2A):
┌──────────┐
│ 12V 2A   ├─────┬──── Pumpe 1 (via Relais)
│ Netzteil │     ├──── Pumpe 2 (via Relais)
└──────────┘     ├──── Licht (via Relais)
                  └──── Ventilator (via Relais)

⚠️ WICHTIG: Alle GND gemeinsam verbinden!
```

---

## Tipps & Tricks

### 1. Pin-Konflikte vermeiden

**Problem:** GPIO 16/17 für Serial2 UND Relais?

**Lösung:**
```
Option A: UART-Sensoren nutzen → GPIO 16/17 für Serial2 → Relais auf andere Pins
  Relais: GPIO 18, 19, 23, 5, 25, 26, 27

Option B: Keine UART-Sensoren → GPIO 16/17 für Relais → I2C Alternativen nutzen
  Statt MH-Z19B: SCD30 (I2C)
  Statt PMS5003: GP2Y1010 (Analog)
```

### 2. Nicht genug Analog-Pins?

**Lösung 1: I2C ADC (ADS1115)**
```
ADS1115 16-bit ADC
  - 4x Analog Inputs
  - I2C Interface
  - Bessere Genauigkeit als ESP32 ADC
  - ~5-10€

Verbindung:
  ESP32 SDA → ADS1115 SDA
  ESP32 SCL → ADS1115 SCL
```

**Lösung 2: Analog Multiplexer (CD4051)**
```
CD4051 8:1 Multiplexer
  - 8 Analog Inputs → 1 Output
  - 3 Steuerpins (S0, S1, S2)
  - ~1€

Verbindung:
  ESP32 GPIO 5  → CD4051 S0
  ESP32 GPIO 12 → CD4051 S1
  ESP32 GPIO 13 → CD4051 S2
  ESP32 GPIO 34 → CD4051 COM (Output)
```

### 3. I2C Bus zu voll?

**Lösung: I2C Multiplexer (TCA9548A)**
```
TCA9548A I2C Multiplexer
  - 1 I2C Bus → 8 I2C Busse
  - Löst Adress-Konflikte
  - ~3-5€
```

### 4. Level Shifter für 5V Sensoren

**Bidirektionaler Level Shifter (4-Kanal):**
```
              Level Shifter
         ┌─────────────────┐
ESP32    │ LV1  ○ ○ HV1    │ Sensor (5V)
3.3V ────┤ LV2  ○ ○ HV2    ├──── 5V
GPIO ────┤ LV   ○ ○ HV     │
GND ─────┤ GND  ○ ○ GND    ├──── GND
         └─────────────────┘

LV = Low Voltage (3.3V)
HV = High Voltage (5V)
```

### 5. Gemeinsames GND - KRITISCH!

```
❌ FALSCH:
ESP32 GND ──────────┐
                     │
Relais GND ─────────┼───
                     │
12V Netzteil GND ───┘   (Nicht verbunden!)

✅ RICHTIG:
ESP32 GND ──────────┬────┐
                     │    │
Relais GND ─────────┤    │
                     │    │
12V Netzteil GND ───┤    │
                     │    │
5V Netzteil GND ────┤    │
                     │    │
Alle Sensoren GND ──┴────┴─── COMMON GROUND
```

### 6. Power-Probleme debuggen

**Symptome:**
- ESP32 rebootet zufällig
- WiFi Connect schlägt fehl
- Sensoren geben falsche Werte

**Ursache:** Zu wenig Strom

**Lösung:**
1. USB-Kabel mit mind. 500mA
2. Externe 5V Versorgung (2A)
3. Separate Netzteile für Relais & Sensoren
4. Kondensatoren (100µF) am ESP32 VIN/GND

### 7. I2C Pull-up Widerstände

```
Situation: I2C funktioniert nicht

Prüfen:
1. Sind Pull-ups auf Sensor-Board vorhanden?
   → Ja: OK
   → Nein: Externe 4.7kΩ hinzufügen

2. Zu viele Sensor-Boards mit Pull-ups?
   → Parallele Pull-ups reduzieren Widerstand
   → Lösung: Einen Pull-up pro Bus entfernen

Formel:
  R_total = 1 / (1/R1 + 1/R2 + 1/R3 + ...)

Beispiel:
  3x 4.7kΩ Pull-ups parallel = 1.57kΩ ← Zu niedrig!
  Optimal: 2.2kΩ - 10kΩ
```

### 8. Kabel-Längen

**Maximum:**
- **I2C**: 1-2 Meter (ohne Buffer)
- **UART**: 5-10 Meter (mit shielded cable)
- **Analog**: 0.5-1 Meter (sehr empfindlich)
- **Digital GPIO**: 2-3 Meter

**Bei längeren Kabel:**
- I2C Buffer (P82B715)
- UART RS485 Converter
- Twisted Pair Kabel

### 9. Schirmung & Störungen

```
Problem: Sensoren zeigen unstabile Werte

Ursachen:
  - Lange Kabel
  - Relais-Schaltungen (EMI)
  - Pumpen-Motoren (EMI)

Lösungen:
  ✓ Geschirmte Kabel verwenden
  ✓ Kabel verdrillen (Twisted Pair)
  ✓ Kondensatoren (100nF) parallel zu Sensoren
  ✓ Relais-Module weit weg von Sensoren
  ✓ Freilaufdioden an Motor-Lasten
```

### 10. Test-Setup vor Installation

```
Empfohlene Reihenfolge:

1. ESP32 alleine testen
   → WiFi Connect
   → Serial Monitor

2. + DHT22
   → Temperatur/Humidity lesen

3. + I2C Sensoren (einzeln)
   → I2C Scanner verwenden
   → Jeden Sensor einzeln testen

4. + Analog Sensoren (einzeln)
   → Raw-Werte prüfen
   → Kalibrierung

5. + UART Sensoren
   → Baud-Rate prüfen
   → Daten empfangen

6. + Relais (ohne Last!)
   → ON/OFF Test
   → Logik (LOW/HIGH) prüfen

7. Alles zusammen
   → Stromverbrauch messen
   → Auf Instabilitäten achten
```

---

## Checkliste vor dem Start

- [ ] Alle Pins doppelt geprüft
- [ ] Common GND für alle Geräte
- [ ] Spannungsteiler für 5V Sensoren (falls nötig)
- [ ] Pull-up Widerstände für I2C
- [ ] Separate Netzteile (ESP32, Relais, Pumpen)
- [ ] Level Shifter installiert (falls 5V Sensoren)
- [ ] Relais-Logik verstanden (LOW/HIGH Trigger)
- [ ] Kabel-Längen beachtet
- [ ] Serial Monitor getestet (115200 Baud)
- [ ] Firmware-Version ausgewählt
- [ ] WiFi Credentials eingetragen
- [ ] Backend läuft und ist erreichbar

---

## Fehlerbehebung Cheat-Sheet

| Problem | Mögliche Ursache | Lösung |
|---------|------------------|--------|
| ESP32 bootet nicht | Zu wenig Strom | Externes 5V Netzteil |
| I2C Sensor nicht gefunden | Falsche Adresse | I2C Scanner verwenden |
| Analog Wert immer 4095 | Pin falsch | Nur GPIO 32-39 für Analog |
| Relais schaltet nicht | Falsche Logik | LOW/HIGH Trigger prüfen |
| UART keine Daten | RX/TX vertauscht | ESP32 RX → Sensor TX |
| WiFi Connect fehlschlägt | 5 GHz WiFi | Nur 2.4 GHz verwenden |
| WebSocket Fehler | Backend läuft nicht | Backend starten |
| Sensoren unstabil | Kein Common GND | Alle GND verbinden |
| Spannung zu hoch | 5V an 3.3V Pin | Spannungsteiler |

---

**Viel Erfolg beim Aufbau! 🌱**

Bei Fragen: GitHub Issues oder Community-Forum
