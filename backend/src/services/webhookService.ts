import { WebHook, WebHookEvent } from '../models/WebHook';
import { WebHookLog } from '../models/WebHookLog';
import crypto from 'crypto';

interface WebHookPayload {
  event: WebHookEvent;
  timestamp: string;
  data: Record<string, any>;
}

class WebHookService {
  /**
   * Trigger all webhooks for a specific event
   */
  async trigger(event: WebHookEvent, data: Record<string, any>): Promise<void> {
    try {
      // Find all enabled webhooks that listen to this event
      const webhooks = await WebHook.findAll({
        where: {
          enabled: true,
          status: ['active', 'paused'],
        },
      });

      const relevantWebhooks = webhooks.filter((webhook) => webhook.events.includes(event));

      if (relevantWebhooks.length === 0) {
        return;
      }

      // Trigger all webhooks in parallel (fire and forget)
      const promises = relevantWebhooks.map((webhook) => this.executeWebHook(webhook, event, data));

      // Don't await - fire and forget
      Promise.allSettled(promises).catch((error) => {
        console.error('Error triggering webhooks:', error);
      });
    } catch (error) {
      console.error('Error finding webhooks:', error);
    }
  }

  /**
   * Execute a single webhook with retry logic
   */
  private async executeWebHook(
    webhook: WebHook,
    event: WebHookEvent,
    data: Record<string, any>,
    attempt: number = 1
  ): Promise<void> {
    const startTime = Date.now();
    const payload: WebHookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    try {
      // Update last triggered timestamp
      await webhook.update({ lastTriggeredAt: new Date() });

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'GrowMonitoring-WebHook/1.0',
        ...webhook.headers,
      };

      // Add signature if secret is configured
      if (webhook.secret) {
        const signature = this.generateSignature(payload, webhook.secret);
        headers['X-Webhook-Signature'] = signature;
      }

      // Make HTTP request with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), webhook.timeoutMs);

      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers,
        body: webhook.method !== 'GET' ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const durationMs = Date.now() - startTime;
      const responseText = await response.text();

      // Log the webhook execution
      await WebHookLog.create({
        webhookId: webhook.id,
        event,
        payload: data,
        response: responseText.substring(0, 1000), // Limit response size
        statusCode: response.status,
        success: response.ok,
        durationMs,
        attempt,
      });

      if (response.ok) {
        // Success
        await webhook.update({
          status: 'active',
          lastSuccessAt: new Date(),
          successCount: webhook.successCount + 1,
          retryCount: 0,
        });
      } else {
        // HTTP error
        await this.handleFailure(webhook, event, data, attempt, `HTTP ${response.status}: ${responseText}`, durationMs);
      }
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error.message || 'Unknown error';

      // Log the failure
      await WebHookLog.create({
        webhookId: webhook.id,
        event,
        payload: data,
        success: false,
        errorMessage,
        durationMs,
        attempt,
      });

      await this.handleFailure(webhook, event, data, attempt, errorMessage, durationMs);
    }
  }

  /**
   * Handle webhook execution failure with retry logic
   */
  private async handleFailure(
    webhook: WebHook,
    event: WebHookEvent,
    data: Record<string, any>,
    attempt: number,
    errorMessage: string,
    durationMs: number
  ): Promise<void> {
    const newFailureCount = webhook.failureCount + 1;
    const newRetryCount = webhook.retryCount + 1;

    // Check if we should retry
    if (attempt < webhook.maxRetries) {
      // Schedule retry with exponential backoff
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds

      setTimeout(() => {
        this.executeWebHook(webhook, event, data, attempt + 1);
      }, delayMs);

      await webhook.update({
        retryCount: newRetryCount,
        lastFailureAt: new Date(),
        failureCount: newFailureCount,
      });
    } else {
      // Max retries exceeded - mark as failed
      await webhook.update({
        status: 'failed',
        retryCount: 0,
        lastFailureAt: new Date(),
        failureCount: newFailureCount,
      });
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: WebHookPayload, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Test a webhook by sending a test payload
   */
  async testWebHook(webhookId: number): Promise<{ success: boolean; message: string; statusCode?: number }> {
    const webhook = await WebHook.findByPk(webhookId);
    if (!webhook) {
      return { success: false, message: 'Webhook not found' };
    }

    const testPayload: WebHookPayload = {
      event: 'sensor.data' as WebHookEvent,
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook from Grow Monitoring System',
      },
    };

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'GrowMonitoring-WebHook/1.0',
        ...webhook.headers,
      };

      if (webhook.secret) {
        const signature = this.generateSignature(testPayload, webhook.secret);
        headers['X-Webhook-Signature'] = signature;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), webhook.timeoutMs);

      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers,
        body: webhook.method !== 'GET' ? JSON.stringify(testPayload) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      return {
        success: response.ok,
        message: response.ok ? 'Test webhook sent successfully' : `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send test webhook',
      };
    }
  }

  /**
   * Get webhook statistics
   */
  async getStatistics(webhookId: number): Promise<{
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    recentLogs: any[];
  } | null> {
    const webhook = await WebHook.findByPk(webhookId);
    if (!webhook) {
      return null;
    }

    const logs = await WebHookLog.findAll({
      where: { webhookId },
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    const totalExecutions = logs.length;
    const successCount = logs.filter((log) => log.success).length;
    const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;
    const averageDuration = totalExecutions > 0 ? logs.reduce((sum, log) => sum + log.durationMs, 0) / totalExecutions : 0;

    return {
      totalExecutions,
      successRate,
      averageDuration,
      recentLogs: logs.slice(0, 10).map((log) => ({
        id: log.id,
        event: log.event,
        success: log.success,
        statusCode: log.statusCode,
        errorMessage: log.errorMessage,
        durationMs: log.durationMs,
        attempt: log.attempt,
        createdAt: log.createdAt,
      })),
    };
  }

  /**
   * Reset failed webhook to active status
   */
  async resetWebHook(webhookId: number): Promise<boolean> {
    const webhook = await WebHook.findByPk(webhookId);
    if (!webhook) {
      return false;
    }

    await webhook.update({
      status: 'active',
      retryCount: 0,
    });

    return true;
  }

  /**
   * Clean up old webhook logs (keep last 30 days)
   */
  async cleanupLogs(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await WebHookLog.destroy({
      where: {
        createdAt: {
          $lt: cutoffDate,
        },
      },
    });

    return result;
  }
}

export const webhookService = new WebHookService();
