import { Plant, Strain, Harvest, SensorData, Sensor } from '../models';
import { Op } from 'sequelize';

/**
 * Yield Prediction Service
 * Predicts harvest yields based on historical data, strain genetics, and environmental conditions
 */

export type PredictionMethod =
  | 'historical_average'
  | 'linear_growth'
  | 'environmental_weighted'
  | 'combined';

export interface YieldPrediction {
  plantId: number;
  plantName: string;
  strainName: string;
  method: PredictionMethod;
  predictedYield: number; // in grams
  confidenceScore: number; // 0-100
  expectedRange: {
    min: number;
    max: number;
  };
  estimatedDaysToHarvest: number;
  factors: {
    strainQuality: number; // 0-100
    growthProgress: number; // 0-100
    environmentalScore: number; // 0-100
    historicalData: boolean;
  };
  recommendations: string[];
  timestamp: Date;
}

export interface StrainYieldStatistics {
  strainId: number;
  strainName: string;
  totalHarvests: number;
  averageYield: number;
  minYield: number;
  maxYield: number;
  stdDeviation: number;
  averageGrowDays: number;
  successRate: number; // Percentage of successful grows
}

export interface EnvironmentalImpact {
  temperature: {
    average: number;
    optimal: boolean;
    impact: number; // -100 to +100
  };
  humidity: {
    average: number;
    optimal: boolean;
    impact: number;
  };
  light: {
    dailyAverage: number;
    optimal: boolean;
    impact: number;
  };
  overallScore: number; // 0-100
}

export class YieldPredictionService {
  /**
   * Predict yield for a plant
   */
  static async predictYield(
    plantId: number,
    method: PredictionMethod = 'combined'
  ): Promise<YieldPrediction | null> {
    const plant = await Plant.findByPk(plantId, {
      include: [{ model: Strain, as: 'strain' }],
    });

    if (!plant || !plant.strain) {
      return null;
    }

    const growDays = this.calculateGrowDays(plant);
    const strainStats = await this.getStrainStatistics(plant.strain.id);
    const environmentalImpact = await this.analyzeEnvironment(plantId);

    let prediction: YieldPrediction;

    switch (method) {
      case 'historical_average':
        prediction = await this.predictByHistoricalAverage(
          plant,
          strainStats,
          growDays,
          environmentalImpact
        );
        break;
      case 'linear_growth':
        prediction = await this.predictByLinearGrowth(
          plant,
          strainStats,
          growDays,
          environmentalImpact
        );
        break;
      case 'environmental_weighted':
        prediction = await this.predictByEnvironment(
          plant,
          strainStats,
          growDays,
          environmentalImpact
        );
        break;
      case 'combined':
      default:
        prediction = await this.predictCombined(plant, strainStats, growDays, environmentalImpact);
        break;
    }

    return prediction;
  }

