/*
 * Lichtsensor-Treiber für Grow Monitoring System
 *
 * Unterstützte Sensoren:
 * - BH1750 (I2C) - Luxmeter
 * - VEML7700 (I2C) - Hochpräzise Lux/Licht
 * - TSL2591 (I2C) - Lux mit hohem Dynamikbereich
 * - Analog Light Sensor (LDR/Photoresistor)
 *
 * Verwendete Bibliotheken:
 * - BH1750: "BH1750" by Christopher Laws
 * - VEML7700: "Adafruit VEML7700 Library" by Adafruit
 * - TSL2591: "Adafruit TSL2591 Library" by Adafruit
 *
 * PAR/PPFD Umrechnung:
 * 1 W/m² ≈ 4.6 µmol/m²/s (für weiße LEDs)
 * 1 Lux ≈ 0.0185 µmol/m²/s (Näherung für Vollspektrum)
 */

#ifndef LIGHT_SENSORS_H
#define LIGHT_SENSORS_H

#include <Arduino.h>

// ========================================
// BH1750 Lichtsensor (I2C)
// ========================================
// Messbereich: 1-65535 Lux
// Genauigkeit: ±20%
// Pins: SDA, SCL

#ifdef USE_BH1750
#include <BH1750.h>

class BH1750Sensor {
private:
  BH1750 sensor;
  float calibrationFactor;

public:
  BH1750Sensor() : calibrationFactor(1.0) {}

  bool begin(uint8_t mode = BH1750::CONTINUOUS_HIGH_RES_MODE) {
    return sensor.begin(mode);
  }

  float readLux() {
    float lux = sensor.readLightLevel();
    return lux * calibrationFactor;
  }

  // Umrechnung Lux → PAR (µmol/m²/s)
  // Für weiße LEDs: 1 Lux ≈ 0.0185 µmol/m²/s
  // Für Vollspektrum: 1 Lux ≈ 0.015 µmol/m²/s
  float readPAR(float conversionFactor = 0.0185) {
    return readLux() * conversionFactor;
  }

  // Kalibrierungs-Faktor setzen
  void setCalibration(float factor) {
    calibrationFactor = factor;
  }

  // Mess-Modus ändern
  void setMode(uint8_t mode) {
    sensor.configure(mode);
  }
};
#endif

// ========================================
// VEML7700 Hochpräziser Lichtsensor (I2C)
// ========================================
// Messbereich: 0-120,000 Lux
// Genauigkeit: ±10%
// Pins: SDA, SCL

#ifdef USE_VEML7700
#include <Adafruit_VEML7700.h>

class VEML7700Sensor {
private:
  Adafruit_VEML7700 sensor;

public:
  bool begin() {
    return sensor.begin();
  }

  float readLux() {
    return sensor.readLux();
  }

  float readWhiteLight() {
    return sensor.readWhite();
  }

  float readALS() {  // Ambient Light Sensor
    return sensor.readALS();
  }

  // PAR Umrechnung
  float readPAR(float conversionFactor = 0.0185) {
    return readLux() * conversionFactor;
  }

  // Gain einstellen für verschiedene Lichtbereiche
  void setGain(uint8_t gain) {
    sensor.setGain(gain);
  }

  // Integration Time einstellen
  void setIntegrationTime(uint8_t time) {
    sensor.setIntegrationTime(time);
  }

  // Auto Gain/Integration
  void enableAutoGain() {
    sensor.enable(true);
  }
};
#endif

// ========================================
// TSL2591 High Dynamic Range Lichtsensor
// ========================================
// Messbereich: 188 µLux - 88,000 Lux
// Pins: SDA, SCL

#ifdef USE_TSL2591
#include <Adafruit_TSL2591.h>

class TSL2591Sensor {
private:
  Adafruit_TSL2591 sensor;

public:
  TSL2591Sensor() : sensor(2591) {}

  bool begin() {
    if (sensor.begin()) {
      // Standard-Konfiguration für Grow-Anwendungen
      sensor.setGain(TSL2591_GAIN_MED);  // 25x gain
      sensor.setTiming(TSL2591_INTEGRATIONTIME_300MS);
      return true;
    }
    return false;
  }

  float readLux() {
    uint32_t lum = sensor.getFullLuminosity();
    uint16_t ir = lum >> 16;
    uint16_t full = lum & 0xFFFF;
    return sensor.calculateLux(full, ir);
  }

  float readPAR(float conversionFactor = 0.0185) {
    return readLux() * conversionFactor;
  }

  // Vollspektrum (sichtbar + IR)
  uint16_t readFullSpectrum() {
    return sensor.getLuminosity(TSL2591_FULLSPECTRUM);
  }

