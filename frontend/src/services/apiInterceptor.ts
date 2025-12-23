import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { errorLogger, ErrorSeverity } from './errorLogger';

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

/**
 * Configure API error handling and retry logic
 */
export function setupApiInterceptors(api: AxiosInstance) {
  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryConfig;

      // Handle network errors
      if (!error.response) {
        errorLogger.logNetworkError(error);
        return handleNetworkError(error, config, api);
      }

      // Handle HTTP errors
      const status = error.response.status;

      switch (status) {
        case 401:
          return handleUnauthorized(error);
        case 403:
          return handleForbidden(error);
        case 404:
          return handleNotFound(error);
        case 429:
          return handleRateLimit(error, config, api);
        case 500:
        case 502:
        case 503:
        case 504:
          return handleServerError(error, config, api);
        default:
          logApiError(error);
          return Promise.reject(error);
      }
    }
  );
}

/**
 * Handle network errors with retry
 */
async function handleNetworkError(
  error: AxiosError,
  config: RetryConfig,
  api: AxiosInstance
): Promise<any> {
  const maxRetries = 3;
  const retryDelay = 1000;

  config._retryCount = config._retryCount || 0;

  if (config._retryCount < maxRetries) {
    config._retryCount++;
    console.log(`Retrying request (${config._retryCount}/${maxRetries})...`);

    await delay(retryDelay * config._retryCount);
    return api.request(config);
  }

  errorLogger.logError({
    severity: ErrorSeverity.HIGH,
    message: 'Network error after retries',
    context: {
      url: config.url,
      retries: config._retryCount,
    },
  });

  return Promise.reject(error);
}

/**
 * Handle 401 Unauthorized
 */
function handleUnauthorized(error: AxiosError): Promise<any> {
  console.warn('Unauthorized - redirecting to login');

  // Clear auth data
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Redirect to login
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }

  errorLogger.logError({
    severity: ErrorSeverity.MEDIUM,
    message: 'Unauthorized access attempt',
    context: {
      url: error.config?.url,
    },
  });

  return Promise.reject(error);
}

/**
 * Handle 403 Forbidden
 */
function handleForbidden(error: AxiosError): Promise<any> {
  errorLogger.logError({
    severity: ErrorSeverity.MEDIUM,
    message: 'Access forbidden',
    context: {
      url: error.config?.url,
    },
  });

  return Promise.reject(error);
}

/**
 * Handle 404 Not Found
 */
function handleNotFound(error: AxiosError): Promise<any> {
  errorLogger.logError({
    severity: ErrorSeverity.LOW,
    message: 'Resource not found',
    context: {
      url: error.config?.url,
    },
  });

  return Promise.reject(error);
}

/**
 * Handle 429 Rate Limit with retry
 */
async function handleRateLimit(
  error: AxiosError,
  config: RetryConfig,
  api: AxiosInstance
): Promise<any> {
  const retryAfter = error.response?.headers['retry-after'];
  const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

  errorLogger.logError({
    severity: ErrorSeverity.MEDIUM,
    message: 'Rate limit exceeded',
    context: {
      url: config.url,
      retryAfter: delay,
    },
  });

  console.log(`Rate limited. Retrying after ${delay}ms...`);
  await new Promise((resolve) => setTimeout(resolve, delay));

  return api.request(config);
}

/**
 * Handle 5xx Server Errors with retry
 */
async function handleServerError(
  error: AxiosError,
  config: RetryConfig,
  api: AxiosInstance
): Promise<any> {
  const maxRetries = 2;
  const retryDelay = 2000;

  config._retryCount = config._retryCount || 0;

  if (config._retryCount < maxRetries) {
    config._retryCount++;
    console.log(`Server error. Retrying (${config._retryCount}/${maxRetries})...`);

    await delay(retryDelay * config._retryCount);
    return api.request(config);
  }

  errorLogger.logError({
    severity: ErrorSeverity.HIGH,
    message: `Server error: ${error.response?.status}`,
    context: {
      url: config.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    },
  });

  return Promise.reject(error);
}

/**
 * Log API errors
 */
function logApiError(error: AxiosError) {
  const config = error.config;
  const response = error.response;

  errorLogger.logApiError(
    error,
    config?.url || 'unknown',
    config?.method?.toUpperCase() || 'UNKNOWN'
  );
}

/**
 * Delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AxiosError): boolean {
  if (!error.response) {
    return true; // Network errors are retryable
  }

  const status = error.response.status;
  return status === 429 || status >= 500;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (!error.response) {
    return 'Netzwerkfehler: Verbindung zum Server konnte nicht hergestellt werden.';
  }

  const status = error.response.status;

  switch (status) {
    case 400:
      return error.response.data?.message || 'Ungültige Anfrage.';
    case 401:
      return 'Nicht autorisiert. Bitte melden Sie sich an.';
    case 403:
      return 'Zugriff verweigert. Sie haben keine Berechtigung für diese Aktion.';
    case 404:
      return 'Die angeforderte Ressource wurde nicht gefunden.';
    case 429:
      return 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
    case 500:
      return 'Serverfehler. Bitte versuchen Sie es später erneut.';
    case 502:
      return 'Bad Gateway. Der Server ist vorübergehend nicht erreichbar.';
    case 503:
      return 'Service nicht verfügbar. Der Server ist überlastet.';
    case 504:
      return 'Gateway Timeout. Die Anfrage dauerte zu lange.';
    default:
      return error.response.data?.message || 'Ein unerwarteter Fehler ist aufgetreten.';
  }
}
