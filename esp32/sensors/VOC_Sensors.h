/*
 * VOC & Luftqualitäts-Sensoren für Grow Monitoring System
 *
 * Unterstützte Sensoren:
 * - SGP30 (I2C) - VOC & eCO2
 * - CCS811 (I2C) - VOC & eCO2
 * - BME680 (I2C) - VOC, Temp, Humidity, Pressure
 * - MQ-135 (Analog) - Luftqualität (NH3, NOx, CO2, etc.)
 *
 * Verwendete Bibliotheken:
 * - SGP30: "Adafruit SGP30 Sensor" by Adafruit
 * - CCS811: "Adafruit CCS811 Library" by Adafruit
 * - BME680: "Adafruit BME680 Library" by Adafruit
 *
 * VOC (Volatile Organic Compounds):
 * - Wichtig für Luftqualität in Grow-Räumen
 * - Hohe VOC-Werte können auf Schimmel oder Probleme hinweisen
 */

#ifndef VOC_SENSORS_H
#define VOC_SENSORS_H

#include <Arduino.h>

// ========================================
// SGP30 VOC & eCO2 Sensor (I2C)
// ========================================
// VOC: 0-60,000 ppb
// eCO2: 400-60,000 ppm (berechnet aus VOC)
// Pins: SDA, SCL

#ifdef USE_SGP30
#include <Adafruit_SGP30.h>

class SGP30Sensor {
private:
  Adafruit_SGP30 sensor;
  uint32_t lastBaselineSave;
  uint16_t baseline_eCO2;
  uint16_t baseline_TVOC;

public:
  SGP30Sensor() : lastBaselineSave(0), baseline_eCO2(0), baseline_TVOC(0) {}

  bool begin() {
    if (sensor.begin()) {
      // Initialize IAQ (Indoor Air Quality) algorithm
      Serial.println("SGP30 found");
      Serial.print("Serial #");
      Serial.print(sensor.serialnumber[0], HEX);
      Serial.print(sensor.serialnumber[1], HEX);
      Serial.println(sensor.serialnumber[2], HEX);
      return true;
    }
    return false;
  }

  // Messung durchführen (muss alle 1 Sekunde aufgerufen werden!)
  bool measure() {
    return sensor.IAQmeasure();
  }

  // TVOC in ppb (parts per billion)
  uint16_t readTVOC() {
    return sensor.TVOC;
  }

  // eCO2 in ppm (estimated, berechnet aus VOC)
  uint16_t readeCO2() {
    return sensor.eCO2;
  }

  // Raw H2 Signal
  uint16_t readRawH2() {
    if (sensor.IAQmeasureRaw()) {
      return sensor.rawH2;
    }
    return 0;
  }

  // Raw Ethanol Signal
  uint16_t readRawEthanol() {
    if (sensor.IAQmeasureRaw()) {
      return sensor.rawEthanol;
    }
    return 0;
  }

  // Baseline speichern (alle 12 Stunden empfohlen)
  void saveBaseline() {
    if (sensor.getIAQBaseline(&baseline_eCO2, &baseline_TVOC)) {
      Serial.print("Baseline eCO2: 0x");
      Serial.print(baseline_eCO2, HEX);
      Serial.print(" TVOC: 0x");
      Serial.println(baseline_TVOC, HEX);
      lastBaselineSave = millis();
    }
  }

  // Baseline wiederherstellen (nach Neustart)
  void restoreBaseline(uint16_t eCO2_base, uint16_t TVOC_base) {
    sensor.setIAQBaseline(eCO2_base, TVOC_base);
  }

  // Auto-Baseline Management
  void updateBaseline() {
    // Speichere Baseline alle 12 Stunden
    if (millis() - lastBaselineSave > 43200000) {
      saveBaseline();
    }
  }

  // Absolute Humidity setzen (für bessere Genauigkeit)
  // absoluteHumidity in g/m³
  void setHumidity(float temperature, float relativeHumidity) {
    float absoluteHumidity = 216.7f * ((relativeHumidity / 100.0f) * 6.112f *
                                       exp((17.62f * temperature) / (243.12f + temperature)) /
                                       (273.15f + temperature));
    uint32_t ah = (uint32_t)(absoluteHumidity * 1000);
    sensor.setHumidity(ah);
  }
};
#endif

// ========================================
// CCS811 VOC & eCO2 Sensor (I2C)
// ========================================
// VOC: 0-1187 ppb
// eCO2: 400-8192 ppm
// Pins: SDA, SCL, (optional: WAKE, INT, RST)

