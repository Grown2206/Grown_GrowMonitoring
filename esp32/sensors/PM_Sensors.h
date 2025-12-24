/*
 * Feinstaub (Particulate Matter) Sensoren für Grow Monitoring System
 *
 * Unterstützte Sensoren:
 * - PMS5003 (UART) - PM1.0, PM2.5, PM10
 * - PMS7003 (UART) - PM1.0, PM2.5, PM10
 * - SDS011 (UART) - PM2.5, PM10
 * - GP2Y1010AU0F (Analog) - Einfacher Staub-Sensor
 *
 * Verwendete Bibliotheken:
 * - PMS Library: "PMS Library" by Mariusz Kacki (optional)
 * - Custom UART implementation (included below)
 *
 * Wichtigkeit für Grow-Räume:
 * - PM2.5 kann Pflanzen-Stomata blockieren
 * - Hinweis auf Luftfilter-Wartung
 * - Schimmel-Sporen Detektion
 */

#ifndef PM_SENSORS_H
#define PM_SENSORS_H

#include <Arduino.h>

// ========================================
// PMS5003 / PMS7003 Particulate Matter Sensor (UART)
// ========================================
// Messbereich: PM1.0, PM2.5, PM10 (0-500 µg/m³)
// Genauigkeit: ±10%
// Pins: TX, RX, SET (optional), RESET (optional)

class PMS5003Sensor {
private:
  HardwareSerial* serial;
  uint8_t buffer[32];

  struct PMSData {
    uint16_t pm1_0_standard;
    uint16_t pm2_5_standard;
    uint16_t pm10_standard;
    uint16_t pm1_0_atmospheric;
    uint16_t pm2_5_atmospheric;
    uint16_t pm10_atmospheric;
    uint16_t particles_0_3um;
    uint16_t particles_0_5um;
    uint16_t particles_1_0um;
    uint16_t particles_2_5um;
    uint16_t particles_5_0um;
    uint16_t particles_10um;
  } data;

  bool dataValid;

public:
  PMS5003Sensor(HardwareSerial* ser) : serial(ser), dataValid(false) {
    memset(&data, 0, sizeof(data));
  }

  void begin() {
    serial->begin(9600);
    delay(100);
  }

  // Aktiv-Modus (Sensor sendet kontinuierlich)
  void setActiveMode() {
    uint8_t cmd[] = {0x42, 0x4D, 0xE1, 0x00, 0x01, 0x01, 0x71};
    serial->write(cmd, sizeof(cmd));
  }

  // Passiv-Modus (Sensor sendet nur auf Anfrage)
  void setPassiveMode() {
    uint8_t cmd[] = {0x42, 0x4D, 0xE1, 0x00, 0x00, 0x01, 0x70};
    serial->write(cmd, sizeof(cmd));
  }

  // Sensor aufwecken
  void wakeUp() {
    uint8_t cmd[] = {0x42, 0x4D, 0xE4, 0x00, 0x01, 0x01, 0x74};
    serial->write(cmd, sizeof(cmd));
  }

  // Sensor schlafen legen (Stromsparen)
  void sleep() {
    uint8_t cmd[] = {0x42, 0x4D, 0xE4, 0x00, 0x00, 0x01, 0x73};
    serial->write(cmd, sizeof(cmd));
  }

  // Daten anfordern (im Passiv-Modus)
  void requestRead() {
    uint8_t cmd[] = {0x42, 0x4D, 0xE2, 0x00, 0x00, 0x01, 0x71};
    serial->write(cmd, sizeof(cmd));
  }

  // Daten lesen
  bool read() {
    while (serial->available() > 0) {
      if (serial->peek() != 0x42) {
        serial->read();
        continue;
      }

      if (serial->available() < 32) {
        return false;
      }

      serial->readBytes(buffer, 32);

      // Prüfe Header
      if (buffer[0] != 0x42 || buffer[1] != 0x4D) {
        return false;
      }

      // Prüfe Checksum
      uint16_t checksum = 0;
      for (int i = 0; i < 30; i++) {
        checksum += buffer[i];
      }
      uint16_t receivedChecksum = (buffer[30] << 8) | buffer[31];

      if (checksum != receivedChecksum) {
        return false;
      }

      // Parse Daten
      data.pm1_0_standard = (buffer[4] << 8) | buffer[5];
      data.pm2_5_standard = (buffer[6] << 8) | buffer[7];
      data.pm10_standard = (buffer[8] << 8) | buffer[9];
      data.pm1_0_atmospheric = (buffer[10] << 8) | buffer[11];
      data.pm2_5_atmospheric = (buffer[12] << 8) | buffer[13];
      data.pm10_atmospheric = (buffer[14] << 8) | buffer[15];
      data.particles_0_3um = (buffer[16] << 8) | buffer[17];
      data.particles_0_5um = (buffer[18] << 8) | buffer[19];
      data.particles_1_0um = (buffer[20] << 8) | buffer[21];
      data.particles_2_5um = (buffer[22] << 8) | buffer[23];
      data.particles_5_0um = (buffer[24] << 8) | buffer[25];
      data.particles_10um = (buffer[26] << 8) | buffer[27];

      dataValid = true;
      return true;
    }

    return false;
  }

