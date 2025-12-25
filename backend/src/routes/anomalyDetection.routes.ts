import express from 'express';
import { AnomalyDetectionService, AnomalyDetectionMethod } from '../services/anomalyDetectionService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/anomaly-detection/detect/:sensorId
 * Detect anomalies for a specific sensor
 */
router.post('/detect/:sensorId', authenticateToken, async (req, res) => {
  try {
    const sensorId = parseInt(req.params.sensorId);
    const {
      hours = 24,
      method = 'combined',
      zScoreThreshold = 3,
      iqrMultiplier = 1.5,
    } = req.body;

    if (isNaN(sensorId)) {
      return res.status(400).json({ error: 'Invalid sensor ID' });
    }

    const validMethods: AnomalyDetectionMethod[] = ['zscore', 'iqr', 'threshold', 'combined'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ error: 'Invalid detection method' });
    }

    const result = await AnomalyDetectionService.detectAnomalies(
      sensorId,
      hours,
      method,
      zScoreThreshold,
      iqrMultiplier
    );

    if (!result) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error detecting anomalies:', error);
    res.status(500).json({ error: 'Failed to detect anomalies', message: error.message });
  }
});

/**
 * GET /api/anomaly-detection/summary
 * Get anomaly detection summary across all sensors
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;

    const summary = await AnomalyDetectionService.getAnomalySummary(hours);
    res.json(summary);
  } catch (error: any) {
    console.error('Error getting anomaly summary:', error);
    res.status(500).json({ error: 'Failed to get anomaly summary', message: error.message });
  }
});

/**
 * GET /api/anomaly-detection/methods
 * Get available detection methods with descriptions
 */
router.get('/methods', authenticateToken, async (req, res) => {
  try {
    const methods = [
      {
        id: 'zscore',
        name: 'Z-Score',
        description:
          'Statistische Methode basierend auf Standardabweichung. Ideal für normalverteilte Daten.',
        parameters: {
          threshold: {
            default: 3,
            description: 'Z-Score Schwellwert (typisch: 2-4)',
          },
        },
      },
      {
        id: 'iqr',
        name: 'IQR (Interquartile Range)',
        description:
          'Robuste Methode basierend auf Quartilen. Gut für Daten mit Ausreißern.',
        parameters: {
          multiplier: {
            default: 1.5,
            description: 'IQR Multiplikator (typisch: 1.5-3)',
          },
        },
      },
      {
        id: 'threshold',
        name: 'Schwellwert-Methode',
        description:
          'Verwendet definierte Min/Max-Werte des Sensors. Einfach und direkt.',
        parameters: {},
      },
      {
        id: 'combined',
        name: 'Kombinierte Methode',
        description:
          'Kombiniert alle Methoden für maximale Erkennungsrate. Empfohlen für die meisten Fälle.',
        parameters: {
          threshold: {
            default: 3,
            description: 'Z-Score Schwellwert',
          },
          multiplier: {
            default: 1.5,
            description: 'IQR Multiplikator',
          },
        },
      },
    ];

    res.json(methods);
  } catch (error: any) {
    console.error('Error getting methods:', error);
    res.status(500).json({ error: 'Failed to get methods', message: error.message });
  }
});

/**
 * GET /api/anomaly-detection/examples
 * Get example anomaly detection results for documentation
 */
router.get('/examples', authenticateToken, async (req, res) => {
  try {
    const examples = {
      zscore: {
        description: 'Anomalie erkannt durch Z-Score > 3',
        example: {
          timestamp: new Date(),
          sensorId: 1,
          sensorName: 'Temperatur Sensor',
          value: 35.5,
          expectedValue: 22.5,
          deviation: 13.0,
          severity: 'high',
          method: 'zscore',
          confidence: 95,
          description: 'Z-Score: 4.2 (Schwellwert: 3)',
        },
      },
      iqr: {
        description: 'Anomalie erkannt durch IQR-Methode',
        example: {
          timestamp: new Date(),
          sensorId: 2,
          sensorName: 'Luftfeuchtigkeit',
          value: 85,
          expectedValue: 70,
          deviation: 15,
          severity: 'medium',
          method: 'iqr',
          confidence: 80,
          description: 'Außerhalb IQR-Bereich: [40.0, 70.0]',
        },
      },
      threshold: {
        description: 'Anomalie erkannt durch Schwellwert-Verletzung',
        example: {
          timestamp: new Date(),
          sensorId: 3,
          sensorName: 'pH-Wert',
          value: 4.5,
          expectedValue: 5.5,
          deviation: -1.0,
          severity: 'critical',
          method: 'threshold',
          confidence: 90,
          description: 'Außerhalb des definierten Bereichs: [5.5, 7.0]',
        },
      },
    };

    res.json(examples);
  } catch (error: any) {
    console.error('Error getting examples:', error);
    res.status(500).json({ error: 'Failed to get examples', message: error.message });
  }
});

export default router;
