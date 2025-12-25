import { SensorData, Sensor } from '../models';
import { Op } from 'sequelize';

/**
 * Sensor Health Monitoring Service
 * Tracks sensor uptime, communication status, and overall health
 */

export interface SensorHealthMetrics {
  sensorId: number;
  sensorName: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  healthScore: number; // 0-100
  uptime: number; // Percentage (0-100)
  lastSeen: Date | null;
  lastSeenMinutes: number | null; // Minutes since last data
  dataAvailability: number; // Percentage of expected readings received
  batteryLevel?: number; // Optional battery percentage
  signalStrength?: number; // Optional signal strength (-100 to 0 dBm)
  issues: string[];
  recommendations: string[];
  metrics: {
    totalReadings: number;
    expectedReadings: number;
    missedReadings: number;
    avgInterval: number; // Average time between readings in minutes
    longestGap: number; // Longest gap between readings in hours
  };
  timestamp: Date;
}

export interface SensorUptimeReport {
  sensorId: number;
  sensorName: string;
  periodHours: number;
  uptime: number; // Percentage
  downtime: number; // Hours
  totalGaps: number;
  gaps: Array<{
    start: Date;
    end: Date;
    durationMinutes: number;
  }>;
}

export interface FleetHealthSummary {
  totalSensors: number;
  healthy: number;
  warning: number;
  critical: number;
  offline: number;
  averageHealth: number;
  averageUptime: number;
  sensors: SensorHealthMetrics[];
  timestamp: Date;
}

export class SensorHealthService {
  private static readonly EXPECTED_INTERVAL_MINUTES = 5; // Default: 5-minute intervals
  private static readonly WARNING_THRESHOLD_MINUTES = 15; // No data for 15 min = warning
  private static readonly CRITICAL_THRESHOLD_MINUTES = 60; // No data for 60 min = critical
  private static readonly OFFLINE_THRESHOLD_MINUTES = 180; // No data for 3h = offline

  /**
   * Get health metrics for a single sensor
   */
  static async getSensorHealth(
    sensorId: number,
    lookbackHours: number = 24
  ): Promise<SensorHealthMetrics | null> {
    const sensor = await Sensor.findByPk(sensorId);
    if (!sensor) return null;

    const startTime = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
    const now = new Date();

    // Get all readings in the period
    const readings = await SensorData.findAll({
      where: {
        sensorId,
        timestamp: {
          [Op.gte]: startTime,
        },
      },
      order: [['timestamp', 'ASC']],
    });

    const totalReadings = readings.length;
    const expectedReadings = Math.floor(
      (lookbackHours * 60) / this.EXPECTED_INTERVAL_MINUTES
    );
    const missedReadings = Math.max(0, expectedReadings - totalReadings);

    // Calculate last seen
    const lastReading = readings.length > 0 ? readings[readings.length - 1] : null;
    const lastSeen = lastReading ? lastReading.timestamp : null;
    const lastSeenMinutes = lastSeen
      ? Math.floor((now.getTime() - new Date(lastSeen).getTime()) / (1000 * 60))
      : null;

    // Calculate data availability
    const dataAvailability =
      expectedReadings > 0 ? (totalReadings / expectedReadings) * 100 : 0;

    // Calculate average interval and gaps
    const { avgInterval, longestGap } = this.calculateIntervals(readings);

    // Calculate uptime (based on gaps)
    const uptime = this.calculateUptime(readings, lookbackHours);

    // Extract battery and signal if available
    const batteryLevel = lastReading ? (lastReading as any).batteryLevel : undefined;
    const signalStrength = lastReading ? (lastReading as any).signalStrength : undefined;

    // Calculate health score
    const healthScore = this.calculateHealthScore({
      uptime,
      dataAvailability,
      lastSeenMinutes,
      batteryLevel,
    });

    // Determine status
    const status = this.determineStatus(lastSeenMinutes, healthScore);

    // Identify issues and recommendations
    const { issues, recommendations } = this.identifyIssues({
      lastSeenMinutes,
      dataAvailability,
      uptime,
      batteryLevel,
      avgInterval,
      healthScore,
    });

    return {
      sensorId,
      sensorName: sensor.name,
      status,
      healthScore: Math.round(healthScore),
      uptime: Math.round(uptime * 10) / 10,
      lastSeen,
      lastSeenMinutes,
      dataAvailability: Math.round(dataAvailability * 10) / 10,
      batteryLevel,
      signalStrength,
      issues,
      recommendations,
      metrics: {
        totalReadings,
        expectedReadings,
        missedReadings,
        avgInterval: Math.round(avgInterval * 10) / 10,
        longestGap: Math.round(longestGap * 10) / 10,
      },
      timestamp: now,
    };
  }

