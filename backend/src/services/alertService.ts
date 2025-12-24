import axios from 'axios';
import { Alert } from '../models/Alert';

export interface AlertPayload {
  condition: string;
  threshold: number;
  currentValue: number;
  sensorId?: number;
  plantId?: number;
}

export class AlertService {
  /**
   * Send Telegram alert
   */
  static async sendTelegramAlert(alert: Alert, payload: AlertPayload): Promise<boolean> {
    if (!alert.telegramBotToken || !alert.telegramChatId) {
      console.error('Telegram credentials missing');
      return false;
    }

    const message = this.formatAlertMessage(alert, payload);

    try {
      const url = `https://api.telegram.org/bot${alert.telegramBotToken}/sendMessage`;
      await axios.post(url, {
        chat_id: alert.telegramChatId,
        text: message,
        parse_mode: 'Markdown',
      });

      console.log(`Telegram alert sent: ${alert.name}`);
      return true;
    } catch (error: any) {
      console.error('Failed to send Telegram alert:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Send Discord alert
   */
  static async sendDiscordAlert(alert: Alert, payload: AlertPayload): Promise<boolean> {
    if (!alert.discordWebhookUrl) {
      console.error('Discord webhook URL missing');
      return false;
    }

    const embed = this.formatDiscordEmbed(alert, payload);

    try {
      await axios.post(alert.discordWebhookUrl, {
        embeds: [embed],
      });

      console.log(`Discord alert sent: ${alert.name}`);
      return true;
    } catch (error: any) {
      console.error('Failed to send Discord alert:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Send Email alert (existing)
   */
  static async sendEmailAlert(alert: Alert, payload: AlertPayload): Promise<boolean> {
    // Placeholder - implement with nodemailer or similar
    console.log(`Email alert would be sent to: ${alert.recipientEmail}`);
    console.log(`Subject: Grow Monitor Alert - ${alert.name}`);
    console.log(`Message: ${this.formatAlertMessage(alert, payload)}`);
    return true;
  }

  /**
   * Send Webhook alert (existing)
   */
  static async sendWebhookAlert(alert: Alert, payload: AlertPayload): Promise<boolean> {
    if (!alert.webhookUrl) {
      console.error('Webhook URL missing');
      return false;
    }

    try {
      await axios.post(alert.webhookUrl, {
        alert: {
          name: alert.name,
          condition: alert.condition,
          threshold: alert.threshold,
        },
        ...payload,
        timestamp: new Date().toISOString(),
      });

      console.log(`Webhook alert sent: ${alert.name}`);
      return true;
    } catch (error: any) {
      console.error('Failed to send webhook alert:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Trigger alert based on type
   */
  static async triggerAlert(alert: Alert, payload: AlertPayload): Promise<boolean> {
    // Check cooldown
    if (alert.lastTriggered) {
      const cooldownMs = alert.cooldownMinutes * 60 * 1000;
      const timeSinceLastTrigger = Date.now() - new Date(alert.lastTriggered).getTime();

      if (timeSinceLastTrigger < cooldownMs) {
        console.log(`Alert "${alert.name}" is in cooldown period`);
        return false;
      }
    }

    let success = false;

    switch (alert.type) {
      case 'telegram':
        success = await this.sendTelegramAlert(alert, payload);
        break;
      case 'discord':
        success = await this.sendDiscordAlert(alert, payload);
        break;
      case 'email':
        success = await this.sendEmailAlert(alert, payload);
        break;
      case 'webhook':
        success = await this.sendWebhookAlert(alert, payload);
        break;
    }

    if (success) {
      await alert.update({ lastTriggered: new Date() });
    }

    return success;
  }

  /**
   * Format alert message for text-based channels (Telegram, Email)
   */
  private static formatAlertMessage(alert: Alert, payload: AlertPayload): string {
    const { condition, threshold, currentValue, sensorId, plantId } = payload;

    const conditionText = this.getConditionText(condition);
    const emoji = this.getConditionEmoji(condition);

    let message = `${emoji} **Grow Monitor Alert**\n\n`;
    message += `**Name:** ${alert.name}\n`;
    message += `**Bedingung:** ${conditionText}\n`;
    message += `**Schwellenwert:** ${threshold}\n`;
    message += `**Aktueller Wert:** ${currentValue.toFixed(2)}\n`;

    if (sensorId) {
      message += `**Sensor ID:** ${sensorId}\n`;
    }

    if (plantId) {
      message += `**Pflanzen ID:** ${plantId}\n`;
    }

    message += `\n**Zeitstempel:** ${new Date().toLocaleString('de-DE')}`;

    return message;
  }

  /**
   * Format Discord embed
   */
  private static formatDiscordEmbed(alert: Alert, payload: AlertPayload) {
    const { condition, threshold, currentValue, sensorId, plantId } = payload;

    const color = this.getConditionColor(condition);
    const emoji = this.getConditionEmoji(condition);

    return {
      title: `${emoji} Grow Monitor Alert`,
      description: `**${alert.name}**`,
      color: color,
      fields: [
        {
          name: 'Bedingung',
          value: this.getConditionText(condition),
          inline: true,
        },
        {
          name: 'Schwellenwert',
          value: threshold.toString(),
          inline: true,
        },
        {
          name: 'Aktueller Wert',
          value: currentValue.toFixed(2),
          inline: true,
        },
        ...(sensorId ? [{ name: 'Sensor ID', value: sensorId.toString(), inline: true }] : []),
        ...(plantId ? [{ name: 'Pflanzen ID', value: plantId.toString(), inline: true }] : []),
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Grow Monitoring System',
      },
    };
  }

  /**
   * Get condition display text
   */
  private static getConditionText(condition: string): string {
    const map: { [key: string]: string } = {
      tank_low: 'Wassertank niedrig',
      nutrient_low: 'Nährstoffe niedrig',
      nutrient_high: 'Nährstoffe hoch',
      moisture_low: 'Bodenfeuchtigkeit niedrig',
      moisture_high: 'Bodenfeuchtigkeit hoch',
      temperature_high: 'Temperatur zu hoch',
      temperature_low: 'Temperatur zu niedrig',
      humidity_high: 'Luftfeuchtigkeit zu hoch',
      humidity_low: 'Luftfeuchtigkeit zu niedrig',
    };

    return map[condition] || condition;
  }

  /**
   * Get emoji for condition
   */
  private static getConditionEmoji(condition: string): string {
    if (condition.includes('low') || condition.includes('niedrig')) return '⚠️';
    if (condition.includes('high') || condition.includes('hoch')) return '🔥';
    return '📊';
  }

  /**
   * Get Discord color for condition
   */
  private static getConditionColor(condition: string): number {
    // Discord colors in decimal
    if (condition.includes('low')) return 16776960; // Yellow
    if (condition.includes('high')) return 16711680; // Red
    return 3447003; // Blue
  }

  /**
   * Check sensor data against alerts
   */
  static async checkSensorAlerts(sensorData: {
    sensorId: number;
    moistureLevel: number;
    temperature?: number;
    humidity?: number;
    tankLevel?: number;
    nutrientLevel?: number;
  }): Promise<void> {
    const alerts = await Alert.findAll({ where: { enabled: true } });

    for (const alert of alerts) {
      let shouldTrigger = false;
      let currentValue = 0;

      switch (alert.condition) {
        case 'moisture_low':
          currentValue = sensorData.moistureLevel;
          shouldTrigger = currentValue < alert.threshold;
          break;
        case 'moisture_high':
          currentValue = sensorData.moistureLevel;
          shouldTrigger = currentValue > alert.threshold;
          break;
        case 'temperature_low':
          if (sensorData.temperature !== undefined) {
            currentValue = sensorData.temperature;
            shouldTrigger = currentValue < alert.threshold;
          }
          break;
        case 'temperature_high':
          if (sensorData.temperature !== undefined) {
            currentValue = sensorData.temperature;
            shouldTrigger = currentValue > alert.threshold;
          }
          break;
        case 'humidity_low':
          if (sensorData.humidity !== undefined) {
            currentValue = sensorData.humidity;
            shouldTrigger = currentValue < alert.threshold;
          }
          break;
        case 'humidity_high':
          if (sensorData.humidity !== undefined) {
            currentValue = sensorData.humidity;
            shouldTrigger = currentValue > alert.threshold;
          }
          break;
        case 'tank_low':
          if (sensorData.tankLevel !== undefined) {
            currentValue = sensorData.tankLevel;
            shouldTrigger = currentValue < alert.threshold;
          }
          break;
        case 'nutrient_low':
          if (sensorData.nutrientLevel !== undefined) {
            currentValue = sensorData.nutrientLevel;
            shouldTrigger = currentValue < alert.threshold;
          }
          break;
        case 'nutrient_high':
          if (sensorData.nutrientLevel !== undefined) {
            currentValue = sensorData.nutrientLevel;
            shouldTrigger = currentValue > alert.threshold;
          }
          break;
      }

      if (shouldTrigger) {
        await this.triggerAlert(alert, {
          condition: alert.condition,
          threshold: alert.threshold,
          currentValue,
          sensorId: sensorData.sensorId,
        });
      }
    }
  }
}

export const alertService = new AlertService();
