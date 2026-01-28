/**
 * Date Utility Functions
 *
 * Centralized date formatting and parsing utilities used across the application.
 */

/**
 * Default end date - Oracle's conventional "end of time" date
 * Used for records that should remain effective indefinitely
 */
export const DEFAULT_END_DATE = '4712-12-31'

/**
 * Get current date formatted for HTML date input (YYYY-MM-DD)
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Check if a Date object is valid
 */
export function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime())
}

/**
 * Parse a value to a Date object safely
 * Returns null if the value cannot be parsed to a valid date
 */
export function parseDate(value: unknown): Date | null {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return isValidDate(date) ? date : null
  }

  return null
}

/**
 * Format date for display in tables and UI
 * Returns format like "28 Dec 2025"
 *
 * @param value - Date string, Date object, or timestamp
 * @param fallback - Value to return if date is invalid (default: '-')
 */
export function formatDisplayDate(value: unknown, fallback = '-'): string {
  const date = parseDate(value)

  if (!date) {
    return fallback
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Format date for HTML date input (YYYY-MM-DD)
 *
 * @param value - Date string, Date object, or timestamp
 * @param fallback - Value to return if date is invalid (default: '')
 */
export function formatInputDate(value: unknown, fallback = ''): string {
  const date = parseDate(value)

  if (!date) {
    return fallback
  }

  return date.toISOString().split('T')[0]
}

/**
 * Format date with time for display
 * Returns format like "28 Dec 2025, 14:30"
 *
 * @param value - Date string, Date object, or timestamp
 * @param fallback - Value to return if date is invalid (default: '-')
 */
export function formatDisplayDateTime(value: unknown, fallback = '-'): string {
  const date = parseDate(value)

  if (!date) {
    return fallback
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

/**
 * Format date as ISO string for API requests
 *
 * @param value - Date string, Date object, or timestamp
 * @param fallback - Value to return if date is invalid (default: '')
 */
export function formatISODate(value: unknown, fallback = ''): string {
  const date = parseDate(value)

  if (!date) {
    return fallback
  }

  return date.toISOString()
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 *
 * @param value - Date string, Date object, or timestamp
 * @param fallback - Value to return if date is invalid (default: '-')
 */
export function formatRelativeTime(value: unknown, fallback = '-'): string {
  const date = parseDate(value)

  if (!date) {
    return fallback
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return 'Just now'
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return formatDisplayDate(date, fallback)
}