  // Nur IR
  uint16_t readInfrared() {
    return sensor.getLuminosity(TSL2591_INFRARED);
  }

  // Nur sichtbares Licht
  uint16_t readVisible() {
    return sensor.getLuminosity(TSL2591_VISIBLE);
  }

  void setGain(tsl2591Gain_t gain) {
    sensor.setGain(gain);
  }

  void setIntegrationTime(tsl2591IntegrationTime_t time) {
    sensor.setTiming(time);
  }
};
#endif

// ========================================
// Analoger Lichtsensor (LDR)
// ========================================
// Einfacher Photoresistor für grundlegende Messungen

class AnalogLightSensor {
private:
  uint8_t pin;
  float voltageRef;
  int minRaw;
  int maxRaw;

public:
  AnalogLightSensor(uint8_t analogPin, float vRef = 3.3)
    : pin(analogPin), voltageRef(vRef), minRaw(0), maxRaw(4095) {}

  void begin() {
    pinMode(pin, INPUT);
  }

  // Raw ADC Wert
  int readRaw() {
    return analogRead(pin);
  }

  // Prozent (0-100%)
  float readPercent() {
    int raw = readRaw();
    return map(raw, minRaw, maxRaw, 0, 100);
  }

  // Spannung
  float readVoltage() {
    return (readRaw() / 4095.0) * voltageRef;
  }

  // Kalibrierung: Min/Max Werte setzen
  void calibrate(int minValue, int maxValue) {
    minRaw = minValue;
    maxRaw = maxValue;
  }

  // Geschätzter Lux-Wert (stark abhängig vom LDR-Typ)
  float readLuxEstimate(float factor = 500.0) {
    float percent = readPercent() / 100.0;
    return percent * factor;
  }
};

// ========================================
// PAR Sensor (Quantumsensor Simulation)
// ========================================
// Für echte PAR-Messungen: Apogee SQ-500, LI-COR LI-190

class PARSensor {
private:
  uint8_t analogPin;
  float calibrationSlope;     // µmol/m²/s per Volt
  float calibrationIntercept;

public:
  // Standard-Kalibrierung für typischen PAR-Sensor:
  // Output: 0-5V = 0-2000 µmol/m²/s
  PARSensor(uint8_t pin, float slope = 400.0, float intercept = 0.0)
    : analogPin(pin), calibrationSlope(slope), calibrationIntercept(intercept) {}

  void begin() {
    pinMode(analogPin, INPUT);
  }

  float readPAR() {
    int raw = analogRead(analogPin);
    float voltage = (raw / 4095.0) * 3.3;  // ESP32: 3.3V reference
    float par = (voltage * calibrationSlope) + calibrationIntercept;
    return max(0.0f, par);
  }

  void setCalibration(float slope, float intercept) {
    calibrationSlope = slope;
    calibrationIntercept = intercept;
  }
};

// ========================================
// Beispiel-Code
// ========================================
/*

// BH1750 Beispiel:
#define USE_BH1750
#include "sensors/Light_Sensors.h"
BH1750Sensor lightSensor;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (lightSensor.begin()) {
    Serial.println("BH1750 initialized");
  }
}

void loop() {
  float lux = lightSensor.readLux();
  float par = lightSensor.readPAR();

  Serial.print("Light: "); Serial.print(lux); Serial.print(" lux, ");
  Serial.print("PAR: "); Serial.print(par); Serial.println(" µmol/m²/s");

  delay(2000);
}

// Analoger LDR Beispiel:
#include "sensors/Light_Sensors.h"
AnalogLightSensor ldr(34);  // GPIO 34

void setup() {
  Serial.begin(115200);
  ldr.begin();
  // Kalibrierung: Dunkel = 100, Hell = 3800
  ldr.calibrate(100, 3800);
}

void loop() {
  float percent = ldr.readPercent();
  float lux = ldr.readLuxEstimate();

  Serial.print("Light: "); Serial.print(percent); Serial.print(" %, ");
  Serial.print("~"); Serial.print(lux); Serial.println(" lux");

  delay(1000);
}

*/

// ========================================
// Pin-Belegung Empfehlungen
// ========================================
/*

ESP32:
  I2C Lichtsensoren (BH1750, VEML7700, TSL2591):
    - SDA: GPIO 21
    - SCL: GPIO 22
    - VCC: 3.3V
    - GND: GND

  Analoger LDR:
    - Signal: GPIO 34, 35, 36, oder 39 (nur Input)
    - VCC: 3.3V
    - 10kΩ Pull-down Widerstand zu GND

*/

#endif // LIGHT_SENSORS_H
