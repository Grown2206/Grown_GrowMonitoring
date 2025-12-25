import express, { Request, Response } from 'express';
import { YieldPredictionService, PredictionMethod } from '../services/yieldPredictionService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * @route POST /api/yield-prediction/predict/:plantId
 * @desc Predict yield for a specific plant
 */
router.post('/predict/:plantId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { plantId } = req.params;
    const { method = 'combined' } = req.body as { method?: PredictionMethod };

    const prediction = await YieldPredictionService.predictYield(
      parseInt(plantId),
      method
    );

    if (!prediction) {
      return res.status(404).json({ error: 'Plant or strain not found' });
    }

    res.json(prediction);
  } catch (error: any) {
    console.error('Error predicting yield:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/yield-prediction/strain-statistics/:strainId
 * @desc Get yield statistics for a strain
 */
router.get('/strain-statistics/:strainId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { strainId } = req.params;

    const statistics = await YieldPredictionService.getStrainStatistics(parseInt(strainId));

    res.json(statistics);
  } catch (error: any) {
    console.error('Error getting strain statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/yield-prediction/methods
 * @desc Get available prediction methods
 */
router.get('/methods', authenticateToken, async (req: Request, res: Response) => {
  try {
    const methods = [
      {
        id: 'historical_average',
        name: 'Historischer Durchschnitt',
        description: 'Basiert auf durchschnittlichen Erträgen der Strain aus vergangenen Grows',
        confidence: 'Hoch (bei ausreichend Daten)',
        bestFor: 'Strain mit vielen abgeschlossenen Grows',
      },
      {
        id: 'linear_growth',
        name: 'Lineares Wachstum',
        description: 'Berechnet Ertrag basierend auf aktuellem Wachstumsfortschritt',
        confidence: 'Mittel',
        bestFor: 'Pflanzen in der Mitte des Grow-Zyklus',
      },
      {
        id: 'environmental_weighted',
        name: 'Umgebungsbasiert',
        description: 'Stark gewichtet nach aktuellen Umgebungsbedingungen',
        confidence: 'Mittel-Hoch',
        bestFor: 'Optimale oder suboptimale Bedingungen',
      },
      {
        id: 'combined',
        name: 'Kombiniert (Empfohlen)',
        description: 'Gewichteter Durchschnitt aller Methoden für beste Genauigkeit',
        confidence: 'Sehr Hoch',
        bestFor: 'Alle Szenarien - ausgewogene Vorhersage',
      },
    ];

    res.json(methods);
  } catch (error: any) {
    console.error('Error getting methods:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/yield-prediction/examples
 * @desc Get example predictions
 */
router.get('/examples', authenticateToken, async (req: Request, res: Response) => {
  try {
    const examples = [
      {
        scenario: 'Optimal Conditions',
        description: 'Pflanze mit optimalen Umgebungsbedingungen',
        expectedYield: '80-120g',
        confidence: 85,
        factors: {
          strain: 'Northern Lights (historisch: 100g avg)',
          environment: '95/100 (optimal)',
          growthProgress: '75%',
        },
      },
      {
        scenario: 'Suboptimal Temperature',
        description: 'Zu hohe Temperaturen reduzieren Ertrag',
        expectedYield: '50-80g',
        confidence: 75,
        factors: {
          strain: 'OG Kush (historisch: 90g avg)',
          environment: '60/100 (Temp zu hoch)',
          growthProgress: '80%',
        },
      },
      {
        scenario: 'New Strain (No History)',
        description: 'Neue Strain ohne historische Daten',
        expectedYield: '40-100g',
        confidence: 50,
        factors: {
          strain: 'Custom Strain (keine Daten)',
          environment: '80/100',
          growthProgress: '65%',
        },
      },
    ];

    res.json(examples);
  } catch (error: any) {
    console.error('Error getting examples:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
