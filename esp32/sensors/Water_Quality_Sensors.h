/*
 * Wasserqualitäts-Sensoren für Grow Monitoring System
 *
 * Unterstützte Sensoren:
 * - pH Sensor (Analog)
 * - TDS Sensor (Total Dissolved Solids - Analog)
 * - EC Sensor (Electrical Conductivity - Analog)
 * - Atlas Scientific pH/EC/ORP Sensoren (I2C/UART)
 *
 * Verwendete Bibliotheken:
 * - DFRobot pH Sensor: Custom (included below)
 * - DFRobot TDS Sensor: Custom (included below)
 * - Atlas Scientific: "Atlas Scientific I2C" (optional)
 *
 * Wichtig:
 * - Regelmäßige Kalibrierung erforderlich!
 * - Temperatur-Kompensation für präzise Messungen
 * - Sensoren müssen feucht gelagert werden
 */

#ifndef WATER_QUALITY_SENSORS_H
#define WATER_QUALITY_SENSORS_H

#include <Arduino.h>

// ========================================
// Analog pH Sensor (DFRobot SEN0161)
// ========================================
// Messbereich: pH 0-14
// Genauigkeit: ±0.1 pH
// Pins: Analog Input
// Kalibrierung: pH 4.0, 7.0 (und optional 10.0)

class AnalogpHSensor {
private:
  uint8_t pin;
  float voltage;
  float calibrationVoltage;  // Spannung bei pH 7.0
  float calibrationSlope;    // Steigung (V/pH)
  float temperature;         // Für Temperatur-Kompensation

public:
  AnalogpHSensor(uint8_t analogPin)
    : pin(analogPin),
      calibrationVoltage(1.65),  // Typisch für pH 7.0 bei 3.3V
      calibrationSlope(-0.18),   // ~-180mV/pH
      temperature(25.0) {}

  void begin() {
    pinMode(pin, INPUT);
  }

  // Spannung auslesen
  float readVoltage() {
    int raw = 0;
    // 10 Messungen mitteln für Stabilität
    for (int i = 0; i < 10; i++) {
      raw += analogRead(pin);
      delay(10);
    }
    voltage = (raw / 10.0 / 4095.0) * 3.3;  // ESP32: 3.3V
    return voltage;
  }

  // pH-Wert berechnen
  float readpH() {
    float v = readVoltage();
    float ph = 7.0 + ((calibrationVoltage - v) / calibrationSlope);

    // Temperatur-Kompensation (vereinfacht)
    float tempDiff = temperature - 25.0;
    ph = ph - (tempDiff * 0.003);  // ~0.003 pH/°C

    return constrain(ph, 0.0, 14.0);
  }

  // Temperatur setzen (für Kompensation)
  void setTemperature(float temp) {
    temperature = temp;
  }

  // 2-Punkt Kalibrierung (pH 4.0 und pH 7.0)
  void calibrate(float voltage4, float voltage7) {
    calibrationVoltage = voltage7;
    calibrationSlope = (voltage4 - voltage7) / (4.0 - 7.0);
  }

  // Kalibrierungs-Hilfe: Aktuelle Spannung anzeigen
  void printCalibrationVoltage() {
    Serial.print("Current voltage: ");
    Serial.println(readVoltage(), 3);
  }
};

// ========================================
// TDS Sensor (Total Dissolved Solids)
// ========================================
// Messbereich: 0-1000 ppm
// Genauigkeit: ±10%
// Pins: Analog Input

class TDSSensor {
private:
  uint8_t pin;
  float voltage;
  float temperature;
  float calibrationFactor;

public:
  TDSSensor(uint8_t analogPin)
    : pin(analogPin),
      temperature(25.0),
      calibrationFactor(0.5) {}  // Standard TDS factor

  void begin() {
    pinMode(pin, INPUT);
  }

  float readVoltage() {
    int raw = 0;
    for (int i = 0; i < 10; i++) {
      raw += analogRead(pin);
      delay(10);
    }
    voltage = (raw / 10.0 / 4095.0) * 3.3;
    return voltage;
  }

  // TDS in ppm
  float readTDS() {
    float v = readVoltage();

    // Temperatur-Kompensation
    float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0);
    float compensationVoltage = v / compensationCoefficient;

