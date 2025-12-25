import { SensorData, Sensor } from '../models';
import { Op } from 'sequelize';

/**
 * Sensor Fusion Service
 * Combines multiple sensor readings for improved accuracy using statistical methods
 */

export type FusionMethod = 'average' | 'median' | 'weighted_average' | 'best_sensor';

export interface SensorReading {
  sensorId: number;
  value: number;
  timestamp: Date;
  confidence?: number; // 0-1, based on sensor reliability
}

export interface FusionResult {
  fusedValue: number;
  method: FusionMethod;
  confidence: number; // 0-1
  sensorCount: number;
  outliers: number[];
  variance: number;
  timestamp: Date;
  details?: {
    min: number;
    max: number;
    median: number;
    average: number;
    stdDev: number;
  };
}

export interface FusionConfig {
  sensorIds: number[];
  method: FusionMethod;
  field: string; // e.g., 'temperature', 'humidity'
  outlierThreshold?: number; // Z-score threshold, default 2.0
  weights?: Record<number, number>; // For weighted_average
}

export class SensorFusionService {
  /**
   * Fuse sensor readings using specified method
   */
  static async fuseSensorReadings(config: FusionConfig): Promise<FusionResult | null> {
    const { sensorIds, method, field, outlierThreshold = 2.0, weights } = config;

    // Get latest readings for all sensors
    const readings = await this.getLatestReadings(sensorIds, field);

    if (readings.length === 0) {
      return null;
    }

    // Detect and remove outliers
    const { cleanReadings, outliers } = this.removeOutliers(readings, outlierThreshold);

    if (cleanReadings.length === 0) {
      // All values were outliers, use original readings
      return this.calculateFusion(readings, method, weights, []);
    }

    return this.calculateFusion(cleanReadings, method, weights, outliers);
  }

  /**
   * Get latest sensor readings for specified field
   */
  private static async getLatestReadings(
    sensorIds: number[],
    field: string
  ): Promise<SensorReading[]> {
    const readings: SensorReading[] = [];

    for (const sensorId of sensorIds) {
      const reading = await SensorData.findOne({
        where: { sensorId },
        order: [['timestamp', 'DESC']],
        limit: 1,
      });

      if (reading) {
        const value = (reading as any)[field];
        if (value !== undefined && value !== null && !isNaN(value)) {
          readings.push({
            sensorId,
            value: parseFloat(value),
            timestamp: reading.timestamp,
          });
        }
      }
    }

    return readings;
  }

  /**
   * Remove outliers using Z-score method
   */
  private static removeOutliers(
    readings: SensorReading[],
    threshold: number
  ): { cleanReadings: SensorReading[]; outliers: number[] } {
    if (readings.length < 3) {
      // Not enough data for outlier detection
      return { cleanReadings: readings, outliers: [] };
    }

    const values = readings.map((r) => r.value);
    const mean = this.average(values);
    const stdDev = this.standardDeviation(values);

    if (stdDev === 0) {
      // All values are identical
      return { cleanReadings: readings, outliers: [] };
    }

    const cleanReadings: SensorReading[] = [];
    const outliers: number[] = [];

    readings.forEach((reading) => {
      const zScore = Math.abs((reading.value - mean) / stdDev);

      if (zScore <= threshold) {
        cleanReadings.push(reading);
      } else {
        outliers.push(reading.sensorId);
      }
    });

    return { cleanReadings, outliers };
  }

  /**
   * Calculate fused value using specified method
   */
  private static calculateFusion(
    readings: SensorReading[],
    method: FusionMethod,
    weights?: Record<number, number>,
    outliers: number[] = []
  ): FusionResult {
    const values = readings.map((r) => r.value);
    const timestamp = new Date();

    let fusedValue: number;
    let confidence: number;

    switch (method) {
      case 'average':
        fusedValue = this.average(values);
        confidence = this.calculateConfidence(values);
        break;

      case 'median':
        fusedValue = this.median(values);
        confidence = this.calculateConfidence(values);
        break;

      case 'weighted_average':
        fusedValue = this.weightedAverage(readings, weights || {});
        confidence = this.calculateConfidence(values);
        break;

      case 'best_sensor':
        // Use sensor with highest confidence or most recent reading
        const bestReading = readings.reduce((best, current) =>
          (current.confidence || 0) > (best.confidence || 0) ? current : best
        );
        fusedValue = bestReading.value;
        confidence = bestReading.confidence || 0.8;
        break;

      default:
        fusedValue = this.average(values);
        confidence = this.calculateConfidence(values);
    }

    const variance = this.variance(values);
    const stdDev = Math.sqrt(variance);

    return {
      fusedValue: Math.round(fusedValue * 100) / 100, // Round to 2 decimals
      method,
      confidence,
      sensorCount: readings.length,
      outliers,
      variance: Math.round(variance * 100) / 100,
      timestamp,
      details: {
        min: Math.min(...values),
        max: Math.max(...values),
        median: this.median(values),
        average: this.average(values),
        stdDev: Math.round(stdDev * 100) / 100,
      },
    };
  }