  /**
   * Get health metrics for all sensors
   */
  static async getFleetHealth(lookbackHours: number = 24): Promise<FleetHealthSummary> {
    const sensors = await Sensor.findAll();
    const healthMetrics: SensorHealthMetrics[] = [];

    for (const sensor of sensors) {
      const health = await this.getSensorHealth(sensor.id, lookbackHours);
      if (health) {
        healthMetrics.push(health);
      }
    }

    const totalSensors = healthMetrics.length;
    const healthy = healthMetrics.filter((h) => h.status === 'healthy').length;
    const warning = healthMetrics.filter((h) => h.status === 'warning').length;
    const critical = healthMetrics.filter((h) => h.status === 'critical').length;
    const offline = healthMetrics.filter((h) => h.status === 'offline').length;

    const averageHealth =
      totalSensors > 0
        ? healthMetrics.reduce((sum, h) => sum + h.healthScore, 0) / totalSensors
        : 0;

    const averageUptime =
      totalSensors > 0
        ? healthMetrics.reduce((sum, h) => sum + h.uptime, 0) / totalSensors
        : 0;

    return {
      totalSensors,
      healthy,
      warning,
      critical,
      offline,
      averageHealth: Math.round(averageHealth * 10) / 10,
      averageUptime: Math.round(averageUptime * 10) / 10,
      sensors: healthMetrics,
      timestamp: new Date(),
    };
  }

  /**
   * Get detailed uptime report with gap analysis
   */
  static async getUptimeReport(
    sensorId: number,
    periodHours: number = 24
  ): Promise<SensorUptimeReport | null> {
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

    // Find gaps (>10 minutes between readings)
    const gaps: Array<{ start: Date; end: Date; durationMinutes: number }> = [];
    let totalDowntimeMinutes = 0;

    for (let i = 1; i < readings.length; i++) {
      const prevTime = new Date(readings[i - 1].timestamp);
      const currTime = new Date(readings[i].timestamp);
      const gapMinutes = (currTime.getTime() - prevTime.getTime()) / (1000 * 60);

      if (gapMinutes > 10) {
        gaps.push({
          start: prevTime,
          end: currTime,
          durationMinutes: Math.round(gapMinutes * 10) / 10,
        });
        totalDowntimeMinutes += gapMinutes;
      }
    }

    const totalMinutes = periodHours * 60;
    const uptime = ((totalMinutes - totalDowntimeMinutes) / totalMinutes) * 100;
    const downtime = totalDowntimeMinutes / 60;

    return {
      sensorId,
      sensorName: sensor.name,
      periodHours,
      uptime: Math.round(uptime * 10) / 10,
      downtime: Math.round(downtime * 10) / 10,
      totalGaps: gaps.length,
      gaps: gaps.slice(0, 20), // Return max 20 gaps
    };
  }

  /**
   * Calculate intervals between readings
   */
  private static calculateIntervals(readings: any[]): {
    avgInterval: number;
    longestGap: number;
  } {
    if (readings.length < 2) {
      return { avgInterval: 0, longestGap: 0 };
    }

    let totalInterval = 0;
    let longestGap = 0;

    for (let i = 1; i < readings.length; i++) {
      const prevTime = new Date(readings[i - 1].timestamp);
      const currTime = new Date(readings[i].timestamp);
      const intervalMinutes = (currTime.getTime() - prevTime.getTime()) / (1000 * 60);

      totalInterval += intervalMinutes;
      if (intervalMinutes > longestGap) {
        longestGap = intervalMinutes;
      }
    }

    const avgInterval = totalInterval / (readings.length - 1);

    return {
      avgInterval,
      longestGap: longestGap / 60, // Convert to hours
    };
  }

  /**
   * Calculate uptime percentage based on gaps
   */
  private static calculateUptime(readings: any[], periodHours: number): number {
    if (readings.length < 2) {
      return 0;
    }

    let totalDowntimeMinutes = 0;

    for (let i = 1; i < readings.length; i++) {
      const prevTime = new Date(readings[i - 1].timestamp);
      const currTime = new Date(readings[i].timestamp);
      const gapMinutes = (currTime.getTime() - prevTime.getTime()) / (1000 * 60);

      // Consider gaps >10 minutes as downtime
      if (gapMinutes > 10) {
        totalDowntimeMinutes += gapMinutes;
      }
    }

    const totalMinutes = periodHours * 60;
    const uptime = ((totalMinutes - totalDowntimeMinutes) / totalMinutes) * 100;

    return Math.max(0, Math.min(100, uptime));
  }