  // Getter Methoden - Standard Concentration (µg/m³)
  uint16_t getPM1_0() { return dataValid ? data.pm1_0_standard : 0; }
  uint16_t getPM2_5() { return dataValid ? data.pm2_5_standard : 0; }
  uint16_t getPM10() { return dataValid ? data.pm10_standard : 0; }

  // Getter Methoden - Atmospheric Concentration (µg/m³)
  uint16_t getPM1_0_Atm() { return dataValid ? data.pm1_0_atmospheric : 0; }
  uint16_t getPM2_5_Atm() { return dataValid ? data.pm2_5_atmospheric : 0; }
  uint16_t getPM10_Atm() { return dataValid ? data.pm10_atmospheric : 0; }

  // Partikel-Anzahl (pro 0.1L Luft)
  uint16_t getParticles_0_3um() { return dataValid ? data.particles_0_3um : 0; }
  uint16_t getParticles_0_5um() { return dataValid ? data.particles_0_5um : 0; }
  uint16_t getParticles_1_0um() { return dataValid ? data.particles_1_0um : 0; }
  uint16_t getParticles_2_5um() { return dataValid ? data.particles_2_5um : 0; }
  uint16_t getParticles_5_0um() { return dataValid ? data.particles_5_0um : 0; }
  uint16_t getParticles_10um() { return dataValid ? data.particles_10um : 0; }

  // Air Quality Index berechnen (US EPA Standard)
  uint16_t getAQI() {
    if (!dataValid) return 0;

    uint16_t pm25 = data.pm2_5_atmospheric;

    // US EPA AQI Breakpoints für PM2.5
    if (pm25 <= 12) return map(pm25, 0, 12, 0, 50);        // Good
    if (pm25 <= 35) return map(pm25, 13, 35, 51, 100);     // Moderate
    if (pm25 <= 55) return map(pm25, 36, 55, 101, 150);    // Unhealthy for Sensitive
    if (pm25 <= 150) return map(pm25, 56, 150, 151, 200);  // Unhealthy
    if (pm25 <= 250) return map(pm25, 151, 250, 201, 300); // Very Unhealthy
    return map(min(pm25, (uint16_t)500), 251, 500, 301, 500); // Hazardous
  }

  // AQI Kategorie als String
  const char* getAQICategory() {
    uint16_t aqi = getAQI();
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  }

  bool isDataValid() { return dataValid; }
};

// ========================================
// SDS011 Particulate Matter Sensor (UART)
// ========================================
// Nur PM2.5 und PM10
// Genauigkeit: ±10%

class SDS011Sensor {
private:
  HardwareSerial* serial;
  uint8_t buffer[10];
  uint16_t pm25;
  uint16_t pm10;
  bool dataValid;

public:
  SDS011Sensor(HardwareSerial* ser) : serial(ser), pm25(0), pm10(0), dataValid(false) {}

  void begin() {
    serial->begin(9600);
    delay(100);
  }

  bool read() {
    while (serial->available() > 0) {
      if (serial->peek() != 0xAA) {
        serial->read();
        continue;
      }

      if (serial->available() < 10) {
        return false;
      }

      serial->readBytes(buffer, 10);

      // Prüfe Header und Tail
      if (buffer[0] != 0xAA || buffer[9] != 0xAB) {
        return false;
      }

      // Prüfe Checksum
      uint8_t checksum = 0;
      for (int i = 2; i < 8; i++) {
        checksum += buffer[i];
      }
      if (checksum != buffer[8]) {
        return false;
      }

      // Parse Daten (Werte in 0.1 µg/m³)
      pm25 = ((uint16_t)buffer[3] << 8) | buffer[2];
      pm10 = ((uint16_t)buffer[5] << 8) | buffer[4];

      dataValid = true;
      return true;
    }
    return false;
  }

  // PM2.5 in µg/m³
  float getPM2_5() { return dataValid ? (pm25 / 10.0) : 0; }

  // PM10 in µg/m³
  float getPM10() { return dataValid ? (pm10 / 10.0) : 0; }

  // Sleep Mode
  void sleep() {
    uint8_t cmd[] = {0xAA, 0xB4, 0x06, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x05, 0xAB};
    serial->write(cmd, sizeof(cmd));
  }

  // Wake Up
  void wakeUp() {
    uint8_t cmd[] = {0xAA, 0xB4, 0x06, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x06, 0xAB};
    serial->write(cmd, sizeof(cmd));
  }
};

// ========================================
// GP2Y1010AU0F Optischer Staub-Sensor (Analog)
// ========================================
// Einfacher, günstiger Staub-Sensor
// Pins: Analog Out, LED, VCC, GND

