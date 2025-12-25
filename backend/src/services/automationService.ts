import { AutomationRule } from '../models/AutomationRule';
import { SensorData, Relay } from '../models';
import { Op } from 'sequelize';
import { wsManager } from '../websocket/server';

/**
 * Enhanced Automation Service
 * Supports complex conditions, multiple actions, formulas, and rule dependencies
 */

// Types
export interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: Condition[];
}

export interface Condition {
  type: 'sensor' | 'time' | 'formula' | 'rule_state';
  field?: string; // e.g., 'temperature', 'humidity'
  operator?: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value?: number | string | boolean;
  formula?: string; // For formula type
  sensorId?: number; // For sensor type
  ruleId?: number; // For rule_state type
}

export interface Action {
  type: 'relay' | 'pump' | 'notification' | 'trigger_rule' | 'webhook';
  config: Record<string, any>;
  delay?: number; // Delay in milliseconds before executing
  condition?: ConditionGroup; // Optional conditional action
}

export interface ExtendedTriggerConfig {
  // Time-based triggers
  schedule?: string; // Cron expression
  time?: string; // HH:MM format

  // Sensor-based triggers
  sensorId?: number;
  field?: string;
  operator?: string;
  value?: number;

  // Event-based triggers
  event?: string;
}

export interface ExtendedActionConfig {
  actions: Action[]; // Multiple actions
}

export class AutomationService {
  /**
   * Evaluate a condition
   */
  private static async evaluateCondition(condition: Condition): Promise<boolean> {
    switch (condition.type) {
      case 'sensor': {
        if (!condition.sensorId || !condition.field) return false;

        // Get latest sensor reading
        const reading = await SensorData.findOne({
          where: { sensorId: condition.sensorId },
          order: [['timestamp', 'DESC']],
          limit: 1,
        });

        if (!reading) return false;

        const value = (reading as any)[condition.field];
        if (value === undefined || value === null) return false;

        return this.compareValues(value, condition.operator!, condition.value!);
      }

      case 'time': {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (condition.operator === '==') {
          return currentTime === condition.value;
        } else if (condition.operator === '>') {
          return currentTime > condition.value!;
        } else if (condition.operator === '<') {
          return currentTime < condition.value!;
        }
        return false;
      }

      case 'formula': {
        if (!condition.formula) return false;
        try {
          return this.evaluateFormula(condition.formula);
        } catch (error) {
          console.error('Formula evaluation error:', error);
          return false;
        }
      }

      case 'rule_state': {
        if (!condition.ruleId) return false;

        const rule = await AutomationRule.findByPk(condition.ruleId);
        if (!rule) return false;

        if (condition.operator === '==') {
          return rule.enabled === condition.value;
        }
        return false;
      }

      default:
        return false;
    }
  }

