import { SensorData, Sensor } from '../models';
import { Op } from 'sequelize';

/**
 * Anomaly Detection Service
 * Detects anomalies in sensor data using multiple methods
 */

export type AnomalyDetectionMethod = 'zscore' | 'iqr' | 'threshold' | 'combined';
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Anomaly {
  timestamp: Date;
  sensorId: number;
  sensorName: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: AnomalySeverity;
  method: AnomalyDetectionMethod;
  confidence: number; // 0-100
  description: string;
}

export interface AnomalyDetectionResult {
  sensorId: number;
  sensorName: string;
  method: AnomalyDetectionMethod;
  anomalies: Anomaly[];
  totalAnomalies: number;
  severityCounts: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  detectionPeriod: {
    start: Date;
    end: Date;
    hours: number;
  };
  statistics: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    q1: number;
    q3: number;
    iqr: number;
  };
}

export interface AnomalySummary {
  totalSensors: number;
  totalAnomalies: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topAnomalousSensors: Array<{
    sensorId: number;
    sensorName: string;
    anomalyCount: number;
    criticalCount: number;
  }>;
  recentAnomalies: Anomaly[];
}

export class AnomalyDetectionService {
  /**
   * Detect anomalies in sensor data
   */
  static async detectAnomalies(
    sensorId: number,
    hours: number = 24,
    method: AnomalyDetectionMethod = 'combined',
    zScoreThreshold: number = 3,
    iqrMultiplier: number = 1.5
  ): Promise<AnomalyDetectionResult | null> {
    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) {
      return null;
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);

    const sensorData = await SensorData.findAll({
      where: {
        sensorId,
        timestamp: { [Op.between]: [startDate, endDate] },
      },
      order: [['timestamp', 'ASC']],
    });

    if (sensorData.length < 10) {
      // Not enough data for reliable anomaly detection
      return {
        sensorId,
        sensorName: sensor.name,
        method,
        anomalies: [],
        totalAnomalies: 0,
        severityCounts: { low: 0, medium: 0, high: 0, critical: 0 },
        detectionPeriod: { start: startDate, end: endDate, hours },
        statistics: this.getDefaultStatistics(),
      };
    }

    // Extract values based on sensor type
    const values = this.extractSensorValues(sensorData, sensor.type);
    const validValues = values.filter((v) => v !== null) as number[];

    if (validValues.length < 10) {
      return {
        sensorId,
        sensorName: sensor.name,
        method,
        anomalies: [],
        totalAnomalies: 0,
        severityCounts: { low: 0, medium: 0, high: 0, critical: 0 },
        detectionPeriod: { start: startDate, end: endDate, hours },
        statistics: this.getDefaultStatistics(),
      };
    }

    // Calculate statistics
    const statistics = this.calculateStatistics(validValues);

    // Detect anomalies using selected method
    let anomalies: Anomaly[] = [];

    switch (method) {
      case 'zscore':
        anomalies = this.detectByZScore(sensorData, sensor, validValues, statistics, zScoreThreshold);
        break;
      case 'iqr':
        anomalies = this.detectByIQR(sensorData, sensor, validValues, statistics, iqrMultiplier);
        break;
      case 'threshold':
        anomalies = this.detectByThreshold(sensorData, sensor);
        break;
      case 'combined':
      default:
        const zScoreAnomalies = this.detectByZScore(
          sensorData,
          sensor,
          validValues,
          statistics,
          zScoreThreshold
        );
        const iqrAnomalies = this.detectByIQR(
          sensorData,
          sensor,
          validValues,
          statistics,
          iqrMultiplier
        );
        const thresholdAnomalies = this.detectByThreshold(sensorData, sensor);

        // Merge and deduplicate anomalies
        anomalies = this.mergeAnomalies([zScoreAnomalies, iqrAnomalies, thresholdAnomalies]);
        break;
    }

    // Count severities
    const severityCounts = {
      low: anomalies.filter((a) => a.severity === 'low').length,
      medium: anomalies.filter((a) => a.severity === 'medium').length,
      high: anomalies.filter((a) => a.severity === 'high').length,
      critical: anomalies.filter((a) => a.severity === 'critical').length,
    };

