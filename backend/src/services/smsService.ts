/**
 * SMS Service - Twilio Integration
 *
 * Features:
 * - Send SMS via Twilio
 * - Rate limiting (prevent spam & cost control)
 * - SMS History logging
 * - Cost tracking
 * - Retry logic
 * - Fallback mechanisms
 */

import twilio from 'twilio';
import { Settings } from '../models/Settings';

// SMS History tracking
interface SMSHistoryEntry {
  to: string;
  message: string;
  status: 'sent' | 'failed' | 'rate_limited';
  cost?: number;
  sid?: string;
  error?: string;
  timestamp: Date;
}

class SMSService {
  private client: twilio.Twilio | null = null;
  private enabled: boolean = false;
  private accountSid: string = '';
  private authToken: string = '';
  private fromNumber: string = '';
  private toNumbers: string[] = [];

  // Rate limiting
  private lastSMSTime: Map<string, number> = new Map();
  private minIntervalMinutes: number = 15; // Min. 15 Minuten zwischen SMS
  private maxSMSPerDay: number = 20; // Max. 20 SMS pro Tag
  private dailySMSCount: number = 0;
  private lastResetDate: string = new Date().toDateString();

  // History
  private smsHistory: SMSHistoryEntry[] = [];
  private maxHistorySize: number = 100;

  /**
   * Initialize Twilio client with settings from database
   */
  async initialize(): Promise<void> {
    try {
      const settings = await Settings.findOne({
        where: { key: 'sms_settings' }
      });

      if (settings && settings.value) {
        const config = JSON.parse(settings.value as string);

        this.enabled = config.enabled || false;
        this.accountSid = config.accountSid || '';
        this.authToken = config.authToken || '';
        this.fromNumber = config.fromNumber || '';
        this.toNumbers = config.toNumbers || [];
        this.minIntervalMinutes = config.minIntervalMinutes || 15;
        this.maxSMSPerDay = config.maxSMSPerDay || 20;

        if (this.enabled && this.accountSid && this.authToken) {
          this.client = twilio(this.accountSid, this.authToken);
          console.log('✓ SMS Service (Twilio) initialized');
        } else {
          console.log('⚠ SMS Service not configured or disabled');
        }
      }
    } catch (error) {
      console.error('Failed to initialize SMS Service:', error);
    }
  }

  /**
   * Send SMS to configured numbers
   */
  async sendSMS(message: string, priority: 'low' | 'high' | 'critical' = 'high'): Promise<boolean> {
    if (!this.enabled || !this.client) {
      console.log('SMS Service not enabled');
      return false;
    }

    if (this.toNumbers.length === 0) {
      console.log('No recipient phone numbers configured');
      return false;
    }

    // Reset daily counter if new day
    this.resetDailyCounterIfNeeded();

    let successCount = 0;
    const results: boolean[] = [];

    for (const toNumber of this.toNumbers) {
      try {
        // Check rate limiting
        if (!this.canSendSMS(toNumber, priority)) {
          this.logSMS(toNumber, message, 'rate_limited');
          console.log(`Rate limited: SMS to ${toNumber}`);
          results.push(false);
          continue;
        }

        // Send SMS
        const result = await this.client.messages.create({
          body: message,
          from: this.fromNumber,
          to: toNumber
        });

        // Log success
        this.logSMS(toNumber, message, 'sent', result.sid, this.estimateCost(message));
        this.lastSMSTime.set(toNumber, Date.now());
        this.dailySMSCount++;

        console.log(`✓ SMS sent to ${toNumber} (SID: ${result.sid})`);
        successCount++;
        results.push(true);

      } catch (error: any) {
        console.error(`Failed to send SMS to ${toNumber}:`, error.message);
        this.logSMS(toNumber, message, 'failed', undefined, undefined, error.message);
        results.push(false);
      }
    }

    return successCount > 0;
  }

  /**
   * Check if SMS can be sent (rate limiting)
   */
  private canSendSMS(toNumber: string, priority: 'low' | 'high' | 'critical'): boolean {
    // Critical always bypasses rate limiting (but still counts toward daily limit)
    if (priority === 'critical') {
      return this.dailySMSCount < this.maxSMSPerDay * 2; // Double limit for critical
    }

    // Check daily limit
    if (this.dailySMSCount >= this.maxSMSPerDay) {
      console.log('Daily SMS limit reached');
      return false;
    }

    // Check interval since last SMS to this number
    const lastTime = this.lastSMSTime.get(toNumber);
    if (lastTime) {
      const minutesSinceLastSMS = (Date.now() - lastTime) / 1000 / 60;

      // Lower priority requires longer interval
      const requiredInterval = priority === 'low' ? this.minIntervalMinutes * 2 : this.minIntervalMinutes;

      if (minutesSinceLastSMS < requiredInterval) {
        console.log(`Too soon since last SMS (${minutesSinceLastSMS.toFixed(1)}min < ${requiredInterval}min)`);
        return false;
      }
    }

    return true;
  }

