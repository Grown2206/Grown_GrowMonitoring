export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent: string;
  url: string;
  userId?: string;
}

class ErrorLogger {
  private maxLogs = 50;
  private logs: ErrorLog[] = [];

  constructor() {
    this.loadLogs();
    this.setupGlobalErrorHandler();
  }

  /**
   * Load logs from localStorage
   */
  private loadLogs() {
    try {
      const stored = localStorage.getItem('error_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load error logs:', e);
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveLogs() {
    try {
      localStorage.setItem('error_logs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to save error logs:', e);
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandler() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.logError({
        severity: ErrorSeverity.HIGH,
        message: event.message,
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        severity: ErrorSeverity.HIGH,
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          reason: event.reason,
        },
      });
    });
  }

  /**
   * Log an error
   */
  logError(options: {
    severity: ErrorSeverity;
    message: string;
    stack?: string;
    context?: Record<string, any>;
  }) {
    const log: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      severity: options.severity,
      message: options.message,
      stack: options.stack,
      context: options.context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
    };

    this.logs.unshift(log);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    this.saveLogs();

    // Console output based on severity
    switch (options.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error('[ERROR]', options.message, options.context);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('[WARNING]', options.message, options.context);
        break;
      case ErrorSeverity.LOW:
        console.log('[INFO]', options.message, options.context);
        break;
    }

    // TODO: Send to remote error tracking service
    this.sendToRemote(log);
  }

  /**
   * Log API errors
   */
  logApiError(error: any, endpoint: string, method: string) {
    this.logError({
      severity: ErrorSeverity.MEDIUM,
      message: `API Error: ${method} ${endpoint}`,
      stack: error.stack,
      context: {
        endpoint,
        method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      },
    });
  }

  /**
   * Log network errors
   */
  logNetworkError(error: any) {
    this.logError({
      severity: ErrorSeverity.HIGH,
      message: 'Network Error: Unable to connect to server',
      stack: error.stack,
      context: {
        message: error.message,
      },
    });
  }

  /**
   * Get all logs
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter((log) => log.severity === severity);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user ID from auth context
   */
  private getCurrentUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (e) {
      // Ignore
    }
    return undefined;
  }

  /**
   * Send error to remote tracking service
   */
  private sendToRemote(log: ErrorLog) {
    // TODO: Implement remote error tracking
    // Example: Send to Sentry, LogRocket, or custom backend

    // For now, just log critical errors
    if (log.severity === ErrorSeverity.CRITICAL) {
      console.log('Would send to remote:', log);
    }
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const errorLogger = new ErrorLogger();
