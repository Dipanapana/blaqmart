/**
 * Centralized Logger Utility
 *
 * Provides consistent logging across the application.
 * In production, can be extended to send logs to external services.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogMeta {
  [key: string]: unknown
}

const isDev = process.env.NODE_ENV === 'development'

function formatMessage(level: LogLevel, context: string, message: string, meta?: LogMeta): string {
  const timestamp = new Date().toISOString()
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}${metaStr}`
}

export const logger = {
  /**
   * Debug level - only shown in development
   */
  debug: (context: string, message: string, meta?: LogMeta) => {
    if (isDev) {
      console.log(formatMessage('debug', context, message, meta))
    }
  },

  /**
   * Info level - general information
   */
  info: (context: string, message: string, meta?: LogMeta) => {
    console.log(formatMessage('info', context, message, meta))
  },

  /**
   * Warning level - non-critical issues
   */
  warn: (context: string, message: string, meta?: LogMeta) => {
    console.warn(formatMessage('warn', context, message, meta))
  },

  /**
   * Error level - critical issues
   */
  error: (context: string, error: unknown, meta?: LogMeta) => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error(formatMessage('error', context, errorMessage, {
      ...meta,
      stack: errorStack,
    }))

    // In production, you might want to send to an error tracking service
    // if (!isDev) {
    //   sendToErrorTracker(context, error, meta)
    // }
  },

  /**
   * Log API request/response for debugging
   */
  api: (
    method: string,
    path: string,
    status: number,
    durationMs?: number,
    meta?: LogMeta
  ) => {
    const level = status >= 400 ? 'error' : 'info'
    const message = `${method} ${path} ${status}${durationMs ? ` (${durationMs}ms)` : ''}`
    console[level === 'error' ? 'error' : 'log'](
      formatMessage(level, 'API', message, meta)
    )
  },

  /**
   * Log payment events
   */
  payment: (event: string, provider: string, meta?: LogMeta) => {
    logger.info('Payment', `[${provider}] ${event}`, meta)
  },

  /**
   * Log order events
   */
  order: (event: string, orderId: string, meta?: LogMeta) => {
    logger.info('Order', `${event} - ${orderId}`, meta)
  },
}

export default logger