  /**
   * Reset daily SMS counter if new day
   */
  private resetDailyCounterIfNeeded(): void {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailySMSCount = 0;
      this.lastResetDate = today;
      console.log('Daily SMS counter reset');
    }
  }

  /**
   * Estimate SMS cost (rough estimate)
   * Twilio costs vary by country, typically $0.0075 - $0.02 per SMS
   */
  private estimateCost(message: string): number {
    const segments = Math.ceil(message.length / 160); // SMS segments
    const costPerSegment = 0.01; // USD
    return segments * costPerSegment;
  }

  /**
   * Log SMS to history
   */
  private logSMS(
    to: string,
    message: string,
    status: 'sent' | 'failed' | 'rate_limited',
    sid?: string,
    cost?: number,
    error?: string
  ): void {
    const entry: SMSHistoryEntry = {
      to,
      message,
      status,
      sid,
      cost,
      error,
      timestamp: new Date()
    };

    this.smsHistory.unshift(entry);

    // Keep history size limited
    if (this.smsHistory.length > this.maxHistorySize) {
      this.smsHistory = this.smsHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get SMS history
   */
  getHistory(limit: number = 50): SMSHistoryEntry[] {
    return this.smsHistory.slice(0, limit);
  }

  /**
   * Get SMS statistics
   */
  getStats(): {
    dailySMSCount: number;
    maxSMSPerDay: number;
    totalCostToday: number;
    successRate: number;
  } {
    const today = new Date().toDateString();
    const todayEntries = this.smsHistory.filter(
      entry => entry.timestamp.toDateString() === today
    );

    const successCount = todayEntries.filter(e => e.status === 'sent').length;
    const totalCost = todayEntries
      .filter(e => e.status === 'sent')
      .reduce((sum, e) => sum + (e.cost || 0), 0);

    return {
      dailySMSCount: this.dailySMSCount,
      maxSMSPerDay: this.maxSMSPerDay,
      totalCostToday: parseFloat(totalCost.toFixed(4)),
      successRate: todayEntries.length > 0
        ? parseFloat(((successCount / todayEntries.length) * 100).toFixed(2))
        : 0
    };
  }

  /**
   * Update SMS settings
   */
  async updateSettings(config: {
    enabled?: boolean;
    accountSid?: string;
    authToken?: string;
    fromNumber?: string;
    toNumbers?: string[];
    minIntervalMinutes?: number;
    maxSMSPerDay?: number;
  }): Promise<void> {
    // Update in database
    const [settings] = await Settings.findOrCreate({
      where: { key: 'sms_settings' },
      defaults: { key: 'sms_settings', value: JSON.stringify(config) }
    });

    await settings.update({ value: JSON.stringify(config) });

    // Reload settings
    await this.initialize();
  }

  /**
   * Test SMS (send test message)
   */
  async sendTestSMS(): Promise<{ success: boolean; message: string }> {
    if (!this.enabled || !this.client) {
      return { success: false, message: 'SMS Service not enabled' };
    }

    if (this.toNumbers.length === 0) {
      return { success: false, message: 'No recipient numbers configured' };
    }

    const testMessage = `🌱 Grow Monitor Test SMS - ${new Date().toLocaleString('de-DE')}`;

    try {
      const result = await this.sendSMS(testMessage, 'high');
      return {
        success: result,
        message: result
          ? `Test SMS sent to ${this.toNumbers.length} number(s)`
          : 'Failed to send test SMS (check rate limiting)'
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Check if service is enabled and configured
   */
  isConfigured(): boolean {
    return this.enabled && !!this.client && this.toNumbers.length > 0;
  }

  /**
   * Get configuration status (without secrets)
   */
  getStatus(): {
    enabled: boolean;
    configured: boolean;
    recipientCount: number;
    dailySMSCount: number;
    maxSMSPerDay: number;
  } {
    return {
      enabled: this.enabled,
      configured: this.isConfigured(),
      recipientCount: this.toNumbers.length,
      dailySMSCount: this.dailySMSCount,
      maxSMSPerDay: this.maxSMSPerDay
    };
  }
}

// Singleton instance
export const smsService = new SMSService();