#ifdef USE_CCS811
#include <Adafruit_CCS811.h>

class CCS811Sensor {
private:
  Adafruit_CCS811 sensor;

public:
  bool begin(uint8_t addr = CCS811_ADDRESS) {
    if (sensor.begin(addr)) {
      // Warte bis Sensor bereit (20 Minuten beim ersten Start)
      while (!sensor.available()) {
        delay(500);
      }
      return true;
    }
    return false;
  }

  bool isAvailable() {
    return sensor.available();
  }

  bool readData() {
    return sensor.readData() == 0;
  }

  // eCO2 in ppm
  uint16_t readeCO2() {
    return sensor.geteCO2();
  }

  // TVOC in ppb
  uint16_t readTVOC() {
    return sensor.getTVOC();
  }

  // Temperatur & Luftfeuchtigkeit setzen (für Kompensation)
  void setEnvironmentalData(float humidity, float temperature) {
    sensor.setEnvironmentalData((uint8_t)humidity, temperature);
  }

  // Drive Mode setzen (1, 2, 3, 4)
  // Mode 1: 1 Messung/Sekunde
  // Mode 2: 1 Messung/10 Sekunden
  // Mode 3: 1 Messung/60 Sekunden
  // Mode 4: RAW mode
  void setDriveMode(uint8_t mode) {
    sensor.setDriveMode(mode);
  }

  // Baseline speichern
  uint16_t getBaseline() {
    return sensor.getBaseline();
  }

  void setBaseline(uint16_t baseline) {
    sensor.setBaseline(baseline);
  }
};
#endif

// ========================================
// BME680 Multi-Sensor (I2C/SPI)
// ========================================
// VOC (Gas Resistance), Temp, Humidity, Pressure
// Pins: SDA, SCL

#ifdef USE_BME680
#include <Adafruit_BME680.h>

class BME680Sensor {
private:
  Adafruit_BME680 sensor;

public:
  bool begin(uint8_t addr = BME680_DEFAULT_ADDRESS) {
    if (sensor.begin(addr)) {
      // Standard-Einstellungen für Indoor Air Quality
      sensor.setTemperatureOversampling(BME680_OS_8X);
      sensor.setHumidityOversampling(BME680_OS_2X);
      sensor.setPressureOversampling(BME680_OS_4X);
      sensor.setIIRFilterSize(BME680_FILTER_SIZE_3);
      sensor.setGasHeater(320, 150);  // 320°C for 150ms
      return true;
    }
    return false;
  }

  bool performReading() {
    return sensor.performReading();
  }

  float readTemperature() {
    return sensor.temperature;
  }

  float readHumidity() {
    return sensor.humidity;
  }

  float readPressure() {
    return sensor.pressure / 100.0;  // hPa
  }

  // Gas Resistance in Ohm
  // Höherer Widerstand = bessere Luftqualität
  uint32_t readGasResistance() {
    return sensor.gas_resistance;
  }

  // Vereinfachter Air Quality Index (0-500)
  // Basierend auf Gas Resistance
  float readAirQualityIndex() {
    uint32_t gas = sensor.gas_resistance;

    // Typischer Bereich: 10k - 300k Ohm
    // Umrechnung in Index (höher = besser)
    if (gas > 300000) return 500;  // Excellent
    if (gas > 150000) return 400;  // Good
    if (gas > 100000) return 300;  // Moderate
    if (gas > 50000) return 200;   // Poor
    if (gas > 10000) return 100;   // Bad
    return 50;  // Very Bad
  }

  // Altitude berechnen (aus Druck)
  float readAltitude(float seaLevelPressure = 1013.25) {
    return sensor.readAltitude(seaLevelPressure);
  }
};
#endif

// ========================================
// MQ-135 Luftqualitäts-Sensor (Analog)
// ========================================
// Erkennt: CO2, NH3, NOx, Alkohol, Benzol, Rauch
// Pins: Analog Output, VCC (5V), GND

class MQ135Sensor {
private:
  uint8_t pin;
  float rLoadResistance;  // Load Resistance in kΩ (typisch 10kΩ)
  float rZero;            // Sensor Resistance in sauberer Luft (Kalibrierung)

public:
  MQ135Sensor(uint8_t analogPin, float loadResistance = 10.0)
    : pin(analogPin), rLoadResistance(loadResistance), rZero(76.63) {}

