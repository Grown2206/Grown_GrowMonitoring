/*
 * CO2 Sensor Drivers für Grow Monitoring System
 *
 * Unterstützte Sensoren:
 * - MH-Z19B (UART)
 * - SCD30 (I2C)
 * - CCS811 (I2C, mit VOC)
 *
 * Verwendete Bibliotheken:
 * - MH-Z19B: keine externe Bibliothek erforderlich (UART)
 * - SCD30: "SparkFun SCD30 Arduino Library" by SparkFun
 * - CCS811: "Adafruit CCS811 Library" by Adafruit
 */

#ifndef CO2_SENSORS_H
#define CO2_SENSORS_H

#include <Arduino.h>

// ========================================
// MH-Z19B CO2 Sensor (UART)
// ========================================
// Messbereich: 0-5000 ppm
// Genauigkeit: ±50 ppm + 5% des Messwerts
// Pins: TX, RX (Serial2 auf ESP32)
// Kalibrierung: 400 ppm Frischluft

class MHZ19B {
private:
  HardwareSerial* serial;
  byte cmd[9] = {0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79};
  byte response[9];

public:
  MHZ19B(HardwareSerial* ser) : serial(ser) {}

  void begin() {
    serial->begin(9600);
    delay(100);
  }

  int readCO2() {
    serial->write(cmd, 9);
    delay(10);

    if (serial->available() >= 9) {
      serial->readBytes(response, 9);

      if (response[0] == 0xFF && response[1] == 0x86) {
        int co2 = (int)response[2] * 256 + (int)response[3];
        return co2;
      }
    }
    return -1; // Fehler
  }

  // Kalibrierung auf 400 ppm (Frischluft)
  void calibrateZeroPoint() {
    byte calibCmd[9] = {0xFF, 0x01, 0x87, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78};
    serial->write(calibCmd, 9);
    delay(100);
  }

  // Auto-Kalibrierung aktivieren/deaktivieren
  void setAutoCalibration(bool enable) {
    byte autoCalCmd[9] = {0xFF, 0x01, 0x79, enable ? 0xA0 : 0x00, 0x00, 0x00, 0x00, 0x00, 0x86};
    serial->write(autoCalCmd, 9);
    delay(100);
  }
};

// ========================================
// SCD30 CO2 Sensor (I2C)
// ========================================
// Messbereich: 400-10000 ppm
// Genauigkeit: ±30 ppm + 3% des Messwerts
// Pins: SDA, SCL (I2C)
// Zusätzlich: Temperatur, Luftfeuchtigkeit

#ifdef USE_SCD30
#include <SparkFun_SCD30_Arduino_Library.h>

class SCD30Sensor {
private:
  SCD30 sensor;

public:
  bool begin() {
    Wire.begin();
    return sensor.begin();
  }

  bool isAvailable() {
    return sensor.dataAvailable();
  }

  float readCO2() {
    if (sensor.dataAvailable()) {
      return sensor.getCO2();
    }
    return -1;
  }

  float readTemperature() {
    if (sensor.dataAvailable()) {
      return sensor.getTemperature();
    }
    return -1;
  }

  float readHumidity() {
    if (sensor.dataAvailable()) {
      return sensor.getHumidity();
    }
    return -1;
  }

  // Messintervall setzen (2-1800 Sekunden)
  void setMeasurementInterval(uint16_t interval) {
    sensor.setMeasurementInterval(interval);
  }

  // Temperatur-Offset für präzisere Messungen
  void setTemperatureOffset(float offset) {
    sensor.setTemperatureOffset(offset);
  }

  // Höhen-Kompensation (Meter über Meeresspiegel)
  void setAltitudeCompensation(uint16_t altitude) {
    sensor.setAltitudeCompensation(altitude);
  }

  // Forced Recalibration (auf bekannten CO2-Wert kalibrieren)
  void setForcedRecalibration(uint16_t co2ppm) {
    sensor.setForcedRecalibrationFactor(co2ppm);
  }
};
#endif

// ========================================
// Beispiel-Code für main.ino
// ========================================
/*

// MH-Z19B Beispiel:
#include "sensors/CO2_Sensors.h"
MHZ19B mhz19b(&Serial2);  // RX=GPIO16, TX=GPIO17

void setup() {
  Serial.begin(115200);
  mhz19b.begin();
  mhz19b.setAutoCalibration(true);  // Empfohlen
}

void loop() {
  int co2 = mhz19b.readCO2();
  if (co2 >= 0) {
    Serial.print("CO2: ");
    Serial.print(co2);
    Serial.println(" ppm");
  }
  delay(5000);
}

// SCD30 Beispiel:
#define USE_SCD30
#include "sensors/CO2_Sensors.h"
SCD30Sensor scd30;

void setup() {
  Serial.begin(115200);
  if (scd30.begin()) {
    scd30.setMeasurementInterval(2);  // 2 Sekunden
    scd30.setAltitudeCompensation(300);  // 300m Höhe
    Serial.println("SCD30 initialized");
  }
}

void loop() {
  if (scd30.isAvailable()) {
    float co2 = scd30.readCO2();
    float temp = scd30.readTemperature();
    float hum = scd30.readHumidity();

    Serial.print("CO2: "); Serial.print(co2); Serial.print(" ppm, ");
    Serial.print("Temp: "); Serial.print(temp); Serial.print(" °C, ");
    Serial.print("Hum: "); Serial.print(hum); Serial.println(" %");
  }
  delay(2000);
}

*/

// ========================================
// Pin-Belegung Empfehlungen
// ========================================
/*

ESP32:
  MH-Z19B:
    - RX Pin: GPIO 16 (Serial2 RX)
    - TX Pin: GPIO 17 (Serial2 TX)
    - VCC: 5V
    - GND: GND

  SCD30:
    - SDA: GPIO 21 (I2C SDA)
    - SCL: GPIO 22 (I2C SCL)
    - VCC: 3.3V oder 5V
    - GND: GND

*/

#endif // CO2_SENSORS_H