    // TDS berechnen (empirische Formel)
    float tds = (133.42 * compensationVoltage * compensationVoltage * compensationVoltage
                 - 255.86 * compensationVoltage * compensationVoltage
                 + 857.39 * compensationVoltage) * calibrationFactor;

    return max(0.0f, tds);
  }

  void setTemperature(float temp) {
    temperature = temp;
  }

  // Kalibrierung mit bekannter TDS-Lösung
  void calibrate(float knownTDS) {
    float measuredTDS = readTDS();
    if (measuredTDS > 0) {
      calibrationFactor = calibrationFactor * (knownTDS / measuredTDS);
    }
  }
};

// ========================================
// EC Sensor (Electrical Conductivity)
// ========================================
// Messbereich: 0-20 mS/cm
// 1 mS/cm ≈ 500 ppm TDS (Näherung)

class ECSensor {
private:
  uint8_t pin;
  float voltage;
  float temperature;
  float kValue;  // K-Wert der Elektrode (typisch 0.1 - 10.0)

public:
  ECSensor(uint8_t analogPin, float k = 1.0)
    : pin(analogPin),
      temperature(25.0),
      kValue(k) {}

  void begin() {
    pinMode(pin, INPUT);
  }

  float readVoltage() {
    int raw = 0;
    for (int i = 0; i < 10; i++) {
      raw += analogRead(pin);
      delay(10);
    }
    voltage = (raw / 10.0 / 4095.0) * 3.3;
    return voltage;
  }

  // EC in mS/cm
  float readEC() {
    float v = readVoltage();

    // Temperatur-Kompensation (2% pro °C)
    float tempCoef = 1.0 + 0.02 * (temperature - 25.0);

    // EC berechnen (abhängig vom Sensor-Typ)
    // Formel für DFRobot EC Sensor
    float ec = (kValue * v * tempCoef);

    return max(0.0f, ec);
  }

  // EC → TDS Umrechnung (Näherung)
  // 1 mS/cm = ~500 ppm (kann zwischen 500-700 variieren)
  float readTDS(float conversionFactor = 500.0) {
    return readEC() * conversionFactor;
  }

  void setTemperature(float temp) {
    temperature = temp;
  }

  void setKValue(float k) {
    kValue = k;
  }

  // Kalibrierung mit bekannter EC-Lösung
  void calibrate(float knownEC_mS) {
    float measuredEC = readEC();
    if (measuredEC > 0) {
      kValue = kValue * (knownEC_mS / measuredEC);
    }
  }
};

// ========================================
// Atlas Scientific pH Sensor (I2C)
// ========================================
// High-End Option für präzise Messungen

#ifdef USE_ATLAS_SCIENTIFIC
#include <Wire.h>

class AtlaspHSensor {
private:
  uint8_t i2cAddress;
  char sensorData[30];

public:
  AtlaspHSensor(uint8_t addr = 99) : i2cAddress(addr) {}  // Default I2C address

  void begin() {
    Wire.begin();
  }

  float readpH() {
    Wire.beginTransmission(i2cAddress);
    Wire.write("r");  // Read command
    Wire.endTransmission();

    delay(1000);  // Wait for reading

    Wire.requestFrom(i2cAddress, 20, 1);
    byte code = Wire.read();

    if (code == 1) {  // Success
      byte i = 0;
      while (Wire.available()) {
        sensorData[i] = Wire.read();
        i++;
      }
      sensorData[i] = '\0';
      return atof(sensorData);
    }

    return -1.0;  // Error
  }

  // Kalibrierung (Mid Point pH 7.0)
  void calibrateMid() {
    Wire.beginTransmission(i2cAddress);
    Wire.write("Cal,mid,7.00");
    Wire.endTransmission();
    delay(1000);
  }

  // Kalibrierung (Low Point pH 4.0)
  void calibrateLow() {
    Wire.beginTransmission(i2cAddress);
    Wire.write("Cal,low,4.00");
    Wire.endTransmission();
    delay(1000);
  }

