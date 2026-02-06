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
import { LogLevel } from '@/types/logging'

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
  [LogLevel.debug]: 0,
  [LogLevel.info]: 1,
  [LogLevel.warn]: 2,
  [LogLevel.error]: 3,
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.debug]: 'DEBUG',
  [LogLevel.info]: 'INFO ',
  [LogLevel.warn]: 'WARN ',
  [LogLevel.error]: 'ERROR',
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
    if (!this.config.enabled) {
      return false
    }
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
  private output(level: LogLevel, context: string, message: string, data?: unknown): void {
    const writeJsonToStderr = (obj: unknown) => {
      const line = `${JSON.stringify(obj)}\n`
      try {
        process.stderr.write(line)
      } catch {
        // fallback 
        console.info(line)
      }
    }

    const writeJsonToStdout = (obj: unknown) => {
      const line = `${JSON.stringify(obj)}\n`
      console.info(line)
    }

    const writeTextToStderr = (text: string, extra?: unknown) => {
      try {
        const extraStr = extra ? ` ${JSON.stringify(extra)}` : ''
        process.stderr.write(`${text}${extraStr}\n`)
      } catch {
        // fallback
        console.info(text, extra)
      }
    }

    const writeTextToStdout = (text: string, extra?: unknown) => {
      if (extra === undefined) {
        console.info(text)
      } else {
        console.info(text, JSON.stringify(extra))
      }
    }

    if (this.config.jsonFormat) {
      const entry = this.buildLogEntry(level, context, message, data)
      // send errors to stderr, others to stdout via console.info
      if (level === 'error') {
        writeJsonToStderr(entry)
      } else {
        writeJsonToStdout(entry)
      }
    } else {
      const formattedMessage = this.formatMessage(level, context, message)
      if (level === 'error') {
        writeTextToStderr(formattedMessage, data)
      } else {
        writeTextToStdout(formattedMessage, data)
      }
    }
  }

  /**
   * Debug level - for development debugging information
   * Only shows in development by default
   */
  debug(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.debug)) {
      return
    }
    this.output(LogLevel.debug, context, message, data)
  }

  /**
   * Info level - for general information
   */
  info(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.info)) {
      return
    }
    this.output(LogLevel.info, context, message, data)
  }

  /**
   * Warn level - for warnings that don't break functionality
   */
  warn(context: string, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.warn)) {
      return
    }
    this.output(LogLevel.warn, context, message, data)
  }

  /**
   * Error level - for errors that need attention
   * Always logs in development, conditionally in production
   */
  error(context: string, message: string, error?: unknown): void {
    if (!this.shouldLog(LogLevel.error)) {
      return
    }
    this.output(LogLevel.error, context, message, error)
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
export type { LoggerConfig, UserContext, LogEntry }
export { LogLevel } from '@/types/logging'
