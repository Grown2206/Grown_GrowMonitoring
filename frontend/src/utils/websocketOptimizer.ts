/**
 * WebSocket optimization utilities
 */

interface MessageQueueItem {
  type: string;
  data: any;
  timestamp: number;
}

export class WebSocketOptimizer {
  private messageQueue: MessageQueueItem[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_INTERVAL = 100; // ms
  private readonly MAX_QUEUE_SIZE = 50;

  /**
   * Batch similar messages together
   */
  queueMessage(type: string, data: any) {
    this.messageQueue.push({
      type,
      data,
      timestamp: Date.now(),
    });

    // If queue is full, flush immediately
    if (this.messageQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    }

    // Set up automatic flush if not already set
    if (!this.flushInterval) {
      this.flushInterval = setInterval(() => {
        this.flush();
      }, this.BATCH_INTERVAL);
    }
  }

  /**
   * Flush queued messages
   */
  flush(): MessageQueueItem[] {
    const messages = [...this.messageQueue];
    this.messageQueue = [];

    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    return messages;
  }

  /**
   * Stop the optimizer
   */
  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.messageQueue = [];
  }
}

/**
 * Throttle WebSocket message handlers
 */
export class MessageThrottler {
  private lastProcessed: Map<string, number> = new Map();
  private readonly throttleTime: number;

  constructor(throttleTimeMs: number = 50) {
    this.throttleTime = throttleTimeMs;
  }

  /**
   * Check if message should be processed
   */
  shouldProcess(messageType: string): boolean {
    const now = Date.now();
    const last = this.lastProcessed.get(messageType) || 0;

    if (now - last >= this.throttleTime) {
      this.lastProcessed.set(messageType, now);
      return true;
    }

    return false;
  }

  /**
   * Reset throttle for a message type
   */
  reset(messageType: string) {
    this.lastProcessed.delete(messageType);
  }

  /**
   * Clear all throttles
   */
  clear() {
    this.lastProcessed.clear();
  }
}

/**
 * Deduplicate messages within a time window
 */
export class MessageDeduplicator {
  private seenMessages: Map<string, number> = new Map();
  private readonly windowMs: number;

  constructor(windowMs: number = 1000) {
    this.windowMs = windowMs;
  }

  /**
   * Check if message is duplicate
   */
  isDuplicate(messageKey: string): boolean {
    const now = Date.now();
    const lastSeen = this.seenMessages.get(messageKey);

    if (lastSeen && now - lastSeen < this.windowMs) {
      return true;
    }

    this.seenMessages.set(messageKey, now);
    this.cleanup();
    return false;
  }

  /**
   * Clean up old entries
   */
  private cleanup() {
    const now = Date.now();
    const toDelete: string[] = [];

    this.seenMessages.forEach((timestamp, key) => {
      if (now - timestamp > this.windowMs * 2) {
        toDelete.push(key);
      }
    });

    toDelete.forEach((key) => this.seenMessages.delete(key));
  }

  /**
   * Clear all seen messages
   */
  clear() {
    this.seenMessages.clear();
  }
}
