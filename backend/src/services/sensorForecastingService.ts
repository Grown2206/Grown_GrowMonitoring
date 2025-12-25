import { SensorData, Sensor } from '../models';
import { Op } from 'sequelize';

/**
 * Sensor Forecasting & Prediction Service
 * Uses statistical methods for time series forecasting and anomaly detection
 */

export type ForecastMethod = 'sma' | 'ema' | 'linear_regression' | 'arima_simple';

export interface ForecastResult {
  sensorId: number;
  sensorName: string;
  field: string;
  method: ForecastMethod;
  predictions: Array<{
    timestamp: Date;
    predictedValue: number;
    confidence: {
      lower: number; // Lower bound (e.g., 95% confidence)
      upper: number; // Upper bound
    };
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendStrength: number; // 0-100
  accuracy: {
    mae: number; // Mean Absolute Error
    rmse: number; // Root Mean Square Error
    mape: number; // Mean Absolute Percentage Error
  };
  trainingPeriod: {
    start: Date;
    end: Date;
    samples: number;
  };
  timestamp: Date;
}

export interface AnomalyDetection {
  sensorId: number;
  sensorName: string;
  field: string;
  anomalies: Array<{
    timestamp: Date;
    actualValue: number;
    expectedValue: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  totalAnomalies: number;
  anomalyRate: number; // Percentage
  timestamp: Date;
}

export interface TrendAnalysis {
  sensorId: number;
  sensorName: string;
  field: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  slope: number; // Change per hour
  strength: number; // R² value (0-1)
  forecast24h: number; // Predicted value in 24 hours
  forecast48h: number; // Predicted value in 48 hours
  periodHours: number;
  timestamp: Date;
}

export class SensorForecastingService {
  /**
   * Generate forecast for sensor data
   */
  static async forecast(
    sensorId: number,
    field: string,
    method: ForecastMethod = 'ema',
    options: {
      trainingHours?: number;
      forecastSteps?: number;
      confidenceLevel?: number;
    } = {}
  ): Promise<ForecastResult | null> {
    const {
      trainingHours = 48,
      forecastSteps = 12, // 12 steps = 1 hour at 5-min intervals
      confidenceLevel = 0.95,
    } = options;

    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) return null;

    const startTime = new Date(Date.now() - trainingHours * 60 * 60 * 1000);

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

    // Generate predictions based on method
    const predictions = this.generatePredictions(
      values,
      method,
      forecastSteps,
      confidenceLevel
    );

    // Calculate trend
    const { trend, trendStrength } = this.analyzeTrendFromValues(values);

    // Calculate accuracy metrics using last 20% of data as validation
    const accuracy = this.calculateAccuracy(values, method);

    // Create timestamps for predictions (assuming 5-min intervals)
    const lastTimestamp = new Date(readings[readings.length - 1].timestamp);
    const predictionResults = predictions.map((pred, idx) => ({
      timestamp: new Date(lastTimestamp.getTime() + (idx + 1) * 5 * 60 * 1000),
      predictedValue: Math.round(pred.value * 100) / 100,
      confidence: {
        lower: Math.round(pred.lower * 100) / 100,
        upper: Math.round(pred.upper * 100) / 100,
      },
    }));

    return {
      sensorId,
      sensorName: sensor.name,
      field,
      method,
      predictions: predictionResults,
      trend,
      trendStrength,
      accuracy,
      trainingPeriod: {
        start: startTime,
        end: new Date(readings[readings.length - 1].timestamp),
        samples: values.length,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Detect anomalies using prediction-based approach
   */
  static async detectAnomalies(
    sensorId: number,
    field: string,
    lookbackHours: number = 24,
    sensitivity: number = 2.0 // Z-score threshold
  ): Promise<AnomalyDetection | null> {
    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) return null;

    const startTime = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

    const readings = await SensorData.findAll({
      where: {
        sensorId,
        timestamp: {
          [Op.gte]: startTime,
        },
      },
      order: [['timestamp', 'ASC']],
    });

    if (readings.length < 20) {
      return null;
    }

    const values = readings
      .map((r) => (r as any)[field])
      .filter((v: any) => v !== null && v !== undefined && !isNaN(v))
      .map((v: any) => parseFloat(v));

    if (values.length < 20) {
      return null;
    }

    const anomalies: Array<{
      timestamp: Date;
      actualValue: number;
      expectedValue: number;
      deviation: number;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }> = [];

    // Use EMA for prediction
    const alpha = 0.3;
    let ema = values[0];

    for (let i = 1; i < values.length; i++) {
      const actual = values[i];
      const expected = ema;
      const deviation = Math.abs(actual - expected);

      // Calculate standard deviation of recent values
      const recentValues = values.slice(Math.max(0, i - 20), i);
      const mean = recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length;
      const variance =
        recentValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
        recentValues.length;
      const stdDev = Math.sqrt(variance);

      const zScore = stdDev > 0 ? deviation / stdDev : 0;

      if (zScore >= sensitivity) {
        let severity: 'low' | 'medium' | 'high';
        if (zScore >= sensitivity * 2) {
          severity = 'high';
        } else if (zScore >= sensitivity * 1.5) {
          severity = 'medium';
        } else {
          severity = 'low';
        }

        anomalies.push({
          timestamp: new Date(readings[i].timestamp),
          actualValue: Math.round(actual * 100) / 100,
          expectedValue: Math.round(expected * 100) / 100,
          deviation: Math.round(deviation * 100) / 100,
          severity,
          description: `${field} deviated by ${Math.round(deviation * 10) / 10} (${severity} severity)`,
        });
      }

      // Update EMA
      ema = alpha * actual + (1 - alpha) * ema;
    }

    const anomalyRate = (anomalies.length / values.length) * 100;

    return {
      sensorId,
      sensorName: sensor.name,
      field,
      anomalies: anomalies.slice(-50), // Return last 50 anomalies max
      totalAnomalies: anomalies.length,
      anomalyRate: Math.round(anomalyRate * 10) / 10,
      timestamp: new Date(),
    };
  }

  /**
   * Analyze trend in sensor data
   */
  static async analyzeTrend(
    sensorId: number,
    field: string,
    periodHours: number = 48
  ): Promise<TrendAnalysis | null> {
    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) return null;

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
      return null;
    }

