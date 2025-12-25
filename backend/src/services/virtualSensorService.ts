import VirtualSensor, { VirtualSensorType } from '../models/VirtualSensor';
import { SensorData, Sensor } from '../models';
import { Op } from 'sequelize';

interface VirtualSensorConfig {
  sourceSensorIds: number[];
  params?: Record<string, any>;
}

interface CalculationResult {
  value: number;
  timestamp: Date;
}

/**
 * Virtual Sensor Calculation Service
 * Computes derived metrics from physical sensor data
 */
export class VirtualSensorService {
  /**
   * Calculate VPD (Vapor Pressure Deficit) in kPa
   * VPD = SVP - AVP
   * SVP = 0.61078 * exp((17.27 * T) / (T + 237.3))
   * AVP = SVP * (RH / 100)
   */
  private static calculateVPD(temperature: number, humidity: number): number {
    const svp = 0.61078 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    const avp = svp * (humidity / 100);
    const vpd = svp - avp;
    return Math.round(vpd * 100) / 100; // Round to 2 decimals
  }

  /**
   * Calculate Dew Point in °C
   * Dew Point = (237.3 * α) / (17.27 - α)
   * where α = ln(RH/100) + (17.27 * T) / (237.3 + T)
   */
  private static calculateDewPoint(temperature: number, humidity: number): number {
    const alpha =
      Math.log(humidity / 100) + (17.27 * temperature) / (237.3 + temperature);
    const dewPoint = (237.3 * alpha) / (17.27 - alpha);
    return Math.round(dewPoint * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate Heat Index in °C
   * Simplified formula for temperatures > 27°C
   */
  private static calculateHeatIndex(temperature: number, humidity: number): number {
    if (temperature < 27) {
      return temperature; // Heat index not applicable below 27°C
    }

    // Convert to Fahrenheit for calculation
    const T = temperature * 9/5 + 32;
    const RH = humidity;

    // Rothfusz regression
    const HI = -42.379 +
      2.04901523 * T +
      10.14333127 * RH -
      0.22475541 * T * RH -
      6.83783e-3 * T * T -
      5.481717e-2 * RH * RH +
      1.22874e-3 * T * T * RH +
      8.5282e-4 * T * RH * RH -
      1.99e-6 * T * T * RH * RH;

    // Convert back to Celsius
    const hiCelsius = (HI - 32) * 5/9;
    return Math.round(hiCelsius * 10) / 10;
  }

  /**
   * Calculate Absolute Humidity in g/m³
   * AH = (6.112 * exp((17.67 * T) / (T + 243.5)) * RH * 2.1674) / (273.15 + T)
   */
  private static calculateAbsoluteHumidity(
    temperature: number,
    humidity: number
  ): number {
    const ah =
      (6.112 *
        Math.exp((17.67 * temperature) / (temperature + 243.5)) *
        humidity *
        2.1674) /
      (273.15 + temperature);
    return Math.round(ah * 10) / 10;
  }

  /**
   * Calculate DLI (Daily Light Integral) in mol/m²/day
   * DLI = (PAR * seconds) / 1,000,000
   * Requires PAR readings over the last 24 hours
   */
  private static async calculateDLI(
    parSensorId: number,
    timestamp: Date
  ): Promise<number> {
    const oneDayAgo = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);

    const parReadings = await SensorData.findAll({
      where: {
        sensorId: parSensorId,
        timestamp: {
          [Op.gte]: oneDayAgo,
          [Op.lte]: timestamp,
        },
      },
      order: [['timestamp', 'ASC']],
    });

    if (parReadings.length < 2) {
      return 0; // Not enough data
    }

    let totalMoles = 0;

    // Integrate PAR over time using trapezoidal rule
    for (let i = 1; i < parReadings.length; i++) {
      const prev = parReadings[i - 1];
      const curr = parReadings[i];

      const timeDiffSeconds =
        (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) /
        1000;

      const avgPAR = ((prev.par || 0) + (curr.par || 0)) / 2;

      // Convert PAR (μmol/m²/s) to moles
      totalMoles += (avgPAR * timeDiffSeconds) / 1_000_000;
    }

    return Math.round(totalMoles * 100) / 100;
  }

  /**
   * Get latest sensor reading value
   */
  private static async getLatestSensorValue(
    sensorId: number,
    field: keyof SensorData
  ): Promise<number | null> {
    const reading = await SensorData.findOne({
      where: { sensorId },
      order: [['timestamp', 'DESC']],
      limit: 1,
    });

    if (!reading) return null;

    const value = reading[field];
    return typeof value === 'number' ? value : null;
  }

  /**
   * Calculate virtual sensor value based on type
   */
  static async calculateValue(
    virtualSensor: VirtualSensor
  ): Promise<CalculationResult | null> {
    const config: VirtualSensorConfig = JSON.parse(virtualSensor.config);
    const { sourceSensorIds } = config;
    const timestamp = new Date();

    try {
      let value: number;

      switch (virtualSensor.type) {
        case 'vpd': {
          // Requires temperature and humidity sensors
          if (sourceSensorIds.length < 2) {
            throw new Error('VPD requires 2 sensors: temperature and humidity');
          }

          const temperature = await this.getLatestSensorValue(
            sourceSensorIds[0],
            'temperature'
          );
          const humidity = await this.getLatestSensorValue(
            sourceSensorIds[1],
            'humidity'
          );

          if (temperature === null || humidity === null) {
            return null; // Missing data
          }

          value = this.calculateVPD(temperature, humidity);
          break;
        }

        case 'dew_point': {
          if (sourceSensorIds.length < 2) {
            throw new Error('Dew Point requires 2 sensors: temperature and humidity');
          }

          const temperature = await this.getLatestSensorValue(
            sourceSensorIds[0],
            'temperature'
          );
          const humidity = await this.getLatestSensorValue(
            sourceSensorIds[1],
            'humidity'
          );

          if (temperature === null || humidity === null) {
            return null;
          }

          value = this.calculateDewPoint(temperature, humidity);
          break;
        }

        case 'heat_index': {
          if (sourceSensorIds.length < 2) {
            throw new Error('Heat Index requires 2 sensors: temperature and humidity');
          }

          const temperature = await this.getLatestSensorValue(
            sourceSensorIds[0],
            'temperature'
          );
          const humidity = await this.getLatestSensorValue(
            sourceSensorIds[1],
            'humidity'
          );

          if (temperature === null || humidity === null) {
            return null;
          }

          value = this.calculateHeatIndex(temperature, humidity);
          break;
        }

        case 'absolute_humidity': {
          if (sourceSensorIds.length < 2) {
            throw new Error(
              'Absolute Humidity requires 2 sensors: temperature and humidity'
            );
          }

          const temperature = await this.getLatestSensorValue(
            sourceSensorIds[0],
            'temperature'
          );
          const humidity = await this.getLatestSensorValue(
            sourceSensorIds[1],
            'humidity'
          );

          if (temperature === null || humidity === null) {
            return null;
          }

          value = this.calculateAbsoluteHumidity(temperature, humidity);
          break;
        }

        case 'dli': {
          if (sourceSensorIds.length < 1) {
            throw new Error('DLI requires 1 sensor: PAR');
          }

          value = await this.calculateDLI(sourceSensorIds[0], timestamp);
          break;
        }

        case 'custom': {
          // TODO: Implement safe formula evaluation
          throw new Error('Custom formulas not yet implemented');
        }

        default:
          throw new Error(`Unknown virtual sensor type: ${virtualSensor.type}`);
      }

      return { value, timestamp };
    } catch (error) {
      console.error(
        `Error calculating virtual sensor ${virtualSensor.id}:`,
        error
      );
      return null;
    }
  }

  /**
   * Calculate and store value for a virtual sensor
   */
  static async updateVirtualSensor(
    virtualSensor: VirtualSensor
  ): Promise<boolean> {
    const result = await this.calculateValue(virtualSensor);

    if (!result) {
      return false; // Calculation failed or missing data
    }

    const { value, timestamp } = result;

    // Update virtual sensor record
    await virtualSensor.update({
      lastValue: value,
      lastCalculated: timestamp,
    });

    // Store as sensor data (reuse existing table)
    await SensorData.create({
      sensorId: virtualSensor.sensorId,
      moistureLevel: 0, // Not applicable for virtual sensors
      timestamp,
      // Map value to appropriate field based on type
      ...(virtualSensor.type === 'vpd' && { voc: value }), // Store VPD in voc field temporarily
      ...(virtualSensor.type === 'dew_point' && { temperature: value }),
      ...(virtualSensor.type === 'heat_index' && { temperature: value }),
      ...(virtualSensor.type === 'absolute_humidity' && { humidity: value }),
      ...(virtualSensor.type === 'dli' && { par: value }),
    });

    return true;
  }

  /**
   * Update all enabled virtual sensors
   */
  static async updateAllVirtualSensors(): Promise<void> {
    const virtualSensors = await VirtualSensor.findAll({
      where: { enabled: true },
    });

    const now = new Date();

    for (const vs of virtualSensors) {
      // Check if update is due
      if (vs.lastCalculated) {
        const minutesSinceUpdate =
          (now.getTime() - vs.lastCalculated.getTime()) / 1000 / 60;

        if (minutesSinceUpdate < vs.updateIntervalMinutes) {
          continue; // Skip, not yet time to update
        }
      }

      await this.updateVirtualSensor(vs);
    }
  }
}