  /**
   * Calculate average
   */
  private static average(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate median
   */
  private static median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }

    return sorted[mid];
  }

  /**
   * Calculate weighted average
   */
  private static weightedAverage(
    readings: SensorReading[],
    weights: Record<number, number>
  ): number {
    let weightedSum = 0;
    let totalWeight = 0;

    readings.forEach((reading) => {
      const weight = weights[reading.sensorId] || 1.0;
      weightedSum += reading.value * weight;
      totalWeight += weight;
    });

    return weightedSum / totalWeight;
  }

  /**
   * Calculate variance
   */
  private static variance(values: number[]): number {
    const mean = this.average(values);
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return this.average(squaredDiffs);
  }

  /**
   * Calculate standard deviation
   */
  private static standardDeviation(values: number[]): number {
    return Math.sqrt(this.variance(values));
  }

  /**
   * Calculate confidence score based on sensor agreement
   * Higher agreement = higher confidence
   */
  private static calculateConfidence(values: number[]): number {
    if (values.length === 1) {
      return 0.7; // Single sensor, moderate confidence
    }

    const stdDev = this.standardDeviation(values);
    const mean = this.average(values);

    if (mean === 0) {
      return 1.0; // All values are zero, perfect agreement
    }

    // Coefficient of variation (CV)
    const cv = stdDev / Math.abs(mean);

    // Convert CV to confidence (inverse relationship)
    // CV < 0.05 = excellent (confidence ~1.0)
    // CV > 0.5 = poor (confidence ~0.5)
    let confidence = 1.0 - Math.min(cv * 2, 0.5);

    // Boost confidence for more sensors
    const sensorBonus = Math.min(values.length * 0.05, 0.15);
    confidence = Math.min(confidence + sensorBonus, 1.0);

    return Math.round(confidence * 100) / 100;
  }

  /**
   * Fuse all sensors in a sensor group
   */
  static async fuseSensorGroup(
    groupId: number,
    field: string,
    method: FusionMethod = 'average'
  ): Promise<FusionResult | null> {
    // Import SensorGroup here to avoid circular dependencies
    const SensorGroup = (await import('../models')).SensorGroup;

    const group = await SensorGroup.findByPk(groupId);

    if (!group) {
      return null;
    }

    const sensorIds: number[] = JSON.parse(group.sensorIds);

    return this.fuseSensorReadings({
      sensorIds,
      method,
      field,
    });
  }

  /**
   * Get historical fusion data
   */
  static async getHistoricalFusion(
    config: FusionConfig,
    startDate: Date,
    endDate: Date,
    intervalMinutes: number = 60
  ): Promise<FusionResult[]> {
    const results: FusionResult[] = [];
    const { sensorIds, field, method, outlierThreshold, weights } = config;

    // Create time buckets
    const currentTime = new Date(startDate);
    while (currentTime < endDate) {
      const bucketEnd = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);

      // Get readings for this time bucket
      const readings: SensorReading[] = [];

      for (const sensorId of sensorIds) {
        const reading = await SensorData.findOne({
          where: {
            sensorId,
            timestamp: {
              [Op.gte]: currentTime,
              [Op.lt]: bucketEnd,
            },
          },
          order: [['timestamp', 'DESC']],
          limit: 1,
        });

        if (reading) {
          const value = (reading as any)[field];
          if (value !== undefined && value !== null && !isNaN(value)) {
            readings.push({
              sensorId,
              value: parseFloat(value),
              timestamp: reading.timestamp,
            });
          }
        }
      }

      if (readings.length > 0) {
        const { cleanReadings, outliers } = this.removeOutliers(
          readings,
          outlierThreshold || 2.0
        );

        if (cleanReadings.length > 0) {
          const fusion = this.calculateFusion(
            cleanReadings,
            method,
            weights,
            outliers
          );
          results.push(fusion);
        }
      }

      currentTime.setTime(bucketEnd.getTime());
    }

    return results;
  }
}
