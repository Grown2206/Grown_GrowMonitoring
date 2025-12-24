# ESP8266 für Grow Monitoring System

## Unterschiede zu ESP32

Der ESP8266 ist eine kostengünstige Alternative zum ESP32, hat aber einige Einschränkungen:

### Vorteile ESP8266
- ✅ Günstiger (~2-3€)
- ✅ Niedriger Stromverbrauch
- ✅ Ausreichend für einfache Sensor-Setups
- ✅ Große Community & viele Beispiele

### Nachteile ESP8266
- ❌ Nur 1x UART (nicht für mehrere UART-Sensoren geeignet)
- ❌ Nur 1x Analog Pin (ADC)
- ❌ Weniger GPIO Pins (max. 11 nutzbar)
- ❌ Weniger RAM (80KB vs 520KB ESP32)
- ❌ Keine echten Analog Inputs (nur 1x 10-bit ADC)
- ❌ 3.3V only (ESP32 hat mehr 5V-tolerante Pins)

## Empfohlene Sensor-Kombinationen

### Setup 1: Basis (4-5 Sensoren)
**Kosten: ~20-30€**
- ✅ DHT22 (Temperatur & Luftfeuchtigkeit) - GPIO 4
- ✅ Bodenfeuchtigkeit (1x analog) - A0
- ✅ I2C Hub für mehrere I2C Sensoren:
  - BH1750 (Licht) - SDA/SCL
  - Optional: SCD30 (CO2) - SDA/SCL
- ✅ Relais (2-4 Stück) - GPIO 12, 13, 14, 16
- ✅ Wasserstand (via I2C ADC Expander)

**Vorteile:**
- Alle wichtigen Basis-Sensoren
- Gut für 1-2 Pflanzen
- I2C ermöglicht viele Sensoren

### Setup 2: Erweitert mit Multiplexer
**Kosten: ~35-50€**
- ✅ Wie Setup 1
- ✅ **CD4051 Analog Multiplexer** (8:1)
  - Ermöglicht 8 analoge Sensoren am 1 ADC Pin
  - Steuerpins: GPIO 5, 12, 13
  - Signal Pin: A0
- ✅ 4x Bodenfeuchtigkeit
- ✅ pH Sensor
- ✅ TDS Sensor
- ✅ Wasserstand

**Vorteile:**
- Mehrere analoge Sensoren trotz 1 ADC
- Ideal für 2-4 Pflanzen

### Setup 3: Nur I2C Sensoren
**Kosten: ~40-60€**
- ✅ SCD30 (CO2 + Temp + Hum)
- ✅ VEML7700 (Licht/PAR)
- ✅ SGP30 (VOC + eCO2)
- ✅ BME680 (Temp, Hum, Pressure, Gas)
- ✅ ADS1115 (16-bit I2C ADC für 4x analoge Sensoren)
- ✅ PCF8574 (I2C GPIO Expander für 8 Relais)

**Vorteile:**
- Alle Sensoren über I2C
- Sehr sauber & modular
- Bis zu 127 I2C Geräte möglich

## Pin-Belegung ESP8266 (NodeMCU)

```
GPIO Mapping (NodeMCU Labels):
D0  = GPIO 16  - Wake from Deep Sleep, keine Interrupts
D1  = GPIO 5   - I2C SCL (empfohlen)
D2  = GPIO 4   - I2C SDA (empfohlen)
D3  = GPIO 0   - Flash Button, Boot Mode
D4  = GPIO 2   - LED, Boot Mode
D5  = GPIO 14  - SPI CLK
D6  = GPIO 12  - SPI MISO
D7  = GPIO 13  - SPI MOSI
D8  = GPIO 15  - SPI CS, Boot Mode
RX  = GPIO 3   - UART RX (Serial)
TX  = GPIO 1   - UART TX (Serial)
A0  = ADC0     - Analoger Input (0-1V, 10-bit)
```

### Empfohlene Pin-Nutzung

```
I2C Bus:
  SDA: D2 (GPIO 4)
  SCL: D1 (GPIO 5)

DHT22:
  Data: D4 (GPIO 2)

Relais (4x):
  Relay 1: D5 (GPIO 14)
  Relay 2: D6 (GPIO 12)
  Relay 3: D7 (GPIO 13)
  Relay 4: D8 (GPIO 15)

Analog Multiplexer (CD4051):
  Signal: A0
  S0: D5 (GPIO 14)
  S1: D6 (GPIO 12)
  S2: D7 (GPIO 13)

Single Analog Sensor:
  Signal: A0
```

## Beispiel-Code für ESP8266

### Basis-Setup (DHT22 + I2C Sensoren)

```cpp
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverIP = "192.168.1.100";

#define DHT_PIN 4  // D2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightSensor;
WebSocketsClient webSocket;

void setup() {
  Serial.begin(115200);

  // I2C initialisieren
  Wire.begin(4, 5);  // SDA=GPIO4, SCL=GPIO5

  dht.begin();
  lightSensor.begin();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  webSocket.begin(serverIP, 3001, "/ws");
}

void loop() {
  webSocket.loop();

  // Sensor-Daten lesen
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  float lux = lightSensor.readLightLevel();

  // JSON erstellen und senden
  StaticJsonDocument<256> doc;
  doc["type"] = "sensor_data";
  JsonObject data = doc.createNestedObject("data");
  data["temperature"] = temp;
  data["humidity"] = hum;
  data["light"] = lux;

  String output;
  serializeJson(doc, output);
  webSocket.sendTXT(output);

  delay(5000);
}
```

