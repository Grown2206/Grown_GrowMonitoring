import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { SensorForecastingService, ForecastMethod } from '../services/sensorForecastingService';

const router = express.Router();

router.use(authenticateToken);

/**
 * POST /api/sensor-forecasting/forecast/:sensorId
 * Generate forecast for sensor data
 *
 * Body:
 * {
 *   field: string,
 *   method?: 'sma' | 'ema' | 'linear_regression' | 'arima_simple',
 *   trainingHours?: number,
 *   forecastSteps?: number,
 *   confidenceLevel?: number
 * }
 */
router.post('/forecast/:sensorId', async (req, res) => {
  try {
    const sensorId = parseInt(req.params.sensorId);
    const { field, method, trainingHours, forecastSteps, confidenceLevel } = req.body;

    if (isNaN(sensorId)) {
      return res.status(400).json({ error: 'Invalid sensorId' });
    }

    if (!field || typeof field !== 'string') {
      return res.status(400).json({ error: 'field is required' });
    }

    if (
      method &&
      !['sma', 'ema', 'linear_regression', 'arima_simple'].includes(method)
    ) {
      return res.status(400).json({
        error: 'Invalid method. Must be: sma, ema, linear_regression, or arima_simple',
      });
    }

    const forecast = await SensorForecastingService.forecast(
      sensorId,
      field,
      method as ForecastMethod,
      {
        trainingHours,
        forecastSteps,
        confidenceLevel,
      }
    );

    if (!forecast) {
      return res.status(404).json({
        error: 'Sensor not found or insufficient data',
        message: 'At least 10 data points required for forecasting',
      });
    }

    res.json(forecast);
  } catch (error: any) {
    console.error('Forecast error:', error);
    res.status(500).json({ error: 'Failed to generate forecast', message: error.message });
  }
});

/**
 * POST /api/sensor-forecasting/anomalies/:sensorId
 * Detect anomalies in sensor data using prediction-based approach
 *
 * Body:
 * {
 *   field: string,
 *   lookbackHours?: number,
 *   sensitivity?: number
 * }
 */
router.post('/anomalies/:sensorId', async (req, res) => {
  try {
    const sensorId = parseInt(req.params.sensorId);
    const { field, lookbackHours, sensitivity } = req.body;

    if (isNaN(sensorId)) {
      return res.status(400).json({ error: 'Invalid sensorId' });
    }

    if (!field || typeof field !== 'string') {
      return res.status(400).json({ error: 'field is required' });
    }

    if (sensitivity && (sensitivity < 0.5 || sensitivity > 5.0)) {
      return res.status(400).json({
        error: 'sensitivity must be between 0.5 and 5.0',
      });
    }

    const anomalies = await SensorForecastingService.detectAnomalies(
      sensorId,
      field,
      lookbackHours,
      sensitivity
    );

    if (!anomalies) {
      return res.status(404).json({
        error: 'Sensor not found or insufficient data',
        message: 'At least 20 data points required for anomaly detection',
      });
    }

    res.json(anomalies);
  } catch (error: any) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({
      error: 'Failed to detect anomalies',
      message: error.message,
    });
  }
});

/**
 * POST /api/sensor-forecasting/trend/:sensorId
 * Analyze trend in sensor data
 *
 * Body:
 * {
 *   field: string,
 *   periodHours?: number
 * }
 */
router.post('/trend/:sensorId', async (req, res) => {
  try {
    const sensorId = parseInt(req.params.sensorId);
    const { field, periodHours } = req.body;

    if (isNaN(sensorId)) {
      return res.status(400).json({ error: 'Invalid sensorId' });
    }

    if (!field || typeof field !== 'string') {
      return res.status(400).json({ error: 'field is required' });
    }

    if (periodHours && (periodHours < 1 || periodHours > 168)) {
      return res.status(400).json({
        error: 'periodHours must be between 1 and 168 (7 days)',
      });
    }

    const trend = await SensorForecastingService.analyzeTrend(
      sensorId,
      field,
      periodHours
    );

    if (!trend) {
      return res.status(404).json({
        error: 'Sensor not found or insufficient data',
        message: 'At least 10 data points required for trend analysis',
      });
    }

    res.json(trend);
  } catch (error: any) {
    console.error('Trend analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze trend',
      message: error.message,
    });
  }
});

/**
 * GET /api/sensor-forecasting/methods
 * Get available forecasting methods with descriptions
 */
router.get('/methods', async (req, res) => {
  try {
    const methods = {
      sma: {
        name: 'Simple Moving Average',
        description: 'Uses average of recent values for prediction',
        bestFor: 'Stable, non-trending data',
        complexity: 'Low',
        speed: 'Fast',
      },
      ema: {
        name: 'Exponential Moving Average',
        description: 'Weights recent values more heavily than older values',
        bestFor: 'Data with gradual changes',
        complexity: 'Low',
        speed: 'Fast',
      },
      linear_regression: {
        name: 'Linear Regression',
        description: 'Fits a straight line through historical data',
        bestFor: 'Data with clear linear trends',
        complexity: 'Medium',
        speed: 'Fast',
      },
      arima_simple: {
        name: 'Simple ARIMA (AR1)',
        description: 'Basic autoregressive model with lag-1 correlation',
        bestFor: 'Data with autocorrelation',
        complexity: 'Medium',
        speed: 'Medium',
      },
    };

    res.json(methods);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get methods', message: error.message });
  }
});

/**
 * GET /api/sensor-forecasting/examples
 * Get example configurations for different use cases
 */
router.get('/examples', async (req, res) => {
  try {
    const examples = {
      shortTermPrediction: {
        description: 'Predict next hour (12 steps at 5-min intervals)',
        config: {
          method: 'ema',
          trainingHours: 24,
          forecastSteps: 12,
          confidenceLevel: 0.95,
        },
        usage: 'POST /api/sensor-forecasting/forecast/:sensorId',
      },
      trendAnalysis: {
        description: 'Analyze 48-hour trend with 24h and 48h forecasts',
        config: {
          periodHours: 48,
        },
        usage: 'POST /api/sensor-forecasting/trend/:sensorId',
      },
      anomalyDetection: {
        description: 'Detect anomalies in last 24 hours with medium sensitivity',
        config: {
          lookbackHours: 24,
          sensitivity: 2.0,
        },
        usage: 'POST /api/sensor-forecasting/anomalies/:sensorId',
      },
      longTermForecast: {
        description: 'Predict next 24 hours using linear regression',
        config: {
          method: 'linear_regression',
          trainingHours: 168, // 7 days
          forecastSteps: 288, // 24 hours
          confidenceLevel: 0.95,
        },
        usage: 'POST /api/sensor-forecasting/forecast/:sensorId',
      },
    };

    res.json(examples);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get examples', message: error.message });
  }
});

export default router;