    return {
      sensorId,
      sensorName: sensor.name,
      method,
      anomalies,
      totalAnomalies: anomalies.length,
      severityCounts,
      detectionPeriod: { start: startDate, end: endDate, hours },
      statistics,
    };
  }

  /**
   * Get anomaly detection summary across all sensors
   */
  static async getAnomalySummary(hours: number = 24): Promise<AnomalySummary> {
    const sensors = await Sensor.findAll({ where: { isActive: true } });

    let totalAnomalies = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    const sensorAnomalyCounts: Map<
      number,
      { name: string; total: number; critical: number }
    > = new Map();
    const allAnomalies: Anomaly[] = [];

    for (const sensor of sensors) {
      const result = await this.detectAnomalies(sensor.id, hours, 'combined');
      if (result && result.anomalies.length > 0) {
        totalAnomalies += result.totalAnomalies;
        criticalCount += result.severityCounts.critical;
        highCount += result.severityCounts.high;
        mediumCount += result.severityCounts.medium;
        lowCount += result.severityCounts.low;

        sensorAnomalyCounts.set(sensor.id, {
          name: sensor.name,
          total: result.totalAnomalies,
          critical: result.severityCounts.critical,
        });

        allAnomalies.push(...result.anomalies);
      }
    }

    // Sort sensors by anomaly count
    const topAnomalousSensors = Array.from(sensorAnomalyCounts.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([sensorId, data]) => ({
        sensorId,
        sensorName: data.name,
        anomalyCount: data.total,
        criticalCount: data.critical,
      }));

    // Get most recent anomalies
    const recentAnomalies = allAnomalies
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalSensors: sensors.length,
      totalAnomalies,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      topAnomalousSensors,
      recentAnomalies,
    };
  }

  /**
   * Z-Score anomaly detection
   */
  private static detectByZScore(
    sensorData: SensorData[],
    sensor: Sensor,
    values: number[],
    statistics: any,
    threshold: number
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const mean = statistics.mean;
    const stdDev = statistics.stdDev;

    if (stdDev === 0) return anomalies;

    for (let i = 0; i < sensorData.length; i++) {
      const data = sensorData[i];
      const value = this.getSensorValue(data, sensor.type);
      if (value === null) continue;

      const zScore = Math.abs((value - mean) / stdDev);

      if (zScore > threshold) {
        const deviation = value - mean;
        const severity = this.calculateSeverity(zScore, threshold);
        const confidence = Math.min((zScore / threshold) * 100, 100);

        anomalies.push({
          timestamp: data.timestamp,
          sensorId: sensor.id,
          sensorName: sensor.name,
          value,
          expectedValue: mean,
          deviation,
          severity,
          method: 'zscore',
          confidence: Math.round(confidence),
          description: `Z-Score: ${zScore.toFixed(2)} (Schwellwert: ${threshold})`,
        });
      }
    }

    return anomalies;
  }

  /**
   * IQR (Interquartile Range) anomaly detection
   */
  private static detectByIQR(
    sensorData: SensorData[],
    sensor: Sensor,
    values: number[],
    statistics: any,
    multiplier: number
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const q1 = statistics.q1;
    const q3 = statistics.q3;
    const iqr = statistics.iqr;

    const lowerBound = q1 - multiplier * iqr;
    const upperBound = q3 + multiplier * iqr;

    for (let i = 0; i < sensorData.length; i++) {
      const data = sensorData[i];
      const value = this.getSensorValue(data, sensor.type);
      if (value === null) continue;

      if (value < lowerBound || value > upperBound) {
        const expectedValue = value < lowerBound ? lowerBound : upperBound;
        const deviation = value - expectedValue;
        const distanceFromBound = Math.abs(deviation);
        const severity = this.calculateIQRSeverity(distanceFromBound, iqr);
        const confidence = Math.min((distanceFromBound / iqr) * 50, 100);

        anomalies.push({
          timestamp: data.timestamp,
          sensorId: sensor.id,
          sensorName: sensor.name,
          value,
          expectedValue,
          deviation,
          severity,
          method: 'iqr',
          confidence: Math.round(confidence),
          description: `Außerhalb IQR-Bereich: [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
        });
      }
    }

    return anomalies;
  }

  /**
   * Threshold-based anomaly detection using sensor min/max values
   */
  private static detectByThreshold(sensorData: SensorData[], sensor: Sensor): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const minValue = sensor.minValue;
    const maxValue = sensor.maxValue;

    for (let i = 0; i < sensorData.length; i++) {
      const data = sensorData[i];
      const value = this.getSensorValue(data, sensor.type);
      if (value === null) continue;

      if (value < minValue || value > maxValue) {
        const expectedValue = value < minValue ? minValue : maxValue;
        const deviation = value - expectedValue;
        const severity = this.calculateThresholdSeverity(value, minValue, maxValue);
        const confidence = 90;

        anomalies.push({
          timestamp: data.timestamp,
          sensorId: sensor.id,
          sensorName: sensor.name,
          value,
          expectedValue,
          deviation,
          severity,
          method: 'threshold',
          confidence,
          description: `Außerhalb des definierten Bereichs: [${minValue}, ${maxValue}]`,
        });
      }
    }

    return anomalies;
  }

  /**
   * Merge anomalies from different methods and remove duplicates
   */
  private static mergeAnomalies(anomalyArrays: Anomaly[][]): Anomaly[] {
    const merged: Map<string, Anomaly> = new Map();

    for (const anomalies of anomalyArrays) {
      for (const anomaly of anomalies) {
        const key = `${anomaly.sensorId}_${anomaly.timestamp.getTime()}`;
        const existing = merged.get(key);

        if (!existing || anomaly.confidence > existing.confidence) {
          // Keep anomaly with higher confidence
          merged.set(key, {
            ...anomaly,
            method: 'combined',
          });
        }
      }
    }

    return Array.from(merged.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Calculate severity based on Z-score
   */
  private static calculateSeverity(zScore: number, threshold: number): AnomalySeverity {
    const ratio = zScore / threshold;
    if (ratio >= 2.5) return 'critical';
    if (ratio >= 1.8) return 'high';
    if (ratio >= 1.3) return 'medium';
    return 'low';
  }

  /**
   * Calculate severity based on IQR distance
   */
  private static calculateIQRSeverity(distance: number, iqr: number): AnomalySeverity {
    const ratio = distance / iqr;
    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Calculate severity based on threshold violations
   */
  private static calculateThresholdSeverity(
    value: number,
    min: number,
    max: number
  ): AnomalySeverity {
    const range = max - min;
    const deviation = value < min ? min - value : value - max;
    const ratio = deviation / range;

    if (ratio >= 0.5) return 'critical';
    if (ratio >= 0.3) return 'high';
    if (ratio >= 0.15) return 'medium';
    return 'low';
  }

  /**
   * Calculate statistics for anomaly detection
   */
  private static calculateStatistics(values: number[]): any {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;

    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    return {
      mean,
      median,
      stdDev,
      min: sorted[0],
      max: sorted[n - 1],
      q1,
      q3,
      iqr,
    };
  }

  /**
   * Extract sensor values from sensor data
   */
  private static extractSensorValues(
    sensorData: SensorData[],
    sensorType: string
  ): (number | null)[] {
    return sensorData.map((data) => this.getSensorValue(data, sensorType));
  }

  /**
   * Get sensor value based on sensor type
   */
  private static getSensorValue(data: SensorData, sensorType: string): number | null {
    switch (sensorType) {
      case 'temperature':
        return data.temperature || null;
      case 'humidity':
        return data.humidity || null;
      case 'moisture':
        return data.moistureLevel || null;
      case 'ph':
        return data.ph || null;
      case 'ec':
        return data.ec || null;
      case 'light':
        return data.light || null;
      case 'co2':
        return data.co2 || null;
      case 'par':
        return data.par || null;
      case 'tds':
        return data.tds || null;
      case 'voc':
        return data.voc || null;
      case 'pm25':
        return data.pm25 || null;
      case 'water_level':
        return data.tankLevel || null;
      default:
        return null;
    }
  }

  /**
   * Get default statistics
   */
  private static getDefaultStatistics(): any {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
    };
  }
}