  /**
   * Get yield statistics for a strain
   */
  static async getStrainStatistics(strainId: number): Promise<StrainYieldStatistics> {
    const harvests = await Harvest.findAll({
      include: [
        {
          model: Plant,
          as: 'plant',
          where: { strainId },
          required: true,
        },
      ],
    });

    if (harvests.length === 0) {
      // Return default statistics if no historical data
      return {
        strainId,
        strainName: 'Unknown',
        totalHarvests: 0,
        averageYield: 50, // Default estimate in grams
        minYield: 20,
        maxYield: 100,
        stdDeviation: 20,
        averageGrowDays: 90,
        successRate: 70,
      };
    }

    const yields = harvests.map((h) => h.dryWeight || 0).filter((y) => y > 0);
    const averageYield = yields.reduce((sum, y) => sum + y, 0) / yields.length;
    const minYield = Math.min(...yields);
    const maxYield = Math.max(...yields);

    // Calculate standard deviation
    const variance =
      yields.reduce((sum, y) => sum + Math.pow(y - averageYield, 2), 0) / yields.length;
    const stdDeviation = Math.sqrt(variance);

    // Calculate average grow days
    const growDays = await Promise.all(
      harvests.map(async (h) => {
        const plant = await Plant.findByPk(h.plantId);
        if (plant && plant.plantedDate) {
          const planted = new Date(plant.plantedDate);
          const harvested = new Date(h.harvestDate);
          return Math.floor((harvested.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
        }
        return 90; // Default
      })
    );

    const averageGrowDays =
      growDays.reduce((sum, d) => sum + d, 0) / growDays.length;

    const strain = await Strain.findByPk(strainId);

    return {
      strainId,
      strainName: strain?.name || 'Unknown',
      totalHarvests: harvests.length,
      averageYield,
      minYield,
      maxYield,
      stdDeviation,
      averageGrowDays,
      successRate: (yields.length / harvests.length) * 100,
    };
  }

  /**
   * Analyze environmental conditions
   */
  private static async analyzeEnvironment(plantId: number): Promise<EnvironmentalImpact> {
    const plant = await Plant.findByPk(plantId);
    if (!plant || !plant.sensorId) {
      return this.getDefaultEnvironmentalImpact();
    }

    // Get sensor data for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const sensorData = await SensorData.findAll({
      where: {
        sensorId: plant.sensorId,
        timestamp: { [Op.gte]: thirtyDaysAgo },
      },
      order: [['timestamp', 'DESC']],
    });

    if (sensorData.length === 0) {
      return this.getDefaultEnvironmentalImpact();
    }

    // Calculate averages
    const temperatures = sensorData
      .map((d) => d.temperature)
      .filter((t) => t !== null && t !== undefined) as number[];
    const humidities = sensorData
      .map((d) => d.humidity)
      .filter((h) => h !== null && h !== undefined) as number[];
    const lights = sensorData
      .map((d) => d.light)
      .filter((l) => l !== null && l !== undefined) as number[];

    const avgTemp =
      temperatures.length > 0
        ? temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length
        : 22;
    const avgHumidity =
      humidities.length > 0
        ? humidities.reduce((sum, h) => sum + h, 0) / humidities.length
        : 60;
    const avgLight =
      lights.length > 0 ? lights.reduce((sum, l) => sum + l, 0) / lights.length : 30000;

    // Optimal ranges (for flowering phase)
    const tempOptimal = avgTemp >= 20 && avgTemp <= 26;
    const humidityOptimal = avgHumidity >= 40 && avgHumidity <= 60;
    const lightOptimal = avgLight >= 25000 && avgLight <= 50000;

    // Calculate impact scores
    const tempImpact = this.calculateImpact(avgTemp, 23, 3); // Optimal: 23°C ± 3°C
    const humidityImpact = this.calculateImpact(avgHumidity, 50, 10); // Optimal: 50% ± 10%
    const lightImpact = this.calculateImpact(avgLight, 35000, 15000); // Optimal: 35k ± 15k lux

    const overallScore = Math.round((tempImpact + humidityImpact + lightImpact) / 3);

    return {
      temperature: {
        average: avgTemp,
        optimal: tempOptimal,
        impact: tempImpact,
      },
      humidity: {
        average: avgHumidity,
        optimal: humidityOptimal,
        impact: humidityImpact,
      },
      light: {
        dailyAverage: avgLight,
        optimal: lightOptimal,
        impact: lightImpact,
      },
      overallScore,
    };
  }

  /**
   * Calculate impact score (-100 to +100) based on deviation from optimal
   */
  private static calculateImpact(value: number, optimal: number, tolerance: number): number {
    const deviation = Math.abs(value - optimal);
    if (deviation <= tolerance) {
      return 100 - (deviation / tolerance) * 100;
    } else {
      const excessDeviation = deviation - tolerance;
      const penalty = Math.min(excessDeviation / tolerance, 2) * 100;
      return Math.max(-100, 0 - penalty);
    }
  }

  /**
   * Predict by historical average
   */
  private static async predictByHistoricalAverage(
    plant: Plant,
    strainStats: StrainYieldStatistics,
    growDays: number,
    envImpact: EnvironmentalImpact
  ): Promise<YieldPrediction> {
    const baseYield = strainStats.averageYield;
    const environmentalFactor = 1 + envImpact.overallScore / 200; // 0.5 to 1.5 multiplier

    const predictedYield = baseYield * environmentalFactor;
    const range = strainStats.stdDeviation * 1.5;

    const daysRemaining = Math.max(0, strainStats.averageGrowDays - growDays);
    const confidence = strainStats.totalHarvests > 0 ? Math.min(strainStats.totalHarvests * 10, 90) : 50;

    return {
      plantId: plant.id,
      plantName: plant.name,
      strainName: plant.strain?.name || 'Unknown',
      method: 'historical_average',
      predictedYield: Math.round(predictedYield),
      confidenceScore: confidence,
      expectedRange: {
        min: Math.max(0, Math.round(predictedYield - range)),
        max: Math.round(predictedYield + range),
      },
      estimatedDaysToHarvest: Math.round(daysRemaining),
      factors: {
        strainQuality: Math.min(100, strainStats.successRate),
        growthProgress: Math.min(100, (growDays / strainStats.averageGrowDays) * 100),
        environmentalScore: envImpact.overallScore,
        historicalData: strainStats.totalHarvests > 0,
      },
      recommendations: this.generateRecommendations(envImpact, strainStats, growDays),
      timestamp: new Date(),
    };
  }

