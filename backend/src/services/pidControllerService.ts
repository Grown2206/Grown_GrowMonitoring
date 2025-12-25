import { SensorData, Sensor, Relay } from '../models';
import { Op } from 'sequelize';
import { wsManager } from '../websocket/server';

/**
 * PID Controller Service
 * Implements Proportional-Integral-Derivative control for environmental parameters
 */

export interface PIDParameters {
  kp: number; // Proportional gain
  ki: number; // Integral gain
  kd: number; // Derivative gain
  setpoint: number; // Target value
  minOutput: number; // Minimum control output (0-100)
  maxOutput: number; // Maximum control output (0-100)
  integralWindup: number; // Max integral accumulation
}

export interface PIDState {
  lastError: number;
  integral: number;
  lastUpdateTime: Date;
}

export interface PIDControlResult {
  output: number; // Control output (0-100)
  error: number; // Current error
  proportional: number; // P component
  integral: number; // I component
  derivative: number; // D component
  timestamp: Date;
}

export interface PIDControllerConfig {
  id: string;
  name: string;
  sensorId: number;
  field: string; // e.g., 'temperature', 'humidity'
  parameters: PIDParameters;
  relayId?: number; // Optional relay to control
  updateIntervalSeconds: number;
  enabled: boolean;
}

export interface PIDTuningResult {
  recommendedKp: number;
  recommendedKi: number;
  recommendedKd: number;
  oscillationPeriod: number; // seconds
  steadyStateError: number;
  settlingTime: number; // seconds
  method: 'ziegler-nichols' | 'manual';
}

export class PIDControllerService {
  private static controllers: Map<string, { config: PIDControllerConfig; state: PIDState }> =
    new Map();
  private static intervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create and start a PID controller
   */
  static createController(config: PIDControllerConfig): void {
    // Initialize state
    const state: PIDState = {
      lastError: 0,
      integral: 0,
      lastUpdateTime: new Date(),
    };

    this.controllers.set(config.id, { config, state });

    if (config.enabled) {
      this.startController(config.id);
    }
  }

  /**
   * Start a PID controller
   */
  static startController(controllerId: string): void {
    const controller = this.controllers.get(controllerId);
    if (!controller) {
      throw new Error('Controller not found');
    }

    // Clear existing interval if any
    this.stopController(controllerId);

    // Create new interval
    const interval = setInterval(async () => {
      try {
        await this.processControllerUpdate(controllerId);
      } catch (error) {
        console.error(`PID controller ${controllerId} error:`, error);
      }
    }, controller.config.updateIntervalSeconds * 1000);

    this.intervals.set(controllerId, interval);

    console.log(`PID controller ${controllerId} started`);
  }

  /**
   * Stop a PID controller
   */
  static stopController(controllerId: string): void {
    const interval = this.intervals.get(controllerId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(controllerId);
      console.log(`PID controller ${controllerId} stopped`);
    }
  }

  /**
   * Process PID controller update (called by interval)
   */
  private static async processControllerUpdate(controllerId: string): Promise<void> {
    const controller = this.controllers.get(controllerId);
    if (!controller) return;

    const { config, state } = controller;

    // Get latest sensor reading
    const reading = await SensorData.findOne({
      where: { sensorId: config.sensorId },
      order: [['timestamp', 'DESC']],
      limit: 1,
    });

    if (!reading) {
      console.warn(`No sensor data for controller ${controllerId}`);
      return;
    }

    const currentValue = (reading as any)[config.field];
    if (currentValue === undefined || currentValue === null) {
      console.warn(`Field ${config.field} not found in sensor data`);
      return;
    }

    // Calculate PID control output
    const result = this.calculatePID(currentValue, config.parameters, state);

    // Update state
    state.lastError = result.error;
    state.integral = result.integral;
    state.lastUpdateTime = new Date();

    // Apply control output to relay if configured
    if (config.relayId !== undefined) {
      await this.applyControlOutput(config.relayId, result.output);
    }

    console.log(
      `PID ${controllerId}: setpoint=${config.parameters.setpoint}, current=${currentValue.toFixed(2)}, output=${result.output.toFixed(2)}%`
    );
  }

