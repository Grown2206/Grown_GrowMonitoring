import nodemailer from 'nodemailer';
import axios from 'axios';
import { Alert } from '../models/Alert';

export class AlertService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initEmailTransporter();
  }

  private initEmailTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      console.log('✓ Email transporter initialized');
    } else {
      console.log('⚠ Email not configured - alerts will be logged only');
    }
  }

  async checkAndTriggerAlerts(sensorData: any) {
    const alerts = await Alert.findAll({ where: { enabled: true } });

    for (const alert of alerts) {
      const shouldTrigger = this.evaluateCondition(alert, sensorData);

      if (shouldTrigger) {
        const canTrigger = this.checkCooldown(alert);

        if (canTrigger) {
          await this.triggerAlert(alert, sensorData);
          await alert.update({ lastTriggered: new Date() });
        }
      }
    }
  }

  private evaluateCondition(alert: Alert, sensorData: any): boolean {
    switch (alert.condition) {
      case 'tank_low':
        return sensorData.tankLevel !== undefined && sensorData.tankLevel < alert.threshold;
      case 'nutrient_low':
        return sensorData.nutrientLevel !== undefined && sensorData.nutrientLevel < alert.threshold;
      case 'nutrient_high':
        return sensorData.nutrientLevel !== undefined && sensorData.nutrientLevel > alert.threshold;
      case 'moisture_low':
        return sensorData.moistureLevel !== undefined && sensorData.moistureLevel < alert.threshold;
      case 'moisture_high':
        return sensorData.moistureLevel !== undefined && sensorData.moistureLevel > alert.threshold;
      default:
        return false;
    }
  }

  private checkCooldown(alert: Alert): boolean {
    if (!alert.lastTriggered) return true;

    const now = new Date();
    const lastTriggered = new Date(alert.lastTriggered);
    const cooldownMs = alert.cooldownMinutes * 60 * 1000;
    const timeSinceLastTrigger = now.getTime() - lastTriggered.getTime();

    return timeSinceLastTrigger >= cooldownMs;
  }

  private async triggerAlert(alert: Alert, sensorData: any) {
    const message = this.buildAlertMessage(alert, sensorData);

    try {
      if (alert.type === 'email' && alert.recipientEmail) {
        await this.sendEmail(alert.recipientEmail, alert.name, message);
      } else if (alert.type === 'webhook' && alert.webhookUrl) {
        await this.sendWebhook(alert.webhookUrl, alert, sensorData);
      }

      console.log(`✓ Alert triggered: ${alert.name}`);
    } catch (error) {
      console.error(`✗ Failed to trigger alert ${alert.name}:`, error);
    }
  }

  private buildAlertMessage(alert: Alert, sensorData: any): string {
    const conditionText = alert.condition.replace(/_/g, ' ');
    const value = this.getValueForCondition(alert.condition, sensorData);

    return `Alert: ${alert.name}
Condition: ${conditionText}
Threshold: ${alert.threshold}
Current value: ${value}
Timestamp: ${new Date().toISOString()}`;
  }

  private getValueForCondition(condition: string, sensorData: any): number {
    switch (condition) {
      case 'tank_low':
        return sensorData.tankLevel;
      case 'nutrient_low':
      case 'nutrient_high':
        return sensorData.nutrientLevel;
      case 'moisture_low':
      case 'moisture_high':
        return sensorData.moistureLevel;
      default:
        return 0;
    }
  }

  private async sendEmail(to: string, subject: string, text: string) {
    if (!this.transporter) {
      console.log('Email not configured, logging alert:', { to, subject, text });
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@growmonitoring.local',
      to,
      subject: `[Grow Monitor] ${subject}`,
      text,
    });
  }

  private async sendWebhook(url: string, alert: Alert, sensorData: any) {
    await axios.post(url, {
      alert: {
        id: alert.id,
        name: alert.name,
        condition: alert.condition,
        threshold: alert.threshold,
      },
      sensorData,
      timestamp: new Date().toISOString(),
    });
  }
}

export const alertService = new AlertService();
