/**
 * Centralized logging utility for BLAQMART
 * Supports different log levels and structured logging
 * In production, integrate with services like Sentry, LogRocket, or Datadog
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Pretty print in development
      return JSON.stringify(entry, null, 2);
    }
    // Single line JSON in production for parsing
    return JSON.stringify(entry);
  }

  /**
   * Create log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  /**
   * Log at different levels
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      const entry = this.createEntry('debug', message, context);
      console.log(this.formatLog(entry));
    }
  }

  info(message: string, context?: LogContext) {
    const entry = this.createEntry('info', message, context);
    console.log(this.formatLog(entry));
  }

  warn(message: string, context?: LogContext) {
    const entry = this.createEntry('warn', message, context);
    console.warn(this.formatLog(entry));
  }

  error(message: string, error?: Error, context?: LogContext) {
    const entry = this.createEntry('error', message, context, error);
    console.error(this.formatLog(entry));

    // In production, send to error tracking service
    if (!this.isDevelopment && typeof window === 'undefined') {
      this.sendToErrorTracking(entry);
    }
  }

  fatal(message: string, error?: Error, context?: LogContext) {
    const entry = this.createEntry('fatal', message, context, error);
    console.error(this.formatLog(entry));

    // Always send fatal errors to tracking
    if (typeof window === 'undefined') {
      this.sendToErrorTracking(entry);
    }
  }

  /**
   * Send to error tracking service (e.g., Sentry)
   */
  private sendToErrorTracking(entry: LogEntry) {
    // TODO: Integrate with error tracking service
    // Example with Sentry:
    // Sentry.captureException(entry.error, {
    //   level: entry.level,
    //   extra: entry.context,
    // });

    // For now, just ensure it's logged
    console.error('[ERROR TRACKING]', entry);
  }

  /**
   * Log API request
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ) {
    const message = `${method} ${path} ${statusCode} ${duration}ms`;
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    const entry = this.createEntry(level, message, {
      ...context,
      method,
      path,
      statusCode,
      duration,
    });

    console.log(this.formatLog(entry));
  }

  /**
   * Log database query (for debugging performance)
   */
  logQuery(query: string, duration: number, context?: LogContext) {
    if (this.isDevelopment) {
      const message = `DB Query: ${duration}ms`;
      const entry = this.createEntry('debug', message, {
        ...context,
        query: query.substring(0, 200), // Truncate long queries
        duration,
      });
      console.log(this.formatLog(entry));
    }
  }

  /**
   * Log business event (e.g., order created, payment processed)
   */
  logEvent(eventName: string, data?: Record<string, any>) {
    const message = `Event: ${eventName}`;
    const entry = this.createEntry('info', message, { eventName, ...data });
    console.log(this.formatLog(entry));

    // Send to analytics/monitoring
    if (!this.isDevelopment && typeof window === 'undefined') {
      // TODO: Send to analytics service
    }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Helper to extract context from Next.js request
 */
export function getRequestContext(request: Request): LogContext {
  return {
    path: new URL(request.url).pathname,
    method: request.method,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

/**
 * Wrapper for async route handlers with automatic error logging
 */
export function withErrorLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  handlerName: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      logger.error(
        `Unhandled error in ${handlerName}`,
        error instanceof Error ? error : new Error(String(error)),
        { handlerName }
      );
      throw error;
    }
  };
}

/**
 * Example usage:
 *
 * import { logger, getRequestContext } from '@/lib/logger';
 *
 * export async function POST(request: NextRequest) {
 *   const context = getRequestContext(request);
 *
 *   try {
 *     logger.info('Creating order', { ...context, userId: user.id });
 *     // ... handle request
 *     logger.logEvent('order_created', { orderId, total });
 *   } catch (error) {
 *     logger.error('Failed to create order', error as Error, context);
 *     throw error;
 *   }
 * }
 */
