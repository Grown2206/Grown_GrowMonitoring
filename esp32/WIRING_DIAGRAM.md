# 🔌 SCHALTPLAN - 4 PFLANZEN MIT RJ11 GROWLICHT-STEUERUNG

**Version:** 2.45.0
**Datum:** 26. Dezember 2024

---

## 📐 KOMPLETTER SCHALTPLAN

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    GROW MONITORING SYSTEM - SCHALTPLAN                     ║
║                      4 Pflanzen + RJ11 Growlicht PWM                      ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│                          12V STROMVERSORGUNG                             │
└─────────────────────────────────────────────────────────────────────────┘

    12V Netzteil (5A)
    ┌─────┐
    │  +  │─────┬──────────────────────┬────────────────────────┐
    │  -  │───┬─┼──────────────────────┼────────────────────────┼─── GND
    └─────┘   │ │                      │                        │
              │ │                      │                        │
              │ └─→ Step-Down (12V→5V) │                        │
              │         │               │                        │
              │         └──→ ESP32 5V   │                        │
              │                         │                        │
              └─→ Relais VCC           │                        │
                                       │                        │
                                   8-Kanal                  Boost Conv.
                                   Relais                   5V → 10V
                                   Modul                        │
                                      │                         │
                                      │                    ┌────┴────┐
                                      │                    │ VCC+10V │ (RJ11)
                                      │                    └─────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          ESP32 PINOUT ÜBERSICHT                          │
└─────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                    3V3 │ 1           38 │ GND
                    EN  │ 2           37 │ GPIO23 ── Relais IN3 (Pumpe 3)
              BOOT ── VP │ 3           36 │ GPIO22 ── SCL (I2C)
  Moisture 3 ── GPIO36 │ 4           35 │ TXD0
  Moisture 4 ── GPIO39 │ 5           34 │ RXD0
  Moisture 1 ── GPIO34 │ 6           33 │ GPIO21 ── SDA (I2C)
  Moisture 2 ── GPIO35 │ 7           32 │ GPIO19 ── Relais IN2 (Pumpe 2)
  Water Lvl ── GPIO32  │ 8           31 │ GPIO18 ── Relais IN1 (Pumpe 1)
  pH Sensor ── GPIO33  │ 9           30 │ GPIO5  ── Relais IN4 (Pumpe 4)
  Boost PWM ── GPIO25  │10           29 │ GPIO17 ── TX2 (MH-Z19B RX)
  DAC Ctrl ── GPIO26   │11           28 │ GPIO16 ── RX2 (MH-Z19B TX)
  DHT22 ───── GPIO27   │12           27 │ GPIO4
  Buzzer ──── GPIO14   │13           26 │ GPIO0
                    12  │14           25 │ GPIO2
                   GND  │15           24 │ GPIO15
                   13   │16           23 │ 3V3
                   SHD  │17           22 │ GND
                   SHD  │18           21 │ GPIO13 ── Relais IN5 (Licht)
                    19  │19           20 │ GPIO12 ── Relais IN6 (Ventilator)
                        └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        I2C BUS (ALLE SENSOREN)                           │
└─────────────────────────────────────────────────────────────────────────┘

    ESP32                  BH1750          SGP30         MCP4725        OLED
   GPIO21 ────────┬──────── SDA ──────── SDA ──────── SDA ──────── SDA
   GPIO22 ────────┼──────── SCL ──────── SCL ──────── SCL ──────── SCL
                  │
              3.3V ├────┬──── VCC ──────── VCC ──────── VCC ──────── VCC
               GND ├────┴──── GND ──────── GND ──────── GND ──────── GND

    I2C Adressen:
    - BH1750:  0x23 (Lichtsensor)
    - SGP30:   0x58 (VOC Sensor)
    - MCP4725: 0x60 (0-10V DAC für Growlicht)
    - OLED:    0x3C (Display, optional)