class GP2Y1010Sensor {
private:
  uint8_t analogPin;
  uint8_t ledPin;
  uint16_t samplingTime;
  uint16_t deltaTime;
  uint16_t sleepTime;
  float vRef;

public:
  GP2Y1010Sensor(uint8_t aPin, uint8_t lPin)
    : analogPin(aPin),
      ledPin(lPin),
      samplingTime(280),  // µs
      deltaTime(40),      // µs
      sleepTime(9680),    // µs
      vRef(3.3) {}

  void begin() {
    pinMode(analogPin, INPUT);
    pinMode(ledPin, OUTPUT);
  }

  // Rohwert auslesen
  float readVoltage() {
    digitalWrite(ledPin, LOW);
    delayMicroseconds(samplingTime);

    int raw = analogRead(analogPin);

    delayMicroseconds(deltaTime);
    digitalWrite(ledPin, HIGH);
    delayMicroseconds(sleepTime);

    return (raw / 4095.0) * vRef;
  }

  // Staub-Dichte in µg/m³ (Näherung)
  float readDustDensity() {
    float voltage = readVoltage();

    // Empirische Formel: Dust Density (µg/m³) = (V - 0.6) * 170
    float dustDensity = 0;
    if (voltage >= 0.6) {
      dustDensity = (voltage - 0.6) * 170;
    }

    return max(0.0f, dustDensity);
  }

  // Mehrere Messungen mitteln
  float readDustDensityAvg(int samples = 10) {
    float sum = 0;
    for (int i = 0; i < samples; i++) {
      sum += readDustDensity();
      delay(100);
    }
    return sum / samples;
  }
};

// ========================================
// Beispiel-Code
// ========================================
/*

// PMS5003 Beispiel:
#include "sensors/PM_Sensors.h"
PMS5003Sensor pmsSensor(&Serial2);  // RX=GPIO16, TX=GPIO17

void setup() {
  Serial.begin(115200);
  pmsSensor.begin();
  pmsSensor.setActiveMode();
  pmsSensor.wakeUp();
  delay(1000);
}

void loop() {
  if (pmsSensor.read()) {
    uint16_t pm1 = pmsSensor.getPM1_0();
    uint16_t pm25 = pmsSensor.getPM2_5();
    uint16_t pm10 = pmsSensor.getPM10();
    uint16_t aqi = pmsSensor.getAQI();

    Serial.print("PM1.0: "); Serial.print(pm1); Serial.print(" µg/m³, ");
    Serial.print("PM2.5: "); Serial.print(pm25); Serial.print(" µg/m³, ");
    Serial.print("PM10: "); Serial.print(pm10); Serial.print(" µg/m³, ");
    Serial.print("AQI: "); Serial.print(aqi);
    Serial.print(" ("); Serial.print(pmsSensor.getAQICategory()); Serial.println(")");
  }

  delay(1000);
}

// GP2Y1010 Beispiel:
#include "sensors/PM_Sensors.h"
GP2Y1010Sensor dustSensor(34, 25);  // Analog=GPIO34, LED=GPIO25

void setup() {
  Serial.begin(115200);
  dustSensor.begin();
}

void loop() {
  float density = dustSensor.readDustDensityAvg(10);

  Serial.print("Dust Density: ");
  Serial.print(density);
  Serial.println(" µg/m³");

  delay(5000);
}

*/

// ========================================
// PM2.5 Grenzwerte (WHO)
// ========================================
/*

WHO Air Quality Guidelines (2021):
  PM2.5:
    - Annual: 5 µg/m³
    - 24-hour: 15 µg/m³

  PM10:
    - Annual: 15 µg/m³
    - 24-hour: 45 µg/m³

US EPA Standards:
  PM2.5:
    - 0-12: Good
    - 12-35: Moderate
    - 35-55: Unhealthy for Sensitive Groups
    - 55-150: Unhealthy
    - 150-250: Very Unhealthy
    - 250+: Hazardous

Für Grow-Räume:
  - < 10 µg/m³: Optimal
  - 10-25 µg/m³: Akzeptabel
  - 25-50 µg/m³: Filter prüfen
  - > 50 µg/m³: Filter wechseln!

*/

// ========================================
// Pin-Belegung
// ========================================
/*

ESP32:
  PMS5003/PMS7003:
    - RX Pin: GPIO 16 (Serial2 RX)
    - TX Pin: GPIO 17 (Serial2 TX)
    - VCC: 5V
    - GND: GND
    - SET: Optional (HIGH=active, LOW=sleep)
    - RESET: Optional (LOW=reset)

  SDS011:
    - RX Pin: GPIO 16 (Serial2 RX)
    - TX Pin: GPIO 17 (Serial2 TX)
    - VCC: 5V
    - GND: GND

  GP2Y1010AU0F:
    - Analog Out: GPIO 34
    - LED: GPIO 25
    - VCC: 5V
    - GND: GND
    - 150Ω Widerstand zwischen LED und GPIO
    - 220µF Kondensator zwischen VCC und GND

*/

#endif // PM_SENSORS_H
