/**
 * General Formatting Utility Functions
 *
 * Centralized formatting utilities for values, strings, and numbers.
 */

/**
 * Safely convert a value to a display string
 * Handles null, undefined, objects, and primitive types
 *
 * @param value - Any value to format
 * @param fallback - Value to return for null/undefined (default: '')
 */
export function formatValue(value: unknown, fallback = ''): string {
  if (value == null) return fallback
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return fallback
}

/**
 * Convert value to a comparable string for sorting
 * Handles objects by stringifying them
 *
 * @param value - Any value to convert
 */
export function toComparableString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return ''
}

/**
 * Truncate a string to a maximum length with ellipsis
 *
 * @param value - String to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 */
export function truncate(value: string, maxLength: number, suffix = '...'): string {
  if (value.length <= maxLength) return value
  return value.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalize the first letter of a string
 *
 * @param value - String to capitalize
 */
export function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

/**
 * Convert a string to title case
 *
 * @param value - String to convert
 */
export function toTitleCase(value: string): string {
  if (!value) return value
  return value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format a number with thousand separators
 *
 * @param value - Number to format
 * @param locale - Locale for formatting (default: 'en-GB')
 */
export function formatNumber(value: number, locale = 'en-GB'): string {
  return value.toLocaleString(locale)
}

/**
 * Format a number as currency
 *
 * @param value - Number to format
 * @param currency - Currency code (default: 'EUR')
 * @param locale - Locale for formatting (default: 'en-GB')
 */
export function formatCurrency(
  value: number,
  currency = 'EUR',
  locale = 'en-GB'
): string {
  return value.toLocaleString(locale, {
    style: 'currency',
    currency,
  })
}

/**
 * Format a number as percentage
 *
 * @param value - Number to format (0-1 or 0-100 based on isDecimal)
 * @param decimals - Number of decimal places (default: 0)
 * @param isDecimal - Whether the value is a decimal (0-1) or percentage (0-100)
 */
export function formatPercentage(
  value: number,
  decimals = 0,
  isDecimal = true
): string {
  const percentage = isDecimal ? value * 100 : value
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Format bytes to human readable string
 *
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}