### Mit Analog Multiplexer (8 Sensoren an 1 ADC)

```cpp
#define MUX_S0 14  // D5
#define MUX_S1 12  // D6
#define MUX_S2 13  // D7
#define MUX_SIG A0

void setup() {
  pinMode(MUX_S0, OUTPUT);
  pinMode(MUX_S1, OUTPUT);
  pinMode(MUX_S2, OUTPUT);
}

int readMuxChannel(int channel) {
  // Kanal 0-7 auswählen
  digitalWrite(MUX_S0, bitRead(channel, 0));
  digitalWrite(MUX_S1, bitRead(channel, 1));
  digitalWrite(MUX_S2, bitRead(channel, 2));

  delay(10);  // Settling time
  return analogRead(MUX_SIG);
}

void loop() {
  // 4x Bodenfeuchtigkeit
  for (int i = 0; i < 4; i++) {
    int moisture = readMuxChannel(i);
    Serial.print("Moisture ");
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.println(moisture);
  }

  // pH Sensor an Kanal 4
  int ph_raw = readMuxChannel(4);

  // TDS Sensor an Kanal 5
  int tds_raw = readMuxChannel(5);

  // Wasserstand an Kanal 6
  int water_raw = readMuxChannel(6);

  delay(1000);
}
```

## Bibliotheken für ESP8266

Installieren über Arduino Library Manager:

```
- ESP8266WiFi (built-in)
- ESP8266WebServer (built-in)
- WebSockets by Links2004
- ArduinoJson by Benoit Blanchon
- DHT sensor library by Adafruit
- BH1750 by Christopher Laws
- Adafruit Sensor
- SparkFun SCD30 (optional)
- Adafruit SGP30 (optional)
- Adafruit ADS1X15 (für I2C ADC)
```

## Board-Manager URL

```
http://arduino.esp8266.com/stable/package_esp8266com_index.json
```

## Flash-Einstellungen (Arduino IDE)

```
Board: "NodeMCU 1.0 (ESP-12E Module)"
Upload Speed: 115200
CPU Frequency: 80 MHz (oder 160 MHz für mehr Performance)
Flash Size: "4MB (FS:2MB OTA:~1019KB)"
```

## I2C ADC Expander (ADS1115)

Wenn Sie mehr als 1 analogen Sensor benötigen:

```cpp
#include <Adafruit_ADS1X15.h>

Adafruit_ADS1115 ads;

void setup() {
  ads.begin();
  ads.setGain(GAIN_ONE);  // 0-4.096V
}

void loop() {
  int16_t adc0 = ads.readADC_SingleEnded(0);  // Kanal 0
  int16_t adc1 = ads.readADC_SingleEnded(1);  // Kanal 1
  int16_t adc2 = ads.readADC_SingleEnded(2);  // Kanal 2
  int16_t adc3 = ads.readADC_SingleEnded(3);  // Kanal 3

  // Umrechnung in Volt (bei GAIN_ONE)
  float voltage0 = adc0 * 0.125 / 1000.0;  // mV → V
}
```

## Deep Sleep für Batteriebetrieb

ESP8266 kann in Deep Sleep gehen um Strom zu sparen:

```cpp
// Verbinde GPIO16 (D0) mit RST Pin!

void loop() {
  // Sensoren lesen und senden
  readAndSendSensors();

  // 5 Minuten schlafen
  ESP.deepSleep(5 * 60 * 1000000);  // Microsekunden
}
```

**Stromverbrauch:**
- Aktiv: ~80mA
- Deep Sleep: ~20µA (0.02mA)
- Mit 18650 Batterie (3000mAh): ~6 Monate bei 5min Intervallen

## Limitierungen beim ESP8266

### ❌ Nicht möglich:
- PMS5003 (UART) gleichzeitig mit Serial Monitor
- Mehrere UART-Sensoren (MH-Z19B + PMS5003)
- Viele analoge Sensoren ohne Multiplexer/ADC
- > 4-5 Relais ohne GPIO Expander

### ✅ Alternativen:
- Software Serial für UART-Sensoren (instabil!)
- I2C ADC (ADS1115) für 4x 16-bit Analog
- I2C GPIO Expander (PCF8574) für 8 zusätzliche Pins
- Analog Multiplexer (CD4051) für 8x Analog
- SCD30 statt MH-Z19B (I2C statt UART)
- VEML7700 statt Analog LDR (I2C)

## Fazit

Der ESP8266 ist ideal für:
- ✅ Kleine Setups (1-2 Pflanzen)
- ✅ Budget-Projekte
- ✅ Batteriebetrieb
- ✅ Einfache Sensor-Kombinationen
- ✅ Nur I2C Sensoren

Verwenden Sie ESP32 wenn Sie brauchen:
- 🎯 Viele analoge Sensoren (>2)
- 🎯 Mehrere UART-Sensoren
- 🎯 Viele Relais (>4)
- 🎯 Komplexe Setups (>4 Pflanzen)
- 🎯 Mehr RAM für Features
- 🎯 Bluetooth zusätzlich zu WiFi

## Hilfe & Support

Bei Problemen mit ESP8266:
1. Prüfen Sie die Stromversorgung (min. 500mA!)
2. Verwenden Sie einen Level Shifter für 5V Sensoren
3. Nutzen Sie I2C wo möglich
4. Flashen Sie mit 115200 Baud (nicht 921600)
5. Aktivieren Sie Exceptions Debug in Arduino IDE