┌─────────────────────────────────────────────────────────────────────────┐
│                      UART SENSOREN (Serial2)                             │
└─────────────────────────────────────────────────────────────────────────┘

    ESP32           MH-Z19B CO2 Sensor
   GPIO16 (RX2) ──── TX
   GPIO17 (TX2) ──── RX
      5V        ──── VCC (WICHTIG: 5V, nicht 3.3V!)
     GND        ──── GND

┌─────────────────────────────────────────────────────────────────────────┐
│              ANALOG SENSOREN (4x Bodenfeuchtigkeit)                      │
└─────────────────────────────────────────────────────────────────────────┘

                    Moisture 1      Moisture 2      Moisture 3      Moisture 4
   ESP32            Sensor 1        Sensor 2        Sensor 3        Sensor 4
   ─────            ────────        ────────        ────────        ────────
   GPIO34 ────────── AOUT
   GPIO35 ──────────────────────── AOUT
   GPIO36 ────────────────────────────────────────── AOUT
   GPIO39 ──────────────────────────────────────────────────────── AOUT

   3.3V   ───────┬─── VCC ─────┬─── VCC ─────┬─── VCC ─────┬─── VCC
   GND    ───────┴─── GND ─────┴─── GND ─────┴─── GND ─────┴─── GND

   Zusätzliche Analog-Sensoren:
   GPIO32 ────── Wasserstandssensor (Float Switch)
   GPIO33 ────── pH Sensor (Analog)

┌─────────────────────────────────────────────────────────────────────────┐
│                       DHT22 SENSOR (Temp + Humidity)                     │
└─────────────────────────────────────────────────────────────────────────┘

    ESP32           DHT22
   GPIO27 ────────── DATA
   3.3V   ────────── VCC
   GND    ────────── GND

   Optional: 10kΩ Pull-up zwischen DATA und VCC

┌─────────────────────────────────────────────────────────────────────────┐
│                    8-KANAL RELAIS-MODUL (Pumpen)                         │
└─────────────────────────────────────────────────────────────────────────┘

    ESP32                   Relais-Modul (5V Trigger)
   ─────                    ────────────────────────
   GPIO18 ──────────────── IN1  (Pumpe Pflanze 1)
   GPIO19 ──────────────── IN2  (Pumpe Pflanze 2)
   GPIO23 ──────────────── IN3  (Pumpe Pflanze 3)
   GPIO5  ──────────────── IN4  (Pumpe Pflanze 4)
   GPIO13 ──────────────── IN5  (Growlicht Relais)
   GPIO12 ──────────────── IN6  (Ventilator)
   GPIO14 ──────────────── IN7  (Reserve)
   GPIO15 ──────────────── IN8  (Reserve)

   5V     ──────────────── VCC
   GND    ──────────────── GND

    Relais Ausgänge         12V Geräte
   ─────────────────       ──────────
   COM1 ───┐
   NO1  ───┴─────────────── Pumpe 1 (+)
                            Pumpe 1 (-) ─── GND

   COM2 ───┐
   NO2  ───┴─────────────── Pumpe 2 (+)
                            Pumpe 2 (-) ─── GND

   COM3 ───┐
   NO3  ───┴─────────────── Pumpe 3 (+)
                            Pumpe 3 (-) ─── GND

   COM4 ───┐
   NO4  ───┴─────────────── Pumpe 4 (+)
                            Pumpe 4 (-) ─── GND

   COM5 ───┐
   NO5  ───┴─────────────── Reserve (LED-Strip 12V)

   COM6 ───┐
   NO6  ───┴─────────────── Ventilator 12V (+)
                            Ventilator (-) ─── GND

   WICHTIG: Alle COM Pins an 12V+ vom Netzteil!

