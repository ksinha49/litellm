/**
 * Development-only logger utility
 *
 * Use this instead of console.log for debugging.
 * Logs are automatically disabled in production builds.
 *
 * IMPORTANT: Never log sensitive data like tokens, passwords, or PII
 * even in development mode.
 */

const isDevelopment = process.env.NODE_ENV === "development";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  /** Context/component name for the log */
  context?: string;
}

/**
 * Creates a scoped logger for a component or module
 * @param context - Name of the component/module for log prefixing
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, ...args: unknown[]) =>
      logger.debug(message, ...args, { context }),
    info: (message: string, ...args: unknown[]) =>
      logger.info(message, ...args, { context }),
    warn: (message: string, ...args: unknown[]) =>
      logger.warn(message, ...args, { context }),
    error: (message: string, ...args: unknown[]) =>
      logger.error(message, ...args, { context }),
  };
}

function formatMessage(level: LogLevel, message: string, options?: LoggerOptions): string {
  const timestamp = new Date().toISOString();
  const prefix = options?.context ? `[${options.context}]` : "";
  return `${timestamp} ${level.toUpperCase()} ${prefix} ${message}`;
}

/**
 * Logger that only outputs in development mode
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.debug('Component mounted');
 *   logger.info('User action', { action: 'click' });
 *   logger.warn('Deprecation warning');
 *   logger.error('Failed to fetch', error);
 */
export const logger = {
  /**
   * Debug-level logging (development only)
   * Use for detailed debugging information
   */
  debug(message: string, ...args: unknown[]) {
    if (isDevelopment) {
      const options = typeof args[args.length - 1] === "object" &&
                      args[args.length - 1] !== null &&
                      "context" in (args[args.length - 1] as object)
        ? args.pop() as LoggerOptions
        : undefined;
      console.log(formatMessage("debug", message, options), ...args);
    }
  },

  /**
   * Info-level logging (development only)
   * Use for general operational information
   */
  info(message: string, ...args: unknown[]) {
    if (isDevelopment) {
      const options = typeof args[args.length - 1] === "object" &&
                      args[args.length - 1] !== null &&
                      "context" in (args[args.length - 1] as object)
        ? args.pop() as LoggerOptions
        : undefined;
      console.info(formatMessage("info", message, options), ...args);
    }
  },

  /**
   * Warning-level logging (development only)
   * Use for potentially problematic situations
   */
  warn(message: string, ...args: unknown[]) {
    if (isDevelopment) {
      const options = typeof args[args.length - 1] === "object" &&
                      args[args.length - 1] !== null &&
                      "context" in (args[args.length - 1] as object)
        ? args.pop() as LoggerOptions
        : undefined;
      console.warn(formatMessage("warn", message, options), ...args);
    }
  },

  /**
   * Error-level logging (always enabled)
   * Use for errors that need attention - these are NOT suppressed in production
   * because error visibility is critical for debugging production issues
   */
  error(message: string, ...args: unknown[]) {
    // Errors are always logged, even in production
    const options = typeof args[args.length - 1] === "object" &&
                    args[args.length - 1] !== null &&
                    "context" in (args[args.length - 1] as object)
      ? args.pop() as LoggerOptions
      : undefined;
    console.error(formatMessage("error", message, options), ...args);
  },
};

export default logger;