    const values = readings
      .map((r) => (r as any)[field])
      .filter((v: any) => v !== null && v !== undefined && !isNaN(v))
      .map((v: any) => parseFloat(v));

    if (values.length < 10) {
      return null;
    }

    const { slope, rSquared } = this.linearRegression(values);

    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 0.01) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    // Forecast 24h and 48h ahead
    const intervalsPerHour = 12; // Assuming 5-min intervals
    const forecast24h = values[values.length - 1] + slope * (24 * intervalsPerHour);
    const forecast48h = values[values.length - 1] + slope * (48 * intervalsPerHour);

    return {
      sensorId,
      sensorName: sensor.name,
      field,
      direction,
      slope: Math.round(slope * 1000) / 1000,
      strength: Math.round(rSquared * 100) / 100,
      forecast24h: Math.round(forecast24h * 100) / 100,
      forecast48h: Math.round(forecast48h * 100) / 100,
      periodHours,
      timestamp: new Date(),
    };
  }

  /**
   * Generate predictions based on method
   */
  private static generatePredictions(
    values: number[],
    method: ForecastMethod,
    steps: number,
    confidenceLevel: number
  ): Array<{ value: number; lower: number; upper: number }> {
    switch (method) {
      case 'sma':
        return this.forecastSMA(values, steps, confidenceLevel);
      case 'ema':
        return this.forecastEMA(values, steps, confidenceLevel);
      case 'linear_regression':
        return this.forecastLinearRegression(values, steps, confidenceLevel);
      case 'arima_simple':
        return this.forecastARIMASimple(values, steps, confidenceLevel);
      default:
        return this.forecastEMA(values, steps, confidenceLevel);
    }
  }

  /**
   * Simple Moving Average forecast
   */
  private static forecastSMA(
    values: number[],
    steps: number,
    confidenceLevel: number
  ): Array<{ value: number; lower: number; upper: number }> {
    const window = Math.min(10, values.length);
    const lastValues = values.slice(-window);
    const sma = lastValues.reduce((sum, v) => sum + v, 0) / lastValues.length;

    // Calculate standard deviation for confidence interval
    const variance =
      lastValues.reduce((sum, v) => sum + Math.pow(v - sma, 2), 0) /
      lastValues.length;
    const stdDev = Math.sqrt(variance);
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.58;

    const predictions: Array<{ value: number; lower: number; upper: number }> = [];
    for (let i = 0; i < steps; i++) {
      const margin = zScore * stdDev * Math.sqrt(i + 1); // Wider as we go further
      predictions.push({
        value: sma,
        lower: sma - margin,
        upper: sma + margin,
      });
    }

    return predictions;
  }

  /**
   * Exponential Moving Average forecast
   */
  private static forecastEMA(
    values: number[],
    steps: number,
    confidenceLevel: number
  ): Array<{ value: number; lower: number; upper: number }> {
    const alpha = 0.3;
    let ema = values[0];

    // Calculate EMA up to current point
    for (let i = 1; i < values.length; i++) {
      ema = alpha * values[i] + (1 - alpha) * ema;
    }

    // Calculate residuals for confidence interval
    const residuals: number[] = [];
    let tempEma = values[0];
    for (let i = 1; i < values.length; i++) {
      tempEma = alpha * values[i] + (1 - alpha) * tempEma;
      residuals.push(Math.abs(values[i] - tempEma));
    }

    const avgResidual =
      residuals.reduce((sum, r) => sum + r, 0) / residuals.length;
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.58;

    const predictions: Array<{ value: number; lower: number; upper: number }> = [];
    for (let i = 0; i < steps; i++) {
      const margin = zScore * avgResidual * Math.sqrt(i + 1);
      predictions.push({
        value: ema,
        lower: ema - margin,
        upper: ema + margin,
      });
    }

    return predictions;
  }