┌─────────────────────────────────────────────────────────────────────────┐
│          🌟 RJ11 GROWLICHT-STEUERUNG (0-10V PWM) 🌟                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         SCHALTUNG ÜBERSICHT                           │
└──────────────────────────────────────────────────────────────────────┘

    ESP32              MCP4725              RJ11 Buchse         Growlicht
                       (DAC 0-5V)           (Steuerleitung)
    ─────              ──────────           ──────────────      ─────────

                   ┌──────────────┐
   GPIO26 ─────────│ I2C Control  │
                   │              │
   GPIO21 (SDA)────│ SDA          │
   GPIO22 (SCL)────│ SCL          │
                   │              │        ┌─ Pin 1 (Rot)
   5V ─────────────│ VCC          │        │  ┌─ Pin 2 (Schwarz)
   GND ────────────│ GND       OUT│────┬───┼──┼─ Pin 3 (Gelb) PWM 0-10V
                   └──────────────┘    │   │  │  ┌─ Pin 4 (Weiß)
                                       │   │  │  │
                         Boost Conv.   │   │  │  │
                         5V → 10V      │   │  │  │
                         ┌────────┐    │   │  │  │
   GPIO25 (PWM) ─────────│ PWM IN │    │   │  │  │
   5V ───────────────────│ VIN    │    │   │  │  │
   GND ──────────────────│ GND    │    │   │  │  │
                         │     OUT│────┘   │  │  │
                         └────────┘        │  │  │
                            │              │  │  │
                         VCC+10V           │  │  │
                                           │  │  │
                         ┌─────────────────┘  │  │
                         │  ┌──────────────────┘  │
                         │  │  ┌──────────────────┘
                         │  │  │  ┌────────────────
                         │  │  │  │
                      ┌──▼──▼──▼──▼──┐
                      │  RJ11 Buchse │
                      │   6P6C Jack  │
                      └──────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     RJ11 PIN-BELEGUNG (6P6C)                          │
└──────────────────────────────────────────────────────────────────────┘

    View from front (clip down):

    ┌─────────────────┐
    │  1  2  3  4  5  6│
    │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ │
    │ │ │ │ │ │ │ │ │ │
    └─┴─┴─┴─┴─┴─┴─┴─┴─┘
      │ │ │ │ │ │
      │ │ │ │ └─┘─── Pin 5-6: N.C. (Not Connected)
      │ │ │ └────── Pin 4: Weiß = FG (Frame Ground / Optional)
      │ │ └──────── Pin 3: Gelb = PWM 0-10V Signal
      │ └────────── Pin 2: Schwarz = GND
      └──────────── Pin 1: Rot = VCC+10V (Power Supply)

┌──────────────────────────────────────────────────────────────────────┐
│                 DETAILLIERTE VERKABELUNG RJ11                         │
└──────────────────────────────────────────────────────────────────────┘

Pin 1 (ROT) - VCC+10V:
    Boost Converter OUT ──────┬──→ RJ11 Pin 1 (Rot)
                              │
                              └──→ Growlicht VCC+10V

    Zweck: Stromversorgung für Dimmer-Elektronik im Growlicht
    Spannung: 10V DC
    Strom: ~50-100mA (nur für Steuerelektronik)

Pin 2 (SCHWARZ) - GND:
    ESP32 GND ────────────────┬──→ RJ11 Pin 2 (Schwarz)
    12V Netzteil GND ─────────┤
    Boost Converter GND ──────┤
    MCP4725 GND ──────────────┘

    Zweck: Gemeinsame Masse (CRITICAL!)
    Hinweis: ALLE GND müssen verbunden sein!

Pin 3 (GELB) - PWM 0-10V:
    MCP4725 OUT ──→ Voltage Divider ──→ RJ11 Pin 3 (Gelb)
                    (falls >5V Output)

    Zweck: Dimm-Signal für Growlicht
    Spannung: 0V = AUS, 10V = 100% Helligkeit
    Logik: Linear (5V = 50% Helligkeit)

    Berechnung Helligkeit:
    Helligkeit% = (Voltage / 10V) * 100

    0.0V →   0% (Aus)
    1.0V →  10% (Minimum)
    5.0V →  50% (Mittel)
    10.0V → 100% (Maximum)