  /**
   * Predict by linear growth
   */
  private static async predictByLinearGrowth(
    plant: Plant,
    strainStats: StrainYieldStatistics,
    growDays: number,
    envImpact: EnvironmentalImpact
  ): Promise<YieldPrediction> {
    // Linear growth assumption: yield increases proportionally with grow days up to a point
    const expectedDays = strainStats.averageGrowDays;
    const progressRatio = Math.min(growDays / expectedDays, 1);

    const baseYield = strainStats.averageYield * progressRatio;
    const environmentalFactor = 1 + envImpact.overallScore / 200;

    const predictedYield = baseYield * environmentalFactor;
    const range = predictedYield * 0.25; // ±25% range

    const daysRemaining = Math.max(0, expectedDays - growDays);
    const confidence = Math.min(70 + progressRatio * 20, 85);

    return {
      plantId: plant.id,
      plantName: plant.name,
      strainName: plant.strain?.name || 'Unknown',
      method: 'linear_growth',
      predictedYield: Math.round(predictedYield),
      confidenceScore: Math.round(confidence),
      expectedRange: {
        min: Math.round(predictedYield - range),
        max: Math.round(predictedYield + range),
      },
      estimatedDaysToHarvest: Math.round(daysRemaining),
      factors: {
        strainQuality: Math.min(100, strainStats.successRate),
        growthProgress: Math.min(100, progressRatio * 100),
        environmentalScore: envImpact.overallScore,
        historicalData: strainStats.totalHarvests > 0,
      },
      recommendations: this.generateRecommendations(envImpact, strainStats, growDays),
      timestamp: new Date(),
    };
  }

  /**
   * Predict by environmental conditions
   */
  private static async predictByEnvironment(
    plant: Plant,
    strainStats: StrainYieldStatistics,
    growDays: number,
    envImpact: EnvironmentalImpact
  ): Promise<YieldPrediction> {
    const baseYield = strainStats.averageYield;
    const envScore = envImpact.overallScore;

    // Strong environmental influence
    let multiplier = 1.0;
    if (envScore >= 80) multiplier = 1.3;
    else if (envScore >= 60) multiplier = 1.1;
    else if (envScore >= 40) multiplier = 1.0;
    else if (envScore >= 20) multiplier = 0.85;
    else multiplier = 0.7;

    const predictedYield = baseYield * multiplier;
    const range = predictedYield * 0.3;

    const daysRemaining = Math.max(0, strainStats.averageGrowDays - growDays);
    const confidence = Math.min(60 + envScore / 2, 85);

    return {
      plantId: plant.id,
      plantName: plant.name,
      strainName: plant.strain?.name || 'Unknown',
      method: 'environmental_weighted',
      predictedYield: Math.round(predictedYield),
      confidenceScore: Math.round(confidence),
      expectedRange: {
        min: Math.round(predictedYield - range),
        max: Math.round(predictedYield + range),
      },
      estimatedDaysToHarvest: Math.round(daysRemaining),
      factors: {
        strainQuality: Math.min(100, strainStats.successRate),
        growthProgress: Math.min(100, (growDays / strainStats.averageGrowDays) * 100),
        environmentalScore: envScore,
        historicalData: strainStats.totalHarvests > 0,
      },
      recommendations: this.generateRecommendations(envImpact, strainStats, growDays),
      timestamp: new Date(),
    };
  }

