import { SensorData, Sensor } from '../models';
import { Op } from 'sequelize';

/**
 * Sensor Benchmark Service
 * Compares sensors against baselines and each other for quality assurance
 */

export interface BenchmarkBaseline {
  field: string; // e.g., 'temperature', 'humidity'
  expectedValue?: number; // Expected/ideal value
  expectedRange?: { min: number; max: number }; // Acceptable range
  tolerancePercent?: number; // Acceptable deviation % (default 5%)
  driftThreshold?: number; // Max drift over 24h (default 2% of range)
}

export interface SensorPerformanceScore {
  sensorId: number;
  sensorName: string;
  field: string;
  score: number; // 0-100
  accuracy: number; // How close to baseline (0-100)
  consistency: number; // Variance over time (0-100)
  reliability: number; // Uptime/data availability (0-100)
  drift: number; // Drift rate (lower is better)
  issues: string[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

export interface BenchmarkReport {
  field: string;
  baseline: BenchmarkBaseline;
  sensors: SensorPerformanceScore[];
  summary: {
    bestSensor: number | null;
    worstSensor: number | null;
    averageScore: number;
    totalIssues: number;
  };
  timestamp: Date;
}

export interface DriftAnalysis {
  sensorId: number;
  field: string;
  startValue: number;
  endValue: number;
  driftAmount: number;
  driftPercent: number;
  isDrifting: boolean;
  period: string;
  timestamp: Date;
}

export class SensorBenchmarkService {
  /**
   * Benchmark sensors against a baseline
   */
  static async benchmarkSensors(
    sensorIds: number[],
    baseline: BenchmarkBaseline,
    lookbackHours: number = 24
  ): Promise<BenchmarkReport> {
    const scores: SensorPerformanceScore[] = [];
    const startTime = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

    for (const sensorId of sensorIds) {
      const sensor = await Sensor.findByPk(sensorId);
      if (!sensor) continue;

      const score = await this.calculatePerformanceScore(
        sensorId,
        sensor.name,
        baseline,
        startTime
      );

      if (score) {
        scores.push(score);
      }
    }

    // Find best and worst sensors
    const sortedByScore = [...scores].sort((a, b) => b.score - a.score);
    const bestSensor = sortedByScore.length > 0 ? sortedByScore[0].sensorId : null;
    const worstSensor =
      sortedByScore.length > 0
        ? sortedByScore[sortedByScore.length - 1].sensorId
        : null;

    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
        : 0;

    const totalIssues = scores.reduce((sum, s) => sum + s.issues.length, 0);

    return {
      field: baseline.field,
      baseline,
      sensors: scores,
      summary: {
        bestSensor,
        worstSensor,
        averageScore: Math.round(averageScore * 10) / 10,
        totalIssues,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Calculate performance score for a single sensor
   */
  private static async calculatePerformanceScore(
    sensorId: number,
    sensorName: string,
    baseline: BenchmarkBaseline,
    startTime: Date
  ): Promise<SensorPerformanceScore | null> {
    const readings = await SensorData.findAll({
      where: {
        sensorId,
        timestamp: {
          [Op.gte]: startTime,
        },
      },
      order: [['timestamp', 'ASC']],
    });

    if (readings.length === 0) {
      return {
        sensorId,
        sensorName,
        field: baseline.field,
        score: 0,
        accuracy: 0,
        consistency: 0,
        reliability: 0,
        drift: 0,
        issues: ['No data available'],
        grade: 'F',
        recommendations: ['Check sensor connection', 'Verify sensor is operational'],
      };
    }

    const values = readings
      .map((r) => (r as any)[baseline.field])
      .filter((v: any) => v !== null && v !== undefined && !isNaN(v))
      .map((v: any) => parseFloat(v));

    if (values.length === 0) {
      return null;
    }

    // Calculate accuracy (how close to baseline)
    const accuracy = this.calculateAccuracy(values, baseline);

    // Calculate consistency (low variance = high consistency)
    const consistency = this.calculateConsistency(values);

    // Calculate reliability (data availability)
    const reliability = this.calculateReliability(readings.length, startTime);

    // Calculate drift
    const drift = this.calculateDrift(values);

    // Overall score (weighted average)
    const score = Math.round(
      accuracy * 0.4 + consistency * 0.3 + reliability * 0.2 + (100 - drift) * 0.1
    );

    // Identify issues
    const issues: string[] = [];
    if (accuracy < 70) issues.push('Low accuracy - deviates from baseline');
    if (consistency < 70) issues.push('Inconsistent readings - high variance');
    if (reliability < 80) issues.push('Low reliability - missing data points');
    if (drift > 20) issues.push('Significant drift detected');

    // Generate recommendations
    const recommendations: string[] = [];
    if (accuracy < 70) recommendations.push('Calibrate sensor');
    if (consistency < 70) recommendations.push('Check sensor stability');
    if (reliability < 80) recommendations.push('Verify sensor connection');
    if (drift > 20) recommendations.push('Sensor may need replacement');

    // Assign grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      sensorId,
      sensorName,
      field: baseline.field,
      score,
      accuracy,
      consistency,
      reliability,
      drift,
      issues,
      grade,
      recommendations,
    };
  }

  /**
   * Calculate accuracy score (0-100)
   */
  private static calculateAccuracy(
    values: number[],
    baseline: BenchmarkBaseline
  ): number {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

    if (baseline.expectedValue !== undefined) {
      const deviation = Math.abs(avg - baseline.expectedValue);
      const tolerancePercent = baseline.tolerancePercent || 5;
      const maxDeviation = baseline.expectedValue * (tolerancePercent / 100);

      if (deviation === 0) return 100;
      if (deviation >= maxDeviation * 2) return 0;

      return Math.max(0, 100 - (deviation / maxDeviation) * 50);
    }

    if (baseline.expectedRange) {
      const { min, max } = baseline.expectedRange;
      if (avg >= min && avg <= max) {
        // Within range, calculate how centered it is
        const center = (min + max) / 2;
        const halfRange = (max - min) / 2;
        const distanceFromCenter = Math.abs(avg - center);
        return Math.max(70, 100 - (distanceFromCenter / halfRange) * 30);
      } else {
        // Outside range
        const deviation = avg < min ? min - avg : avg - max;
        const range = max - min;
        return Math.max(0, 70 - (deviation / range) * 70);
      }
    }

    return 100; // No baseline defined, assume perfect
  }

  /**
   * Calculate consistency score (0-100) based on variance
   */
  private static calculateConsistency(values: number[]): number {
    if (values.length < 2) return 100;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation (CV)
    const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;

    // Convert CV to score (lower CV = higher score)
    // CV < 2% = excellent (100)
    // CV > 10% = poor (0)
    if (cv <= 2) return 100;
    if (cv >= 10) return 0;

    return Math.max(0, 100 - ((cv - 2) / 8) * 100);
  }

  /**
   * Calculate reliability score (0-100) based on data availability
   */
  private static calculateReliability(readingCount: number, startTime: Date): number {
    const hoursSince = (Date.now() - startTime.getTime()) / (1000 * 60 * 60);
    const expectedReadings = hoursSince * 12; // Assuming 5-min intervals

    const availability = (readingCount / expectedReadings) * 100;

    return Math.min(100, availability);
  }

  /**
   * Calculate drift score (0-100, lower is better)
   */
  private static calculateDrift(values: number[]): number {
    if (values.length < 10) return 0;

    // Compare first and last 10% of values
    const firstTenth = Math.floor(values.length * 0.1);
    const lastTenth = Math.floor(values.length * 0.1);

    const firstAvg =
      values.slice(0, firstTenth).reduce((sum, v) => sum + v, 0) / firstTenth;
    const lastAvg =
      values
        .slice(values.length - lastTenth)
        .reduce((sum, v) => sum + v, 0) / lastTenth;

    const drift = Math.abs(lastAvg - firstAvg);
    const driftPercent = firstAvg !== 0 ? (drift / Math.abs(firstAvg)) * 100 : 0;

    // Convert drift to score (lower drift = lower score is good)
    // 0% drift = 0 score
    // 10%+ drift = 100 score
    return Math.min(100, driftPercent * 10);
  }

  /**
   * Detect drift over time for a sensor
   */
  static async detectDrift(
    sensorId: number,
    field: string,
    periodHours: number = 24
  ): Promise<DriftAnalysis | null> {
    const startTime = new Date(Date.now() - periodHours * 60 * 60 * 1000);

    const readings = await SensorData.findAll({
      where: {
        sensorId,
        timestamp: {
          [Op.gte]: startTime,
        },
      },
      order: [['timestamp', 'ASC']],
    });

    if (readings.length < 10) {
      return null; // Not enough data
    }

    const values = readings
      .map((r) => (r as any)[field])
      .filter((v: any) => v !== null && v !== undefined && !isNaN(v))
      .map((v: any) => parseFloat(v));

    if (values.length < 10) {
      return null;
    }

    // Compare first and last 20% of readings
    const segment = Math.floor(values.length * 0.2);
    const firstValues = values.slice(0, segment);
    const lastValues = values.slice(values.length - segment);

    const startValue =
      firstValues.reduce((sum, v) => sum + v, 0) / firstValues.length;
    const endValue = lastValues.reduce((sum, v) => sum + v, 0) / lastValues.length;

    const driftAmount = endValue - startValue;
    const driftPercent =
      startValue !== 0 ? (Math.abs(driftAmount) / Math.abs(startValue)) * 100 : 0;

    const isDrifting = driftPercent > 2.0; // More than 2% drift

    return {
      sensorId,
      field,
      startValue: Math.round(startValue * 100) / 100,
      endValue: Math.round(endValue * 100) / 100,
      driftAmount: Math.round(driftAmount * 100) / 100,
      driftPercent: Math.round(driftPercent * 100) / 100,
      isDrifting,
      period: `${periodHours}h`,
      timestamp: new Date(),
    };
  }

  /**
   * Compare sensors against each other (no baseline needed)
   */
  static async compareSensors(
    sensorIds: number[],
    field: string,
    lookbackHours: number = 24
  ): Promise<{
    sensors: Array<{
      sensorId: number;
      sensorName: string;
      average: number;
      min: number;
      max: number;
      stdDev: number;
      readingCount: number;
    }>;
    analysis: {
      mostStable: number | null;
      mostVolatile: number | null;
      averageValue: number;
      maxDeviation: number;
    };
  }> {
    const startTime = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
    const sensorStats: Array<{
      sensorId: number;
      sensorName: string;
      average: number;
      min: number;
      max: number;
      stdDev: number;
      readingCount: number;
    }> = [];

    for (const sensorId of sensorIds) {
      const sensor = await Sensor.findByPk(sensorId);
      if (!sensor) continue;

      const readings = await SensorData.findAll({
        where: {
          sensorId,
          timestamp: {
            [Op.gte]: startTime,
          },
        },
      });

      const values = readings
        .map((r) => (r as any)[field])
        .filter((v: any) => v !== null && v !== undefined && !isNaN(v))
        .map((v: any) => parseFloat(v));

      if (values.length === 0) continue;

      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance =
        values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      sensorStats.push({
        sensorId,
        sensorName: sensor.name,
        average: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        readingCount: values.length,
      });
    }

    // Find most stable (lowest stdDev) and most volatile (highest stdDev)
    const sortedByStability = [...sensorStats].sort((a, b) => a.stdDev - b.stdDev);
    const mostStable =
      sortedByStability.length > 0 ? sortedByStability[0].sensorId : null;
    const mostVolatile =
      sortedByStability.length > 0
        ? sortedByStability[sortedByStability.length - 1].sensorId
        : null;

    const averageValue =
      sensorStats.length > 0
        ? sensorStats.reduce((sum, s) => sum + s.average, 0) / sensorStats.length
        : 0;

    const maxDeviation =
      sensorStats.length > 0
        ? Math.max(...sensorStats.map((s) => Math.abs(s.average - averageValue)))
        : 0;

    return {
      sensors: sensorStats,
      analysis: {
        mostStable,
        mostVolatile,
        averageValue: Math.round(averageValue * 100) / 100,
        maxDeviation: Math.round(maxDeviation * 100) / 100,
      },
    };
  }
}