Pin 4 (WEISS) - FG (Frame Ground):
    ESP32 GND ────────────────→ RJ11 Pin 4 (Weiß)

    Zweck: Schutzleiter / Abschirmung
    Optional: Bei EMI-Problemen verwenden
    Hinweis: Kann auf GND gelegt werden

Pin 5-6: Nicht verwendet (N.C.)

┌──────────────────────────────────────────────────────────────────────┐
│                    ALTERNATIVE: OHNE DAC (Einfach)                    │
└──────────────────────────────────────────────────────────────────────┘

Wenn Growlicht nur ON/OFF braucht (kein Dimming):

    ESP32           Relais          RJ11
   ──────          ──────          ──────
   GPIO13 ────── IN5
                COM5 ──── 12V+
                NO5  ──┬─→ Pin 1 (VCC+10V) - Growlicht AN/AUS
                       │
   GND ────────────────┴─→ Pin 2 (GND)

   Pin 3 (PWM): Auf 10V festlegen (immer 100%)
   Pin 4 (FG):  Auf GND

┌──────────────────────────────────────────────────────────────────────┐
│                    MCP4725 DAC KONFIGURATION                          │
└──────────────────────────────────────────────────────────────────────┘

MCP4725 12-Bit DAC (0-4095 Steps):

    ESP32          MCP4725
   ──────         ────────
   GPIO21 (SDA)─── SDA
   GPIO22 (SCL)─── SCL
   3.3V ─────────── VCC
   GND ──────────── GND
                    VOUT ───→ Op-Amp ───→ 0-10V

Output Voltage Formula:
    VOUT = (Value / 4095) * VCC

    Value    VCC=5V   → Op-Amp → 10V Output
    ─────    ──────     ──────    ──────────
    0        0.00V   →           →  0.0V   (0%)
    2048     2.50V   →           →  5.0V  (50%)
    4095     5.00V   →           → 10.0V (100%)

    Op-Amp Schaltung (2x Verstärkung):

           R2 (10kΩ)
            ┌─────┐
    MCP OUT─┤     │
            │ OpAmp├──→ 0-10V OUT
       GND──┤     │
            └─────┘
           R1 (10kΩ)

┌──────────────────────────────────────────────────────────────────────┐
│                      SICHERHEITSHINWEISE                              │
└──────────────────────────────────────────────────────────────────────┘

⚠️  WICHTIG:

1. VCC+10V = NUR für Steuerelektronik (max. 100mA)
   - NICHT für Haupt-Stromversorgung des Growlichts!
   - Growlicht braucht separate 220V Versorgung!

2. GND MUSS bei allen Komponenten verbunden sein
   - ESP32 GND = 12V GND = Boost GND = DAC GND

3. PWM 0-10V Signal:
   - Max. 10V, NICHT höher!
   - Bei >10V: Spannungsteiler verwenden

4. RJ11 Kabel:
   - Max. 5 Meter Länge (Signalqualität)
   - Geschirmtes Kabel bei EMI-Problemen

5. Growlicht MUSS galvanisch getrennt sein:
   - 220V AC vom Growlicht NIE mit 12V DC mischen!
   - Nur Steuersignale über RJ11

6. Testing:
   - IMMER mit Multimeter Spannungen prüfen
   - 0-10V Signal OHNE Growlicht testen
   - Dann erst Growlicht anschließen

┌──────────────────────────────────────────────────────────────────────┐
│                        KABELFARBEN-CODE                               │
└──────────────────────────────────────────────────────────────────────┘

Standard RJ11 Telefon-Kabel Farben:

