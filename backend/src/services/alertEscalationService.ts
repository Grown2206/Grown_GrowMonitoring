import { Alert, AlertSeverity } from '../models/Alert';
import { AlertHistory } from '../models/AlertHistory';
import { Op } from 'sequelize';

export class AlertEscalationService {
  /**
   * Check if alert should be triggered based on value and escalation settings
   */
  static async checkAndTrigger(
    alert: Alert,
    currentValue: number,
    condition: string
  ): Promise<{ shouldTrigger: boolean; severity: AlertSeverity | null; message: string }> {
    const now = new Date();

    // Check if alert is in cooldown period
    if (alert.lastTriggered) {
      const cooldownEnd = new Date(alert.lastTriggered.getTime() + alert.cooldownMinutes * 60000);
      if (now < cooldownEnd) {
        return { shouldTrigger: false, severity: null, message: 'Alert in cooldown' };
      }
    }

    // If escalation is not enabled, use simple threshold check
    if (!alert.useEscalation) {
      const exceeded = this.checkThresholdExceeded(currentValue, alert.threshold, condition);
      if (exceeded) {
        return {
          shouldTrigger: true,
          severity: 'critical',
          message: this.buildMessage(condition, currentValue, alert.threshold, 'critical'),
        };
      }
      return { shouldTrigger: false, severity: null, message: 'Threshold not exceeded' };
    }

    // Escalation logic
    const warningThreshold = alert.warningThreshold || alert.threshold;
    const criticalThreshold = alert.criticalThreshold || alert.threshold;

    const warningExceeded = this.checkThresholdExceeded(currentValue, warningThreshold, condition);
    const criticalExceeded = this.checkThresholdExceeded(currentValue, criticalThreshold, condition);

    // Critical level exceeded - immediate trigger
    if (criticalExceeded) {
      await alert.update({
        lastTriggered: now,
        currentSeverity: 'critical',
        lastWarningAt: undefined,
      });

      await this.createHistoryEntry(alert, 'critical', currentValue, criticalThreshold, condition);

      return {
        shouldTrigger: true,
        severity: 'critical',
        message: this.buildMessage(condition, currentValue, criticalThreshold, 'critical'),
      };
    }

    // Warning level exceeded
    if (warningExceeded) {
      // Check if we've been in warning state long enough to escalate
      if (alert.lastWarningAt) {
        const warningDuration = (now.getTime() - alert.lastWarningAt.getTime()) / 60000;

        if (warningDuration >= alert.escalationMinutes) {
          // Escalate to critical
          await alert.update({
            lastTriggered: now,
            currentSeverity: 'critical',
            lastWarningAt: undefined,
          });

          await this.createHistoryEntry(alert, 'critical', currentValue, warningThreshold, condition);

          return {
            shouldTrigger: true,
            severity: 'critical',
            message: this.buildMessage(condition, currentValue, warningThreshold, 'critical') +
              ` (Escalated after ${alert.escalationMinutes} minutes)`,
          };
        } else {
          // Still in warning state, don't trigger again
          return { shouldTrigger: false, severity: 'warning', message: 'Warning already active' };
        }
      } else {
        // First time hitting warning threshold
        await alert.update({
          lastWarningAt: now,
          currentSeverity: 'warning',
        });

        await this.createHistoryEntry(alert, 'warning', currentValue, warningThreshold, condition);

        return {
          shouldTrigger: true,
          severity: 'warning',
          message: this.buildMessage(condition, currentValue, warningThreshold, 'warning'),
        };
      }
    }

    // No threshold exceeded, clear warning state
    if (alert.currentSeverity || alert.lastWarningAt) {
      await alert.update({
        currentSeverity: undefined,
        lastWarningAt: undefined,
      });
    }

    return { shouldTrigger: false, severity: null, message: 'All thresholds OK' };
  }

  /**
   * Check if threshold is exceeded based on condition type
   */
  private static checkThresholdExceeded(value: number, threshold: number, condition: string): boolean {
    const highConditions = ['temperature_high', 'humidity_high', 'nutrient_high'];
    const lowConditions = ['temperature_low', 'humidity_low', 'tank_low', 'nutrient_low', 'moisture_low'];

    if (highConditions.some(c => condition.includes(c) || condition.includes('high'))) {
      return value >= threshold;
    } else if (lowConditions.some(c => condition.includes(c) || condition.includes('low'))) {
      return value <= threshold;
    }

    return value >= threshold; // Default: treat as high threshold
  }

  /**
   * Build alert message
   */
  private static buildMessage(
    condition: string,
    value: number,
    threshold: number,
    severity: AlertSeverity
  ): string {
    const emoji = severity === 'critical' ? '🔴' : '⚠️';
    const severityText = severity === 'critical' ? 'CRITICAL' : 'WARNING';

    return `${emoji} ${severityText}: ${condition} - Current: ${value.toFixed(2)}, Threshold: ${threshold.toFixed(2)}`;
  }

  /**
   * Create history entry
   */
  private static async createHistoryEntry(
    alert: Alert,
    severity: AlertSeverity,
    value: number,
    threshold: number,
    condition: string
  ): Promise<void> {
    await AlertHistory.create({
      alertId: alert.id,
      severity,
      value,
      threshold,
      message: this.buildMessage(condition, value, threshold, severity),
      condition,
      acknowledged: false,
    });
  }

  /**
   * Get recent alert history
   */
  static async getRecentHistory(alertId?: number, limit: number = 100): Promise<AlertHistory[]> {
    const where = alertId ? { alertId } : {};

    return await AlertHistory.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      include: [
        {
          model: Alert,
          as: 'alert',
          attributes: ['id', 'name', 'condition'],
        },
      ],
    });
  }

  /**
   * Acknowledge alert history entry
   */
  static async acknowledgeAlert(historyId: number, acknowledgedBy: string): Promise<void> {
    await AlertHistory.update(
      {
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy,
      },
      {
        where: { id: historyId },
      }
    );
  }

  /**
   * Get unacknowledged alerts count
   */
  static async getUnacknowledgedCount(): Promise<number> {
    return await AlertHistory.count({
      where: {
        acknowledged: false,
      },
    });
  }

  /**
   * Clear old history (older than X days)
   */
  static async clearOldHistory(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AlertHistory.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    return result;
  }
}