  /**
   * Calculate PID control output
   */
  static calculatePID(
    currentValue: number,
    params: PIDParameters,
    state: PIDState
  ): PIDControlResult {
    const now = new Date();
    const dt =
      (now.getTime() - state.lastUpdateTime.getTime()) / 1000 || 1; // seconds

    // Calculate error
    const error = params.setpoint - currentValue;

    // Proportional term
    const proportional = params.kp * error;

    // Integral term with anti-windup
    let integral = state.integral + error * dt;

    // Apply integral windup limit
    if (Math.abs(integral) > params.integralWindup) {
      integral = Math.sign(integral) * params.integralWindup;
    }

    const integralTerm = params.ki * integral;

    // Derivative term
    const derivative = (error - state.lastError) / dt;
    const derivativeTerm = params.kd * derivative;

    // Calculate total output
    let output = proportional + integralTerm + derivativeTerm;

    // Clamp output to min/max
    output = Math.max(params.minOutput, Math.min(params.maxOutput, output));

    return {
      output,
      error,
      proportional,
      integral,
      derivative: derivativeTerm,
      timestamp: now,
    };
  }

  /**
   * Apply control output to relay
   */
  private static async applyControlOutput(
    relayId: number,
    outputPercent: number
  ): Promise<void> {
    // For now, simple on/off control based on output percentage
    // In production, could implement PWM (Pulse Width Modulation)

    const shouldBeOn = outputPercent > 50; // Simple threshold

    // Send relay control command
    wsManager.sendToESP32({
      type: 'relay_control',
      data: { relayId, status: shouldBeOn },
    });

    // Update relay state in database
    await Relay.update({ status: shouldBeOn }, { where: { relayId } });
  }

  /**
   * Auto-tune PID parameters using Ziegler-Nichols method
   */
  static async autoTune(
    sensorId: number,
    field: string,
    setpoint: number,
    oscillationTestDurationMinutes: number = 30
  ): Promise<PIDTuningResult> {
    // This is a simplified auto-tuning implementation
    // Real Ziegler-Nichols requires controlled oscillation testing

    const startTime = new Date(Date.now() - oscillationTestDurationMinutes * 60 * 1000);

    const readings = await SensorData.findAll({
      where: {
        sensorId,
        timestamp: {
          [Op.gte]: startTime,
        },
      },
      order: [['timestamp', 'ASC']],
    });

    if (readings.length < 20) {
      throw new Error('Not enough data for auto-tuning. Need at least 20 readings.');
    }

    const values = readings
      .map((r) => (r as any)[field])
      .filter((v: any) => v !== null && v !== undefined && !isNaN(v))
      .map((v: any) => parseFloat(v));

    // Detect oscillations (simplified)
    const { period, amplitude } = this.detectOscillations(values);

    // Calculate ultimate gain (Ku)
    // This is simplified - real Ziegler-Nichols requires specific testing
    const averageValue = values.reduce((sum, v) => sum + v, 0) / values.length;
    const ku = Math.abs(averageValue - setpoint) / amplitude || 1.0;

    // Calculate PID parameters using Ziegler-Nichols formulas
    const kp = 0.6 * ku;
    const ki = 1.2 * ku / period;
    const kd = 0.075 * ku * period;

    // Calculate performance metrics
    const steadyStateError = Math.abs(values[values.length - 1] - setpoint);
    const settlingTime = this.calculateSettlingTime(values, setpoint);

    return {
      recommendedKp: Math.round(kp * 1000) / 1000,
      recommendedKi: Math.round(ki * 1000) / 1000,
      recommendedKd: Math.round(kd * 1000) / 1000,
      oscillationPeriod: period,
      steadyStateError: Math.round(steadyStateError * 100) / 100,
      settlingTime,
      method: 'ziegler-nichols',
    };
  }