  /**
   * Calculate overall health score
   */
  private static calculateHealthScore(params: {
    uptime: number;
    dataAvailability: number;
    lastSeenMinutes: number | null;
    batteryLevel?: number;
  }): number {
    const { uptime, dataAvailability, lastSeenMinutes, batteryLevel } = params;

    // Base score from uptime and availability
    let score = uptime * 0.5 + dataAvailability * 0.3;

    // Penalty for not being seen recently
    if (lastSeenMinutes !== null) {
      if (lastSeenMinutes <= this.WARNING_THRESHOLD_MINUTES) {
        score += 20; // Bonus for recent data
      } else if (lastSeenMinutes <= this.CRITICAL_THRESHOLD_MINUTES) {
        score += 10; // Small bonus
      } else if (lastSeenMinutes <= this.OFFLINE_THRESHOLD_MINUTES) {
        score -= 20; // Penalty
      } else {
        score -= 40; // Heavy penalty for offline
      }
    }

    // Battery level impact
    if (batteryLevel !== undefined) {
      if (batteryLevel >= 80) {
        score += 10;
      } else if (batteryLevel >= 50) {
        score += 5;
      } else if (batteryLevel >= 20) {
        score -= 10;
      } else {
        score -= 20;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determine sensor status
   */
  private static determineStatus(
    lastSeenMinutes: number | null,
    healthScore: number
  ): 'healthy' | 'warning' | 'critical' | 'offline' {
    if (lastSeenMinutes === null || lastSeenMinutes >= this.OFFLINE_THRESHOLD_MINUTES) {
      return 'offline';
    }

    if (
      lastSeenMinutes >= this.CRITICAL_THRESHOLD_MINUTES ||
      healthScore < 50
    ) {
      return 'critical';
    }

    if (
      lastSeenMinutes >= this.WARNING_THRESHOLD_MINUTES ||
      healthScore < 70
    ) {
      return 'warning';
    }

    return 'healthy';
  }

  /**
   * Identify issues and generate recommendations
   */
  private static identifyIssues(params: {
    lastSeenMinutes: number | null;
    dataAvailability: number;
    uptime: number;
    batteryLevel?: number;
    avgInterval: number;
    healthScore: number;
  }): { issues: string[]; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const {
      lastSeenMinutes,
      dataAvailability,
      uptime,
      batteryLevel,
      avgInterval,
      healthScore,
    } = params;

    // Last seen issues
    if (lastSeenMinutes === null) {
      issues.push('No data received');
      recommendations.push('Check sensor power and connectivity');
    } else if (lastSeenMinutes >= this.OFFLINE_THRESHOLD_MINUTES) {
      issues.push(`Offline for ${Math.round(lastSeenMinutes / 60)}h`);
      recommendations.push('Verify sensor is powered on and connected');
    } else if (lastSeenMinutes >= this.CRITICAL_THRESHOLD_MINUTES) {
      issues.push(`No data for ${lastSeenMinutes} minutes`);
      recommendations.push('Check network connection');
    } else if (lastSeenMinutes >= this.WARNING_THRESHOLD_MINUTES) {
      issues.push('Delayed communication');
      recommendations.push('Monitor sensor connectivity');
    }

    // Data availability issues
    if (dataAvailability < 50) {
      issues.push('Very low data availability (<50%)');
      recommendations.push('Check sensor reliability and network stability');
    } else if (dataAvailability < 80) {
      issues.push('Low data availability (<80%)');
      recommendations.push('Investigate intermittent connectivity issues');
    }

    // Uptime issues
    if (uptime < 90) {
      issues.push('Low uptime (<90%)');
      recommendations.push('Review sensor gaps and identify causes');
    }

    // Battery issues
    if (batteryLevel !== undefined) {
      if (batteryLevel < 20) {
        issues.push(`Critical battery level (${batteryLevel}%)`);
        recommendations.push('Replace or recharge battery immediately');
      } else if (batteryLevel < 50) {
        issues.push(`Low battery (${batteryLevel}%)`);
        recommendations.push('Plan battery replacement soon');
      }
    }

    // Interval issues
    if (avgInterval > this.EXPECTED_INTERVAL_MINUTES * 2) {
      issues.push('Irregular reading intervals');
      recommendations.push('Check sensor configuration and network latency');
    }

    // General health
    if (healthScore < 50 && issues.length === 0) {
      issues.push('Poor overall health');
      recommendations.push('Run diagnostics and review sensor logs');
    }

    return { issues, recommendations };
  }

  /**
   * Get sensors by health status
   */
  static async getSensorsByStatus(
    status: 'healthy' | 'warning' | 'critical' | 'offline',
    lookbackHours: number = 24
  ): Promise<SensorHealthMetrics[]> {
    const fleetHealth = await this.getFleetHealth(lookbackHours);
    return fleetHealth.sensors.filter((s) => s.status === status);
  }

  /**
   * Get top N unhealthy sensors
   */
  static async getUnhealthySensors(
    limit: number = 10,
    lookbackHours: number = 24
  ): Promise<SensorHealthMetrics[]> {
    const fleetHealth = await this.getFleetHealth(lookbackHours);
    return fleetHealth.sensors
      .filter((s) => s.status !== 'healthy')
      .sort((a, b) => a.healthScore - b.healthScore)
      .slice(0, limit);
  }
}