  void begin() {
    pinMode(pin, INPUT);
  }

  // Raw ADC Wert
  int readRaw() {
    return analogRead(pin);
  }

  // Sensor Resistance berechnen
  float readResistance() {
    int raw = readRaw();
    return ((4095.0 / (float)raw) - 1.0) * rLoadResistance;
  }

  // CO2 in ppm (Näherung)
  float readCO2() {
    float rs = readResistance();
    float ratio = rs / rZero;
    // Empirische Formel für CO2
    float ppm = 116.6020682 * pow(ratio, -2.769034857);
    return ppm;
  }

  // Allgemeiner Air Quality PPM
  float readPPM() {
    float rs = readResistance();
    float ratio = rs / rZero;
    return pow(10, ((log10(ratio) - 0.04) / -0.45));
  }

  // Kalibrierung in sauberer Luft (400 ppm CO2)
  void calibrate() {
    float sum = 0;
    for (int i = 0; i < 50; i++) {
      sum += readResistance();
      delay(100);
    }
    rZero = sum / 50.0;
    Serial.print("MQ135 calibrated, RZero: ");
    Serial.println(rZero);
  }

  void setRZero(float rzero) {
    rZero = rzero;
  }
};

// ========================================
// Beispiel-Code
// ========================================
/*

// SGP30 Beispiel:
#define USE_SGP30
#include "sensors/VOC_Sensors.h"
SGP30Sensor vocSensor;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (vocSensor.begin()) {
    Serial.println("SGP30 initialized");
  }
}

unsigned long lastMeasurement = 0;

void loop() {
  // WICHTIG: Muss jede Sekunde aufgerufen werden!
  if (millis() - lastMeasurement >= 1000) {
    lastMeasurement = millis();

    if (vocSensor.measure()) {
      uint16_t tvoc = vocSensor.readTVOC();
      uint16_t eco2 = vocSensor.readeCO2();

      Serial.print("TVOC: "); Serial.print(tvoc); Serial.print(" ppb, ");
      Serial.print("eCO2: "); Serial.print(eco2); Serial.println(" ppm");
    }

    // Baseline Management
    vocSensor.updateBaseline();
  }
}

// MQ-135 Beispiel:
#include "sensors/VOC_Sensors.h"
MQ135Sensor airQuality(34);  // GPIO 34

void setup() {
  Serial.begin(115200);
  airQuality.begin();

  // Kalibrierung in sauberer Luft (einmalig, 24h vorheizen!)
  // airQuality.calibrate();

  // Oder gespeicherten RZero Wert verwenden:
  airQuality.setRZero(76.63);
}

void loop() {
  float co2 = airQuality.readCO2();
  float ppm = airQuality.readPPM();

  Serial.print("CO2: "); Serial.print(co2); Serial.print(" ppm, ");
  Serial.print("Air Quality: "); Serial.print(ppm); Serial.println(" ppm");

  delay(2000);
}

*/

// ========================================
// Wichtige Hinweise
// ========================================
/*

SGP30:
  - Muss JEDE SEKUNDE ausgelesen werden!
  - Braucht ~12 Stunden zum "Einbrennen" (first use)
  - Baseline alle 12h speichern (z.B. EEPROM)
  - Humidity Compensation für bessere Genauigkeit

CCS811:
  - Beim ersten Start: 20 Minuten Aufwärmzeit!
  - Dann: 48 Stunden "Burn-in" für beste Genauigkeit
  - Environmental Data setzen für Kompensation

BME680:
  - Gas Heater verbraucht viel Strom (~100mA)
  - Messung dauert ~170ms
  - Für stabile Werte: mehrere Messungen mitteln

MQ-135:
  - 24-48 Stunden Vorheizen vor Kalibrierung!
  - 5V Versorgung erforderlich
  - Hoher Stromverbrauch (~150mA)
  - Nicht für präzise CO2-Messungen geeignet

*/

// ========================================
// Pin-Belegung
// ========================================
/*

ESP32:
  I2C Sensoren (SGP30, CCS811, BME680):
    - SDA: GPIO 21
    - SCL: GPIO 22
    - VCC: 3.3V oder 5V (sensor-abhängig)
    - GND: GND

  MQ-135 (Analog):
    - Signal: GPIO 34, 35, 36, oder 39
    - VCC: 5V
    - GND: GND

*/

#endif // VOC_SENSORS_H