  /**
   * Detect oscillations in data
   */
  private static detectOscillations(values: number[]): {
    period: number;
    amplitude: number;
  } {
    if (values.length < 10) {
      return { period: 60, amplitude: 1 }; // Default values
    }

    // Find peaks and valleys
    const peaks: number[] = [];
    const valleys: number[] = [];

    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        peaks.push(i);
      }
      if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
        valleys.push(i);
      }
    }

    // Calculate average period (distance between peaks)
    let avgPeriod = 60; // Default 60 seconds
    if (peaks.length > 1) {
      const periods = [];
      for (let i = 1; i < peaks.length; i++) {
        periods.push(peaks[i] - peaks[i - 1]);
      }
      avgPeriod =
        periods.reduce((sum, p) => sum + p, 0) / periods.length * 5; // Assuming 5-min intervals
    }

    // Calculate amplitude (average distance from mean)
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const amplitude =
      values.reduce((sum, v) => sum + Math.abs(v - mean), 0) / values.length;

    return {
      period: avgPeriod,
      amplitude,
    };
  }

  /**
   * Calculate settling time (time to reach and stay within 5% of setpoint)
   */
  private static calculateSettlingTime(values: number[], setpoint: number): number {
    const tolerance = setpoint * 0.05; // 5% tolerance

    let settlingIndex = values.length;

    for (let i = values.length - 1; i >= 0; i--) {
      if (Math.abs(values[i] - setpoint) > tolerance) {
        break;
      }
      settlingIndex = i;
    }

    // Assuming 5-min intervals
    return (values.length - settlingIndex) * 5 * 60; // seconds
  }

  /**
   * Get controller status
   */
  static getControllerStatus(controllerId: string): {
    config: PIDControllerConfig;
    state: PIDState;
    isRunning: boolean;
  } | null {
    const controller = this.controllers.get(controllerId);
    if (!controller) return null;

    return {
      config: controller.config,
      state: controller.state,
      isRunning: this.intervals.has(controllerId),
    };
  }

  /**
   * Get all controllers
   */
  static getAllControllers(): Array<{
    config: PIDControllerConfig;
    state: PIDState;
    isRunning: boolean;
  }> {
    const result: Array<{
      config: PIDControllerConfig;
      state: PIDState;
      isRunning: boolean;
    }> = [];

    this.controllers.forEach((controller, id) => {
      result.push({
        config: controller.config,
        state: controller.state,
        isRunning: this.intervals.has(id),
      });
    });

    return result;
  }

  /**
   * Update controller configuration
   */
  static updateController(
    controllerId: string,
    updates: Partial<PIDControllerConfig>
  ): void {
    const controller = this.controllers.get(controllerId);
    if (!controller) {
      throw new Error('Controller not found');
    }

    // Update config
    Object.assign(controller.config, updates);

    // Restart if running and enabled
    if (this.intervals.has(controllerId) && controller.config.enabled) {
      this.startController(controllerId);
    } else if (!controller.config.enabled) {
      this.stopController(controllerId);
    }
  }

  /**
   * Delete controller
   */
  static deleteController(controllerId: string): void {
    this.stopController(controllerId);
    this.controllers.delete(controllerId);
  }

  /**
   * Get recommended PID parameters for common scenarios
   */
  static getRecommendedParameters(
    scenario: 'temperature' | 'humidity' | 'co2' | 'light'
  ): PIDParameters {
    const recommendations: Record<string, PIDParameters> = {
      temperature: {
        kp: 2.0,
        ki: 0.05,
        kd: 1.0,
        setpoint: 24,
        minOutput: 0,
        maxOutput: 100,
        integralWindup: 20,
      },
      humidity: {
        kp: 1.5,
        ki: 0.03,
        kd: 0.8,
        setpoint: 60,
        minOutput: 0,
        maxOutput: 100,
        integralWindup: 25,
      },
      co2: {
        kp: 3.0,
        ki: 0.1,
        kd: 1.5,
        setpoint: 1000,
        minOutput: 0,
        maxOutput: 100,
        integralWindup: 30,
      },
      light: {
        kp: 2.5,
        ki: 0.08,
        kd: 1.2,
        setpoint: 500,
        minOutput: 0,
        maxOutput: 100,
        integralWindup: 15,
      },
    };

    return recommendations[scenario] || recommendations.temperature;
  }
}
