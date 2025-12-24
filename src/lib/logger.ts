/**
 * Centralized logging service for the OMS Monitoring UI application.
 *
 * Features:
 * - Conditionally enabled based on environment
 * - Structured log levels (debug, info, warn, error)
 * - Context tagging for easier debugging
 * - User context tracking for audit trails
 * - JSON structured format for ELK/log aggregation systems
 * - Production-safe (no-op in production unless explicitly enabled)
 *
 * Usage:
 * ```typescript
 * import { logger } from '@lib/logger'
 *
 * // Set user context after login
 * logger.setUser({ name: 'John Doe', email: 'john@example.com' })
 *
 * logger.debug('HealthCard', 'Fetching health status')
 * logger.info('Auth', 'User logged in', { userId: '123' })
 * logger.warn('Button', 'Missing label prop')
 * logger.error('API', 'Request failed', error)
 *
 * // Clear user context on logout
 * logger.clearUser()
 * ```
 *
 * JSON Format (for ELK):
 * Set NEXT_PUBLIC_LOG_FORMAT=json to enable structured JSON output:
 * {"@timestamp":"2025-01-24T10:30:45.123Z","level":"info","context":"Auth","message":"User logged in","user":{"name":"John"},"data":{...}}
 */

import { ENV_CONFIG } from '@/config/env.config'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface UserContext {
  name?: string
  email?: string
  id?: string
}

interface LoggerConfig {
  enabled: boolean
  minLevel: LogLevel
  includeTimestamp: boolean
  includeLevel: boolean
  includeUser: boolean
  jsonFormat: boolean // Enable JSON structured output for ELK
}

/**
 * Structured log entry for JSON format (ELK-compatible)
 * Uses @timestamp for Elasticsearch default timestamp field
 */
interface LogEntry {
  '@timestamp': string
  level: string
  context: string
  message: string
  user?: UserContext
  data?: unknown
  error?: {
    name: string
    message: string
    stack?: string
  }
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERROR',
}

const DEFAULT_CONFIG: LoggerConfig = {
  enabled: ENV_CONFIG.logging.enabled,
  minLevel: ENV_CONFIG.logging.minLevel,
  includeTimestamp: ENV_CONFIG.logging.includeTimestamp,
  includeLevel: true,
  includeUser: true,
  jsonFormat: ENV_CONFIG.logging.jsonFormat,
}

class Logger {
  private config: LoggerConfig
  private userContext: UserContext | null = null

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Set the current user context for logging
   * Call this after successful authentication
   */
  setUser(user: UserContext): void {
    this.userContext = user
  }

  /**
   * Clear the user context
   * Call this on logout
   */
  clearUser(): void {
    this.userContext = null
  }

  /**
   * Get current user display string
   */
  private getUserString(): string {
    if (!this.config.includeUser || !this.userContext) {
      return ''
    }
    const identifier = this.userContext.name || this.userContext.email || this.userContext.id || 'anonymous'
    return `[user:${identifier}] `
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
  }

  /**
   * Serialize error objects for JSON logging
   */
  private serializeError(error: unknown): LogEntry['error'] | undefined {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }
    if (error !== undefined && error !== null) {
      // Handle non-Error values: objects get JSON.stringify, primitives handled individually
      let message: string
      switch (typeof error) {
        case 'object':
          message = JSON.stringify(error)
          break
        case 'string':
          message = error
          break
        case 'number':
        case 'boolean':
        case 'bigint':
          message = error.toString()
          break
        case 'symbol':
          message = error.toString()
          break
        default:
          message = 'Unknown error type'
      }
      return {
        name: 'UnknownError',
        message,
      }
    }
    return undefined
  }

  /**
   * Build a structured log entry for JSON output
   */
  private buildLogEntry(level: LogLevel, context: string, message: string, data?: unknown): LogEntry {
    const entry: LogEntry = {
      '@timestamp': new Date().toISOString(),
      level: LEVEL_LABELS[level].trim().toLowerCase(),
      context,
      message,
    }

    if (this.config.includeUser && this.userContext) {
      entry.user = { ...this.userContext }
    }

    // Handle error objects specially
    if (data instanceof Error) {
      entry.error = this.serializeError(data)
    } else if (data !== undefined) {
      entry.data = data
    }

    return entry
  }

  /**
   * Format message for text output (human-readable)
   */
  private formatMessage(level: LogLevel, context: string, message: string): string {
    const parts: string[] = []
    
    // Build all parts
    if (this.config.includeTimestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }
    
    if (this.config.includeLevel) {
      parts.push(`[${LEVEL_LABELS[level]}]`)
    }
    
    const userStr = this.getUserString()
    if (userStr) {
      parts.push(userStr.trim())
    }
    
    // Add context and message
    parts.push(`[${context}]`, message)
    
    return parts.join(' ')
  }

  /**
   * Output log using appropriate format (JSON or text)
   */
  private output(consoleFn: (...args: unknown[]) => void, level: LogLevel, context: string, message: string, data?: unknown): void {
    if (this.config.jsonFormat) {
      // JSON structured output for ELK
      const entry = this.buildLogEntry(level, context, message, data)
      consoleFn(JSON.stringify(entry))
    } else {
      // Human-readable text output
      const formattedMessage = this.formatMessage(level, context, message)
      if (data === undefined) {
        consoleFn(formattedMessage)
      } else {
        consoleFn(formattedMessage, data)
      }
    }
  }

  /**
   * Debug level - for development debugging information
   * Only shows in development by default
   */
  debug(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog('debug')) return
    this.output(console.debug, 'debug', context, message, data)
  }

  /**
   * Info level - for general information
   */
  info(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog('info')) return
    this.output(console.info, 'info', context, message, data)
  }

  /**
   * Warn level - for warnings that don't break functionality
   */
  warn(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) return
    this.output(console.warn, 'warn', context, message, data)
  }

  /**
   * Error level - for errors that need attention
   * Always logs in development, conditionally in production
   */
  error(context: string, message: string, error?: unknown): void {
    if (!this.shouldLog('error')) return
    this.output(console.error, 'error', context, message, error)
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

  /**
   * Enable or disable JSON format output
   * Useful for switching to JSON mode for ELK ingestion
   */
  setJsonFormat(jsonFormat: boolean): void {
    this.config.jsonFormat = jsonFormat
  }

  /**
   * Check if JSON format is enabled
   */
  isJsonFormat(): boolean {
    return this.config.jsonFormat
  }
}

// Export singleton instance
export const logger = new Logger()

// Export class for testing or custom instances
export { Logger }
export type { LogLevel, LoggerConfig, UserContext, LogEntry }