  // Kalibrierung (High Point pH 10.0)
  void calibrateHigh() {
    Wire.beginTransmission(i2cAddress);
    Wire.write("Cal,high,10.00");
    Wire.endTransmission();
    delay(1000);
  }

  // Temperatur-Kompensation setzen
  void setTemperature(float temp) {
    char cmd[20];
    sprintf(cmd, "T,%.2f", temp);
    Wire.beginTransmission(i2cAddress);
    Wire.write(cmd);
    Wire.endTransmission();
  }
};
#endif

// ========================================
// Beispiel-Code
// ========================================
/*

// pH Sensor Beispiel:
#include "sensors/Water_Quality_Sensors.h"
AnalogpHSensor phSensor(34);  // GPIO 34

void setup() {
  Serial.begin(115200);
  phSensor.begin();

  // Kalibrierung (einmalig):
  // 1. In pH 7.0 Puffer-Lösung tauchen
  // phSensor.printCalibrationVoltage();  // z.B. 1.65V
  // 2. In pH 4.0 Puffer-Lösung tauchen
  // phSensor.printCalibrationVoltage();  // z.B. 2.19V
  // 3. Werte eingeben:
  phSensor.calibrate(2.19, 1.65);  // (voltage@pH4, voltage@pH7)
}

void loop() {
  float ph = phSensor.readpH();
  Serial.print("pH: ");
  Serial.println(ph, 2);
  delay(2000);
}

// TDS Sensor Beispiel:
#include "sensors/Water_Quality_Sensors.h"
TDSSensor tdsSensor(35);  // GPIO 35

void setup() {
  Serial.begin(115200);
  tdsSensor.begin();
}

void loop() {
  tdsSensor.setTemperature(25.0);  // Aktuelle Wassertemperatur
  float tds = tdsSensor.readTDS();

  Serial.print("TDS: ");
  Serial.print(tds);
  Serial.println(" ppm");

  delay(2000);
}

// EC Sensor Beispiel:
#include "sensors/Water_Quality_Sensors.h"
ECSensor ecSensor(36);  // GPIO 36

void setup() {
  Serial.begin(115200);
  ecSensor.begin();
}

void loop() {
  ecSensor.setTemperature(25.0);
  float ec = ecSensor.readEC();
  float tds = ecSensor.readTDS();

  Serial.print("EC: "); Serial.print(ec); Serial.print(" mS/cm, ");
  Serial.print("TDS: "); Serial.print(tds); Serial.println(" ppm");

  delay(2000);
}

*/

// ========================================
// Kalibrierungs-Lösungen
// ========================================
/*

pH Sensor:
  - pH 4.0 Puffer-Lösung (rot)
  - pH 7.0 Puffer-Lösung (gelb)
  - pH 10.0 Puffer-Lösung (blau) - optional

  Kalibrierungs-Prozess:
  1. Sensor 10min in destilliertem Wasser einweichen
  2. In pH 7.0 Lösung tauchen, warten bis stabil
  3. Spannung notieren
  4. Sensor abspülen
  5. In pH 4.0 Lösung tauchen, warten bis stabil
  6. Spannung notieren
  7. calibrate() mit beiden Werten aufrufen

TDS/EC Sensor:
  - 1413 µS/cm Kalibrier-Lösung (am häufigsten)
  - 12.88 mS/cm Kalibrier-Lösung (für hohe EC-Werte)

  Kalibrierungs-Prozess:
  1. Sensor in Kalibrier-Lösung tauchen
  2. Warten bis Messung stabil
  3. calibrate(knownValue) aufrufen

Lagerung:
  - pH Elektroden: In pH 4.0 Lösung oder KCl-Lösung lagern
  - TDS/EC Sensoren: In destilliertem Wasser lagern
  - NIE trocken lagern!

*/

// ========================================
// Pin-Belegung
// ========================================
/*

ESP32:
  Analog Sensoren (pH, TDS, EC):
    - Signal: GPIO 34, 35, 36, 39 (nur Input)
    - VCC: 5V (typisch)
    - GND: GND

  Atlas Scientific (I2C):
    - SDA: GPIO 21
    - SCL: GPIO 22
    - VCC: 5V
    - GND: GND

*/

#endif // WATER_QUALITY_SENSORS_H