  /**
   * Combined prediction (weighted average of all methods)
   */
  private static async predictCombined(
    plant: Plant,
    strainStats: StrainYieldStatistics,
    growDays: number,
    envImpact: EnvironmentalImpact
  ): Promise<YieldPrediction> {
    const historical = await this.predictByHistoricalAverage(plant, strainStats, growDays, envImpact);
    const linear = await this.predictByLinearGrowth(plant, strainStats, growDays, envImpact);
    const environmental = await this.predictByEnvironment(plant, strainStats, growDays, envImpact);

    // Weighted average (historical data gets more weight if available)
    const historicalWeight = strainStats.totalHarvests > 0 ? 0.4 : 0.2;
    const linearWeight = 0.3;
    const environmentalWeight = 0.3;

    const predictedYield =
      historical.predictedYield * historicalWeight +
      linear.predictedYield * linearWeight +
      environmental.predictedYield * environmentalWeight;

    const minYield = Math.min(
      historical.expectedRange.min,
      linear.expectedRange.min,
      environmental.expectedRange.min
    );
    const maxYield = Math.max(
      historical.expectedRange.max,
      linear.expectedRange.max,
      environmental.expectedRange.max
    );

    const confidence =
      (historical.confidenceScore * historicalWeight +
        linear.confidenceScore * linearWeight +
        environmental.confidenceScore * environmentalWeight) *
      (strainStats.totalHarvests > 0 ? 1.1 : 0.9);

    return {
      plantId: plant.id,
      plantName: plant.name,
      strainName: plant.strain?.name || 'Unknown',
      method: 'combined',
      predictedYield: Math.round(predictedYield),
      confidenceScore: Math.min(Math.round(confidence), 95),
      expectedRange: {
        min: Math.round(minYield),
        max: Math.round(maxYield),
      },
      estimatedDaysToHarvest: Math.round(historical.estimatedDaysToHarvest),
      factors: {
        strainQuality: Math.min(100, strainStats.successRate),
        growthProgress: Math.min(100, (growDays / strainStats.averageGrowDays) * 100),
        environmentalScore: envImpact.overallScore,
        historicalData: strainStats.totalHarvests > 0,
      },
      recommendations: this.generateRecommendations(envImpact, strainStats, growDays),
      timestamp: new Date(),
    };
  }

  /**
   * Calculate grow days for a plant
   */
  private static calculateGrowDays(plant: Plant): number {
    if (!plant.plantedDate) {
      return 30; // Default
    }

    const planted = new Date(plant.plantedDate);
    const now = new Date();
    return Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate recommendations based on analysis
   */
  private static generateRecommendations(
    envImpact: EnvironmentalImpact,
    strainStats: StrainYieldStatistics,
    growDays: number
  ): string[] {
    const recommendations: string[] = [];

    // Temperature recommendations
    if (!envImpact.temperature.optimal) {
      if (envImpact.temperature.average < 20) {
        recommendations.push('Erhöhen Sie die Temperatur auf 22-26°C für optimales Wachstum');
      } else if (envImpact.temperature.average > 26) {
        recommendations.push('Senken Sie die Temperatur auf 22-26°C um Stress zu vermeiden');
      }
    }

    // Humidity recommendations
    if (!envImpact.humidity.optimal) {
      if (envImpact.humidity.average < 40) {
        recommendations.push('Erhöhen Sie die Luftfeuchtigkeit auf 40-60% für bessere Erträge');
      } else if (envImpact.humidity.average > 60) {
        recommendations.push('Senken Sie die Luftfeuchtigkeit auf 40-60% um Schimmel zu vermeiden');
      }
    }

    // Light recommendations
    if (!envImpact.light.optimal) {
      if (envImpact.light.dailyAverage < 25000) {
        recommendations.push('Erhöhen Sie die Lichtintensität für besseres Wachstum');
      }
    }

    // Overall environmental score
    if (envImpact.overallScore < 50) {
      recommendations.push('Optimieren Sie die Umgebungsbedingungen für höhere Erträge');
    }

    // Growth stage recommendations
    const expectedDays = strainStats.averageGrowDays;
    const progress = (growDays / expectedDays) * 100;

    if (progress > 80) {
      recommendations.push('Pflanze nähert sich der Erntezeit - beobachten Sie die Trichome');
    } else if (progress > 60) {
      recommendations.push('Flowering-Phase - optimale Bedingungen halten für maximale Erträge');
    } else if (progress < 30) {
      recommendations.push('Vegetative Phase - fokussieren Sie auf gesundes Wachstum');
    }

    return recommendations;
  }

  /**
   * Get default environmental impact
   */
  private static getDefaultEnvironmentalImpact(): EnvironmentalImpact {
    return {
      temperature: {
        average: 23,
        optimal: true,
        impact: 80,
      },
      humidity: {
        average: 50,
        optimal: true,
        impact: 80,
      },
      light: {
        dailyAverage: 30000,
        optimal: true,
        impact: 80,
      },
      overallScore: 80,
    };
  }
}