  /**
   * Compare values based on operator
   */
  private static compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case '>':
        return actual > expected;
      case '<':
        return actual < expected;
      case '>=':
        return actual >= expected;
      case '<=':
        return actual <= expected;
      case '==':
        return actual == expected;
      case '!=':
        return actual != expected;
      default:
        return false;
    }
  }

  /**
   * Evaluate a condition group (AND/OR logic)
   */
  private static async evaluateConditionGroup(group: ConditionGroup): Promise<boolean> {
    const results = await Promise.all(
      group.conditions.map((cond) => this.evaluateCondition(cond))
    );

    if (group.operator === 'AND') {
      return results.every((r) => r === true);
    } else if (group.operator === 'OR') {
      return results.some((r) => r === true);
    }

    return false;
  }

  /**
   * Safe formula evaluation
   * Supports basic math operations and sensor value access
   */
  private static evaluateFormula(formula: string): boolean {
    // For now, use a simple eval with whitelist
    // In production, use a proper expression evaluator like mathjs or expr-eval

    // Whitelist allowed characters: numbers, operators, parentheses, spaces
    const allowedPattern = /^[0-9+\-*/(). <>!=&|]+$/;

    if (!allowedPattern.test(formula)) {
      throw new Error('Invalid formula: contains disallowed characters');
    }

    try {
      // Replace && with && and || with ||
      const sanitized = formula
        .replace(/AND/g, '&&')
        .replace(/OR/g, '||')
        .replace(/NOT/g, '!');

      // Evaluate in a restricted context
      const result = Function(`"use strict"; return (${sanitized})`)();
      return Boolean(result);
    } catch (error) {
      throw new Error(`Formula evaluation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Execute an action
   */
  private static async executeAction(action: Action, rule: AutomationRule): Promise<void> {
    // Check conditional action
    if (action.condition) {
      const conditionMet = await this.evaluateConditionGroup(action.condition);
      if (!conditionMet) {
        console.log(`Skipping action (condition not met):`, action.type);
        return;
      }
    }

    // Apply delay if specified
    if (action.delay && action.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, action.delay));
    }

    // Execute action
    switch (action.type) {
      case 'relay': {
        const { relayId, status } = action.config;
        wsManager.sendToESP32({
          type: 'relay_control',
          data: { relayId, status },
        });

        // Update relay state in database
        await Relay.update({ status }, { where: { relayId } });
        break;
      }

      case 'pump': {
        const { pumpId, duration } = action.config;
        wsManager.sendToESP32({
          type: 'pump_control',
          data: { pumpId, action: 'start', duration },
        });
        break;
      }

      case 'notification': {
        const { message, type = 'info' } = action.config;
        console.log(`[${type.toUpperCase()}] Notification:`, message);
        // Could extend to send via email, SMS, webhook, etc.
        break;
      }

      case 'trigger_rule': {
        const { ruleId } = action.config;
        const targetRule = await AutomationRule.findByPk(ruleId);

        if (targetRule && targetRule.enabled) {
          console.log(`Triggering dependent rule:`, targetRule.name);
          await this.executeRule(targetRule);
        }
        break;
      }

      case 'webhook': {
        const { url, method = 'POST', body } = action.config;

        // Webhook support requires external HTTP library
        // For now, just log the webhook call
        console.log(`[Webhook] ${method} ${url}`, body ? JSON.stringify(body) : '');
        console.warn('Webhook execution is logged only (implement with axios or node-fetch if needed)');
        break;
      }

      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute an automation rule
   */
  static async executeRule(rule: AutomationRule): Promise<boolean> {
    if (!rule.enabled) {
      return false;
    }

    try {
      // Evaluate conditions if present
      if (rule.conditions) {
        const conditionGroup: ConditionGroup = JSON.parse(rule.conditions);
        const conditionMet = await this.evaluateConditionGroup(conditionGroup);

        if (!conditionMet) {
          console.log(`Rule "${rule.name}" conditions not met`);
          return false;
        }
      }

      // Execute actions
      const actionConfig: ExtendedActionConfig = JSON.parse(rule.actionConfig);

      if (actionConfig.actions && Array.isArray(actionConfig.actions)) {
        // Execute multiple actions sequentially
        for (const action of actionConfig.actions) {
          await this.executeAction(action, rule);
        }
      } else {
        // Legacy single action support
        const legacyAction: Action = {
          type: rule.actionType as any,
          config: JSON.parse(rule.actionConfig),
        };
        await this.executeAction(legacyAction, rule);
      }

      // Update rule execution stats
      await rule.update({
        lastTriggered: new Date(),
        triggerCount: rule.triggerCount + 1,
      });

      console.log(`Rule "${rule.name}" executed successfully`);
      return true;
    } catch (error) {
      console.error(`Error executing rule "${rule.name}":`, error);
      return false;
    }
  }

  /**
   * Validate a condition group
   */
  static validateConditionGroup(group: ConditionGroup): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!group.operator || !['AND', 'OR'].includes(group.operator)) {
      errors.push('Invalid operator: must be AND or OR');
    }

    if (!Array.isArray(group.conditions) || group.conditions.length === 0) {
      errors.push('Conditions array is required and must not be empty');
    }

    group.conditions.forEach((cond, index) => {
      if (!cond.type || !['sensor', 'time', 'formula', 'rule_state'].includes(cond.type)) {
        errors.push(`Condition ${index}: Invalid type`);
      }

      if (cond.type === 'sensor' && !cond.sensorId) {
        errors.push(`Condition ${index}: sensorId required for sensor type`);
      }

      if (cond.type === 'formula' && !cond.formula) {
        errors.push(`Condition ${index}: formula required for formula type`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate actions array
   */
  static validateActions(actions: Action[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(actions) || actions.length === 0) {
      errors.push('Actions array is required and must not be empty');
    }

    actions.forEach((action, index) => {
      if (!action.type) {
        errors.push(`Action ${index}: type is required`);
      }

      if (!action.config || typeof action.config !== 'object') {
        errors.push(`Action ${index}: config object is required`);
      }

      if (action.type === 'relay' && (!action.config.relayId || action.config.status === undefined)) {
        errors.push(`Action ${index}: relay action requires relayId and status`);
      }

      if (action.type === 'pump' && (!action.config.pumpId || !action.config.duration)) {
        errors.push(`Action ${index}: pump action requires pumpId and duration`);
      }

      if (action.type === 'trigger_rule' && !action.config.ruleId) {
        errors.push(`Action ${index}: trigger_rule action requires ruleId`);
      }

      if (action.type === 'webhook' && !action.config.url) {
        errors.push(`Action ${index}: webhook action requires url`);
      }
    });

    return { valid: errors.length === 0, errors };
  }
}
