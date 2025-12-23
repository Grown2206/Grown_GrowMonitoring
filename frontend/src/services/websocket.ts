import { SensorData, Relay } from '../types';
import { MessageThrottler, MessageDeduplicator } from '../utils/websocketOptimizer';

type MessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectDelay = 3000;
  private url: string;
  private throttler: MessageThrottler;
  private deduplicator: MessageDeduplicator;
  private messageBuffer: any[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private readonly BUFFER_DELAY = 50; // ms

  constructor() {
    this.url = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws';
    this.throttler = new MessageThrottler(100); // 100ms throttle
    this.deduplicator = new MessageDeduplicator(500); // 500ms dedup window
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('✓ WebSocket connected');
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('✗ WebSocket disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect();
    }, this.reconnectDelay);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Clear optimization caches
    this.throttler.clear();
    this.deduplicator.clear();
    this.messageBuffer = [];
  }

  private handleMessage(message: any) {
    const { type, data } = message;

    // Create a unique key for deduplication
    const messageKey = `${type}_${JSON.stringify(data).substring(0, 100)}`;

    // Skip duplicate messages
    if (this.deduplicator.isDuplicate(messageKey)) {
      return;
    }

    // Check if we should throttle this message type
    if (!this.throttler.shouldProcess(type)) {
      // Buffer the message for later processing
      this.bufferMessage(message);
      return;
    }

    this.processMessage(message);
  }

  private bufferMessage(message: any) {
    this.messageBuffer.push(message);

    // Flush buffer after delay
    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => {
        this.flushBuffer();
      }, this.BUFFER_DELAY);
    }
  }

  private flushBuffer() {
    if (this.messageBuffer.length > 0) {
      // Process only the most recent message of each type
      const latestByType = new Map<string, any>();

      this.messageBuffer.forEach((msg) => {
        latestByType.set(msg.type, msg);
      });

      latestByType.forEach((msg) => {
        this.processMessage(msg);
      });

      this.messageBuffer = [];
    }

    this.flushTimeout = null;
  }

  private processMessage(message: any) {
    const { type, data } = message;
    const handlers = this.handlers.get(type);

    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in handler for ${type}:`, error);
        }
      });
    }

    // Also call 'all' handlers
    const allHandlers = this.handlers.get('all');
    if (allHandlers) {
      allHandlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in all handler:', error);
        }
      });
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  off(type: string, handler: MessageHandler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  send(type: string, data?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  controlRelay(relayId: number, status: boolean) {
    this.send('control_relay', { relayId, status });
  }

  controlPump(pumpId: number, action: string, duration?: number) {
    this.send('control_pump', { pumpId, action, duration });
  }

  getCurrentData() {
    this.send('get_current_data');
  }
}

export const wsService = new WebSocketService();
