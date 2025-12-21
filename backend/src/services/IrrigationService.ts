import { IrrigationConfig } from '../models/IrrigationConfig';
import { IrrigationLog } from '../models/IrrigationLog';
import { Plant } from '../models/Plant';
import { SensorData } from '../models/SensorData';
import { Op } from 'sequelize';

export class IrrigationService {
  async checkAutomaticIrrigation(sensorId: number, moistureLevel: number) {
    try {
      // Find plant with this sensor
      const plant = await Plant.findOne({
        where: { sensorId, isActive: true },
        include: [{ model: IrrigationConfig, as: 'irrigationConfig' }],
      });

      if (!plant) return;

      const config = plant.get('irrigationConfig') as IrrigationConfig | undefined;
      if (!config || !config.enabled) return;

      // Check if moisture is below threshold
      if (moistureLevel >= config.moistureThreshold) return;

      // Check cooldown
      if (config.lastTriggered) {
        const now = new Date();
        const lastTriggered = new Date(config.lastTriggered);
        const cooldownMs = config.cooldownMinutes * 60 * 1000;
        const timeSinceLastTrigger = now.getTime() - lastTriggered.getTime();

        if (timeSinceLastTrigger < cooldownMs) {
          console.log(`Irrigation for plant ${plant.name} in cooldown period`);
          return;
        }
      }

      // Trigger automatic irrigation
      await this.triggerIrrigation(plant.id, config.pumpId, config.pumpDurationSeconds, moistureLevel, 'automatic');

      // Update last triggered
      await config.update({ lastTriggered: new Date() });

      console.log(`✓ Automatic irrigation triggered for plant: ${plant.name}`);
    } catch (error) {
      console.error('Error in automatic irrigation:', error);
    }
  }

  async triggerIrrigation(
    plantId: number,
    pumpId: number,
    durationSeconds: number,
    moistureLevel: number,
    triggeredBy: 'manual' | 'automatic'
  ) {
    // Log irrigation event
    await IrrigationLog.create({
      plantId,
      pumpId,
      moistureLevel,
      durationSeconds,
      triggeredBy,
      timestamp: new Date(),
    });

    // Return pump control command for WebSocket broadcast
    return {
      pumpId,
      action: 'start',
      duration: durationSeconds,
    };
  }

  async getIrrigationHistory(plantId?: number, limit: number = 50) {
    const where = plantId ? { plantId } : {};

    return IrrigationLog.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit,
      include: [{ model: Plant, as: 'plant', attributes: ['name'] }],
    });
  }
}

export const irrigationService = new IrrigationService();