  /**
   * Linear Regression forecast
   */
  private static forecastLinearRegression(
    values: number[],
    steps: number,
    confidenceLevel: number
  ): Array<{ value: number; lower: number; upper: number }> {
    const { slope, intercept, rSquared } = this.linearRegression(values);

    // Calculate residuals
    const residuals = values.map(
      (v, i) => Math.abs(v - (slope * i + intercept))
    );
    const avgResidual =
      residuals.reduce((sum, r) => sum + r, 0) / residuals.length;
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.58;

    const predictions: Array<{ value: number; lower: number; upper: number }> = [];
    const n = values.length;

    for (let i = 0; i < steps; i++) {
      const x = n + i;
      const predicted = slope * x + intercept;
      const margin = zScore * avgResidual * Math.sqrt(i + 1);

      predictions.push({
        value: predicted,
        lower: predicted - margin,
        upper: predicted + margin,
      });
    }

    return predictions;
  }

  /**
   * Simple ARIMA-like forecast (AR(1) model)
   */
  private static forecastARIMASimple(
    values: number[],
    steps: number,
    confidenceLevel: number
  ): Array<{ value: number; lower: number; upper: number }> {
    // Simple AR(1): y(t) = α + β*y(t-1) + ε

    if (values.length < 2) {
      return this.forecastEMA(values, steps, confidenceLevel);
    }

    // Calculate autocorrelation at lag 1
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    let num = 0;
    let denom = 0;

    for (let i = 0; i < values.length - 1; i++) {
      num += (values[i] - mean) * (values[i + 1] - mean);
    }

    for (let i = 0; i < values.length; i++) {
      denom += Math.pow(values[i] - mean, 2);
    }

    const rho = denom > 0 ? num / denom : 0;

    // Generate predictions
    const predictions: Array<{ value: number; lower: number; upper: number }> = [];
    let lastValue = values[values.length - 1];

    // Calculate residuals for confidence interval
    const residuals: number[] = [];
    for (let i = 1; i < values.length; i++) {
      const predicted = mean + rho * (values[i - 1] - mean);
      residuals.push(Math.abs(values[i] - predicted));
    }

    const avgResidual =
      residuals.length > 0
        ? residuals.reduce((sum, r) => sum + r, 0) / residuals.length
        : 0;
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.58;

    for (let i = 0; i < steps; i++) {
      const predicted = mean + rho * (lastValue - mean);
      const margin = zScore * avgResidual * Math.sqrt(i + 1);

      predictions.push({
        value: predicted,
        lower: predicted - margin,
        upper: predicted + margin,
      });

      lastValue = predicted;
    }

    return predictions;
  }

  /**
   * Linear regression helper
   */
  private static linearRegression(values: number[]): {
    slope: number;
    intercept: number;
    rSquared: number;
  } {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const ssResidual = y.reduce(
      (sum, val, i) => sum + Math.pow(val - (slope * x[i] + intercept), 2),
      0
    );
    const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

    return { slope, intercept, rSquared };
  }

  /**
   * Analyze trend from values (internal helper)
   */
  private static analyzeTrendFromValues(values: number[]): {
    trend: 'increasing' | 'decreasing' | 'stable';
    trendStrength: number;
  } {
    const { slope, rSquared } = this.linearRegression(values);

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 0.01) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    const trendStrength = Math.round(rSquared * 100);

    return { trend, trendStrength };
  }

  /**
   * Calculate accuracy metrics
   */
  private static calculateAccuracy(
    values: number[],
    method: ForecastMethod
  ): {
    mae: number;
    rmse: number;
    mape: number;
  } {
    // Use last 20% of data for validation
    const splitIndex = Math.floor(values.length * 0.8);
    const trainData = values.slice(0, splitIndex);
    const testData = values.slice(splitIndex);

    if (testData.length === 0) {
      return { mae: 0, rmse: 0, mape: 0 };
    }

    // Generate predictions for test period
    const predictions = this.generatePredictions(trainData, method, testData.length, 0.95);

    let sumAbsError = 0;
    let sumSquareError = 0;
    let sumPercentError = 0;

    for (let i = 0; i < testData.length; i++) {
      const actual = testData[i];
      const predicted = predictions[i].value;
      const error = Math.abs(actual - predicted);

      sumAbsError += error;
      sumSquareError += error * error;
      if (actual !== 0) {
        sumPercentError += (error / Math.abs(actual)) * 100;
      }
    }

    const mae = sumAbsError / testData.length;
    const rmse = Math.sqrt(sumSquareError / testData.length);
    const mape = sumPercentError / testData.length;

    return {
      mae: Math.round(mae * 100) / 100,
      rmse: Math.round(rmse * 100) / 100,
      mape: Math.round(mape * 10) / 10,
    };
  }
}
