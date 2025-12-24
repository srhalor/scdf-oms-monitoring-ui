/**
 * Centralized logging service for the OMS Monitoring UI application.
 *
 * Features:
 * - Conditionally enabled based on environment
 * - Structured log levels (debug, info, warn, error)
 * - Context tagging for easier debugging
 * - Production-safe (no-op in production unless explicitly enabled)
 *
 * Usage:
 * ```typescript
 * import { logger } from '@lib/logger'
 *
 * logger.debug('HealthCard', 'Fetching health status')
 * logger.info('Auth', 'User logged in', { userId: '123' })
 * logger.warn('Button', 'Missing label prop')
 * logger.error('API', 'Request failed', error)
 * ```
 */

import { ENV_CONFIG } from '@/config/env.config'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  minLevel: LogLevel
  includeTimestamp: boolean
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const DEFAULT_CONFIG: LoggerConfig = {
  enabled: ENV_CONFIG.logging.enabled,
  minLevel: ENV_CONFIG.logging.minLevel,
  includeTimestamp: ENV_CONFIG.logging.includeTimestamp,
}

class Logger {
  private config: LoggerConfig

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
  }

  private formatMessage(context: string, message: string): string {
    const timestamp = this.config.includeTimestamp
      ? `[${new Date().toISOString()}] `
      : ''
    return `${timestamp}[${context}] ${message}`
  }

  /**
   * Debug level - for development debugging information
   * Only shows in development by default
   */
  debug(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog('debug')) return
    const formattedMessage = this.formatMessage(context, message)
    if (data === undefined) {
      console.debug(formattedMessage)
    } else {
      console.debug(formattedMessage, data)
    }
  }

  /**
   * Info level - for general information
   */
  info(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog('info')) return
    const formattedMessage = this.formatMessage(context, message)
    if (data === undefined) {
      console.info(formattedMessage)
    } else {
      console.info(formattedMessage, data)
    }
  }

  /**
   * Warn level - for warnings that don't break functionality
   */
  warn(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) return
    const formattedMessage = this.formatMessage(context, message)
    if (data === undefined) {
      console.warn(formattedMessage)
    } else {
      console.warn(formattedMessage, data)
    }
  }

  /**
   * Error level - for errors that need attention
   * Always logs in development, conditionally in production
   */
  error(context: string, message: string, error?: unknown): void {
    if (!this.shouldLog('error')) return
    const formattedMessage = this.formatMessage(context, message)
    if (error === undefined) {
      console.error(formattedMessage)
    } else {
      console.error(formattedMessage, error)
    }
  }

  /**
   * Configure the logger at runtime
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level
  }
}

// Export singleton instance
export const logger = new Logger()

// Export class for testing or custom instances
export { Logger }
export type { LogLevel, LoggerConfig }