Pin    Standard-Farbe    Funktion in diesem Projekt
───    ──────────────    ────────────────────────────
1      Weiß/Orange       Rot (VCC+10V) - Umwickeln!
2      Orange/Weiß       Schwarz (GND)
3      Weiß/Grün         Gelb (PWM 0-10V)
4      Blau/Weiß         Weiß (FG)
5      Weiß/Blau         N.C.
6      Grün/Weiß         N.C.

WICHTIG: Farben können variieren! Immer mit Multimeter prüfen!

┌──────────────────────────────────────────────────────────────────────┐
│                    ALTERNATIVE STEUERUNG                              │
└──────────────────────────────────────────────────────────────────────┘

Option 1: PWM direkt (wenn Growlicht 3.3V PWM akzeptiert):
    ESP32 GPIO25 → Spannungsteiler → RJ11 Pin 3
    (Einfacher, aber weniger Präzision)

Option 2: Fertiges 0-10V Dimmer-Modul:
    ESP32 GPIO25 → PWM-to-0-10V Modul → RJ11 Pin 3
    Amazon: "PWM to 0-10V Converter Module"
    ~15€, Plug & Play

Option 3: DALI Steuerung (Profi):
    ESP32 → DALI Controller → Growlicht
    Industriestandard, mehr Features

```

---

## 📸 FOTOS DER VERKABELUNG

### Breadboard-Prototyp
```
[Foto 1: ESP32 auf Breadboard mit allen Sensoren]
[Foto 2: RJ11 Buchse mit farbigen Kabeln]
[Foto 3: MCP4725 DAC Modul]
[Foto 4: Komplette Verkabelung Overhead-View]
```

### Finaler Aufbau
```
[Foto 5: In Gehäuse montiert]
[Foto 6: RJ11-Anschlüsse beschriftet]
[Foto 7: 12V Verkabelung mit WAGO-Klemmen]
[Foto 8: Growlicht mit RJ11 verbunden]
```

---

## 🔧 AUFBAU SCHRITT-FÜR-SCHRITT

### Phase 1: Breadboard-Test
1. ESP32 auf Breadboard
2. I2C-Sensoren anschließen (BH1750, SGP30, MCP4725)
3. DHT22 anschließen
4. Test-Code hochladen
5. Serial Monitor prüfen

### Phase 2: Analog-Sensoren
1. Bodenfeuchtigkeit 1-4 anschließen
2. Kalibrierung durchführen
3. Wasserstandssensor testen

### Phase 3: Relais & Pumpen
1. Relais-Modul mit 5V versorgen
2. GPIO-Pins an IN1-IN8 anschließen
3. 12V an COM-Pins
4. Pumpen an NO-Pins
5. Test: Manuell schalten

### Phase 4: RJ11 Growlicht
1. Boost Converter 5V→10V aufbauen
2. MCP4725 verkabeln
3. RJ11-Buchse löten
4. 0-10V Signal mit Multimeter messen
5. Growlicht anschließen

### Phase 5: Gehäuse-Montage
1. Platine in Gehäuse
2. Kabeldurchführungen bohren
3. RJ11-Buchse nach außen
4. Beschriftung anbringen

---

## 📐 PCB DESIGN (Optional)

Für permanente Installation:

```
[PCB Layout mit KiCad]
- ESP32 Sockel
- Schraubklemmen für 12V
- RJ11 Buchsen (2x)
- Sensor-Anschlüsse
- Relais-Anschlüsse

Gerber-Files: /pcb/GrowMonitor_v1.0.zip
```

---

**Nächste Schritte:**
1. ✅ Shopping-Liste abarbeiten
2. ✅ Breadboard-Aufbau nach Schaltplan
3. ✅ Firmware flashen (siehe GrowMonitor_RJ11.ino)
4. ✅ Kalibrierung durchführen
5. ✅ In Gehäuse montieren

**Support:**
- Discord: [Link]
- GitHub Issues: [Link]
- Wiki: [Link]

---

**Erstellt:** Dezember 2024
**Lizenz:** MIT
**Version:** 1.0
