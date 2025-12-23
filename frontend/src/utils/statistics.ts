/**
 * Statistical utility functions for analytics
 */

export interface StatisticalSummary {
  mean: number;
  median: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  stdDev: number;
  variance: number;
  count: number;
}

/**
 * Calculate mean (average) of an array
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate median of an array
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate quartiles (Q1, Q2/median, Q3)
 */
export function quartiles(values: number[]): { q1: number; q2: number; q3: number } {
  if (values.length === 0) return { q1: 0, q2: 0, q3: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const q2 = median(sorted);

  const lowerHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const upperHalf = sorted.slice(Math.ceil(sorted.length / 2));

  const q1 = median(lowerHalf);
  const q3 = median(upperHalf);

  return { q1, q2, q3 };
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);

  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate variance
 */
export function variance(values: number[]): number {
  const stdDev = standardDeviation(values);
  return Math.pow(stdDev, 2);
}

/**
 * Calculate Pearson correlation coefficient between two arrays
 * Returns value between -1 (perfect negative correlation) and 1 (perfect positive correlation)
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let numerator = 0;
  let sumSquareX = 0;
  let sumSquareY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;

    numerator += diffX * diffY;
    sumSquareX += diffX * diffX;
    sumSquareY += diffY * diffY;
  }

  const denominator = Math.sqrt(sumSquareX * sumSquareY);

  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Get complete statistical summary of a dataset
 */
export function getStatisticalSummary(values: number[]): StatisticalSummary {
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      q1: 0,
      q3: 0,
      stdDev: 0,
      variance: 0,
      count: 0,
    };
  }

  const { q1, q2, q3 } = quartiles(values);

  return {
    mean: mean(values),
    median: q2,
    min: Math.min(...values),
    max: Math.max(...values),
    q1,
    q3,
    stdDev: standardDeviation(values),
    variance: variance(values),
    count: values.length,
  };
}

/**
 * Create histogram bins
 */
export function createHistogram(values: number[], binCount: number = 10): { bin: string; count: number; min: number; max: number }[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / binCount;

  const bins: { bin: string; count: number; min: number; max: number }[] = [];

  for (let i = 0; i < binCount; i++) {
    const binMin = min + i * binSize;
    const binMax = min + (i + 1) * binSize;
    const count = values.filter(v => v >= binMin && (i === binCount - 1 ? v <= binMax : v < binMax)).length;

    bins.push({
      bin: `${binMin.toFixed(1)}-${binMax.toFixed(1)}`,
      count,
      min: binMin,
      max: binMax,
    });
  }

  return bins;
}

/**
 * Calculate correlation matrix for multiple variables
 */
export function correlationMatrix(data: { [key: string]: number[] }): { [key: string]: { [key: string]: number } } {
  const keys = Object.keys(data);
  const matrix: { [key: string]: { [key: string]: number } } = {};

  for (const key1 of keys) {
    matrix[key1] = {};
    for (const key2 of keys) {
      matrix[key1][key2] = pearsonCorrelation(data[key1], data[key2]);
    }
  }

  return matrix;
}

/**
 * Identify outliers using IQR method
 */
export function identifyOutliers(values: number[]): { value: number; index: number }[] {
  if (values.length < 4) return [];

  const { q1, q3 } = quartiles(values);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers: { value: number; index: number }[] = [];

  values.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      outliers.push({ value, index });
    }
  });

  return outliers;
}

/**
 * Calculate moving average
 */
export function movingAverage(values: number[], windowSize: number): number[] {
  if (values.length < windowSize) return values;

  const result: number[] = [];

  for (let i = 0; i <= values.length - windowSize; i++) {
    const window = values.slice(i, i + windowSize);
    result.push(mean(window));
  }

  return result;
}

/**
 * Normalize values to 0-1 range
 */
export function normalize(values: number[]): number[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) return values.map(() => 0.5);

  return values.map(v => (v - min) / range);
}
